// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CeloTip — Onchain Micro-Tipping Platform on Celo
 * @notice Create a tip jar, receive cUSD/USDT/USDC tips from anyone, track your leaderboard rank
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract CeloTip {

    // ── Token addresses (Celo Mainnet) ──────────────────────────────
    address public constant CUSD  = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant USDT  = 0x617f3112bf5397D0467D315cC709EF968D9ba546;
    address public constant USDC  = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C;

    uint256 public constant PLATFORM_FEE_BPS = 100; // 1%
    address public immutable feeRecipient;

    // ── Data structures ─────────────────────────────────────────────
    struct Jar {
        uint256 id;
        address owner;
        string  handle;        // @username style
        string  bio;
        string  avatarEmoji;   // single emoji avatar
        uint256 totalReceived; // in USD terms (18 decimals, cUSD-normalised)
        uint256 tipCount;
        bool    exists;
    }

    struct TipEvent {
        address tipper;
        address jarOwner;
        uint256 jarId;
        address token;
        uint256 amount;
        string  message;
        uint256 timestamp;
    }

    // ── Storage ──────────────────────────────────────────────────────
    uint256 public jarCount;
    mapping(uint256 => Jar)     public jars;
    mapping(address => uint256) public ownerToJar;   // wallet => jarId
    mapping(string  => uint256) public handleToJar;  // handle => jarId
    mapping(address => bool)    public hasJar;

    TipEvent[] public tipHistory;
    mapping(uint256 => TipEvent[]) public jarTips;   // jarId => tips

    // leaderboard helpers
    uint256[] public allJarIds;

    // ── Events ───────────────────────────────────────────────────────
    event JarCreated(uint256 indexed jarId, address indexed owner, string handle);
    event TipSent(
        uint256 indexed jarId,
        address indexed tipper,
        address indexed token,
        uint256 amount,
        string  message
    );
    event Withdrawn(uint256 indexed jarId, address token, uint256 amount);

    // ── Constructor ──────────────────────────────────────────────────
    constructor() {
        feeRecipient = msg.sender;
    }

    // ── Modifiers ────────────────────────────────────────────────────
    modifier validToken(address token) {
        require(token == CUSD || token == USDT || token == USDC, "Bad token");
        _;
    }

    modifier jarOwner(uint256 jarId) {
        require(jars[jarId].owner == msg.sender, "Not jar owner");
        _;
    }

    // ── Core: create jar ─────────────────────────────────────────────
    function createJar(
        string calldata handle,
        string calldata bio,
        string calldata avatarEmoji
    ) external returns (uint256) {
        require(!hasJar[msg.sender], "Already have a jar");
        require(bytes(handle).length >= 2 && bytes(handle).length <= 30, "Handle 2-30 chars");
        require(handleToJar[handle] == 0, "Handle taken");
        require(bytes(bio).length <= 160, "Bio max 160 chars");

        jarCount++;
        uint256 id = jarCount;

        jars[id] = Jar({
            id:            id,
            owner:         msg.sender,
            handle:        handle,
            bio:           bio,
            avatarEmoji:   bytes(avatarEmoji).length > 0 ? avatarEmoji : "jar",
            totalReceived: 0,
            tipCount:      0,
            exists:        true
        });

        ownerToJar[msg.sender]  = id;
        handleToJar[handle]     = id;
        hasJar[msg.sender]      = true;
        allJarIds.push(id);

        emit JarCreated(id, msg.sender, handle);
        return id;
    }

    // ── Core: send tip ───────────────────────────────────────────────
    function tip(
        uint256 jarId,
        address token,
        uint256 amount,
        string calldata message
    ) external validToken(token) {
        require(jars[jarId].exists, "Jar not found");
        require(amount > 0, "Amount must be > 0");
        require(bytes(message).length <= 140, "Message max 140 chars");

        uint256 fee    = (amount * PLATFORM_FEE_BPS) / 10000;
        uint256 payout = amount - fee;

        IERC20 t = IERC20(token);
        require(t.allowance(msg.sender, address(this)) >= amount, "Approve first");
        require(t.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (fee > 0) t.transfer(feeRecipient, fee);
        t.transfer(jars[jarId].owner, payout);

        // normalise to 18-decimal USD value for leaderboard
        uint256 normalised = _normalise(token, amount);
        jars[jarId].totalReceived += normalised;
        jars[jarId].tipCount      += 1;

        TipEvent memory ev = TipEvent({
            tipper:   msg.sender,
            jarOwner: jars[jarId].owner,
            jarId:    jarId,
            token:    token,
            amount:   amount,
            message:  message,
            timestamp: block.timestamp
        });
        tipHistory.push(ev);
        jarTips[jarId].push(ev);

        emit TipSent(jarId, msg.sender, token, amount, message);
    }

    // ── Core: tip by handle ──────────────────────────────────────────
    function tipByHandle(
        string calldata handle,
        address token,
        uint256 amount,
        string calldata message
    ) external validToken(token) {
        uint256 jarId = handleToJar[handle];
        require(jarId != 0, "Handle not found");
        this.tip(jarId, token, amount, message);
    }

    // ── View: leaderboard (top 20 by totalReceived) ──────────────────
    function getLeaderboard() external view returns (Jar[] memory) {
        uint256 len = allJarIds.length;
        Jar[] memory all = new Jar[](len);
        for (uint256 i = 0; i < len; i++) {
            all[i] = jars[allJarIds[i]];
        }
        // bubble sort descending (fine for ≤ a few hundred jars)
        for (uint256 i = 0; i < len; i++) {
            for (uint256 j = i + 1; j < len; j++) {
                if (all[j].totalReceived > all[i].totalReceived) {
                    Jar memory tmp = all[i];
                    all[i] = all[j];
                    all[j] = tmp;
                }
            }
        }
        // return top 20
        uint256 retLen = len < 20 ? len : 20;
        Jar[] memory top = new Jar[](retLen);
        for (uint256 i = 0; i < retLen; i++) top[i] = all[i];
        return top;
    }

    // ── View: recent tips for a jar ──────────────────────────────────
    function getJarTips(uint256 jarId, uint256 limit)
        external view returns (TipEvent[] memory)
    {
        TipEvent[] storage all = jarTips[jarId];
        uint256 len  = all.length;
        uint256 ret  = len < limit ? len : limit;
        TipEvent[] memory out = new TipEvent[](ret);
        for (uint256 i = 0; i < ret; i++) {
            out[i] = all[len - 1 - i]; // newest first
        }
        return out;
    }

    // ── View: global recent tips ─────────────────────────────────────
    function getRecentTips(uint256 limit) external view returns (TipEvent[] memory) {
        uint256 len = tipHistory.length;
        uint256 ret = len < limit ? len : limit;
        TipEvent[] memory out = new TipEvent[](ret);
        for (uint256 i = 0; i < ret; i++) {
            out[i] = tipHistory[len - 1 - i];
        }
        return out;
    }

    // ── View: jar by owner wallet ─────────────────────────────────────
    function getJarByOwner(address owner) external view returns (Jar memory) {
        uint256 id = ownerToJar[owner];
        require(id != 0, "No jar for this address");
        return jars[id];
    }

    // ── Internal helpers ─────────────────────────────────────────────
    // USDT/USDC are 6-decimal on Celo; cUSD is 18-decimal
    function _normalise(address token, uint256 amount) internal pure returns (uint256) {
        if (token == USDT || token == USDC) {
            return amount * 1e12; // scale 6→18 decimals
        }
        return amount; // cUSD already 18
    }
}
