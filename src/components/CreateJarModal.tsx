"use client";

import { useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { celo } from "wagmi/chains";
import { X, Loader2, Sparkles } from "lucide-react";
import { CELOTIP_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS, AVATAR_EMOJIS, TOKENS } from "@/lib/constants";

export function CreateJarModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { address } = useAccount();
  const pub          = usePublicClient();
  const { data: wc } = useWalletClient();

  const [handle, setHandle] = useState("");
  const [bio,    setBio   ] = useState("");
  const [emoji,  setEmoji ] = useState("🫙");
  const [busy,   setBusy  ] = useState(false);
  const [err,    setErr   ] = useState("");

  async function create() {
    if (!address || !wc || !pub || !handle.trim()) return;
    setBusy(true); setErr("");
    try {
      const data = encodeFunctionData({
        abi: CELOTIP_ABI, functionName: "createJar",
        args: [handle.trim().replace(/^@/, ""), bio.trim(), emoji],
      });
      const hash = await wc.sendTransaction({
        account: address, to: CONTRACT_ADDRESS, data, chain: celo,
        feeCurrency: TOKENS.cUSD.address,
      });
      await pub.waitForTransactionReceipt({ hash });
      onSuccess();
      onClose();
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px", background: "rgba(26,26,26,0.65)",
  };
  const box: React.CSSProperties = {
    background: "#FDFAF4", border: "2px solid #1a1a1a",
    width: "100%", maxWidth: "440px",
    maxHeight: "90vh", overflowY: "auto",
  };
  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "2px solid #1a1a1a",
  };
  const body: React.CSSProperties = { padding: "20px", display: "flex", flexDirection: "column", gap: "18px" };
  const label: React.CSSProperties = { fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "block" };
  const inp: React.CSSProperties = {
    border: "2px solid #1a1a1a", borderRadius: 0,
    background: "#F5F0E8", padding: "10px 14px",
    fontSize: "14px", fontFamily: "inherit",
    width: "100%", outline: "none", color: "#1a1a1a",
    display: "block",
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={box} className="fade-up">

        {/* Header */}
        <div style={row}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "16px" }}>
            <Sparkles size={16} /> Create Your Tip Jar
          </div>
          <button onClick={onClose} style={{ ...inp, width: "auto", padding: "6px 10px", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>
            <X size={16} />
          </button>
        </div>

        <div style={body}>

          {/* Avatar */}
          <div>
            <span style={label}>Pick an Avatar</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVATAR_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    width: "40px", height: "40px", fontSize: "22px",
                    border: `2px solid #1a1a1a`,
                    background: emoji === e ? "#FFE566" : "#F5F0E8",
                    cursor: "pointer",
                    transform: emoji === e ? "translate(-2px,-2px)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.08s",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Handle */}
          <div>
            <span style={label}>Handle *</span>
            <div style={{ display: "flex" }}>
              <div style={{
                ...inp, width: "40px", flexShrink: 0,
                background: "#FFE566", fontWeight: 900,
                textAlign: "center", display: "flex",
                alignItems: "center", justifyContent: "center",
                borderRight: "none",
              }}>
                @
              </div>
              <input
                type="text"
                value={handle}
                onChange={e => setHandle(e.target.value.replace(/\s/g, ""))}
                maxLength={30}
                placeholder="yourname"
                style={{ ...inp, borderLeft: "none", flex: 1 }}
                onFocus={e => (e.target.style.background = "#FFF8D6")}
                onBlur={e => (e.target.style.background = "#F5F0E8")}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <span style={label}>Bio <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              placeholder="What do you create?"
              style={inp}
              onFocus={e => (e.target.style.background = "#FFF8D6")}
              onBlur={e => (e.target.style.background = "#F5F0E8")}
            />
          </div>

          {/* Error */}
          {err && (
            <div style={{ border: "2px solid #e53935", background: "#fff5f5", padding: "10px 14px", fontSize: "13px", color: "#c62828", fontWeight: 700 }}>
              {err}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={create}
            disabled={busy || !handle.trim()}
            style={{
              border: "2px solid #1a1a1a", background: busy || !handle.trim() ? "#ddd" : "#FFE566",
              padding: "14px", fontSize: "15px", fontWeight: 900,
              cursor: busy || !handle.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "inherit", width: "100%",
              opacity: busy || !handle.trim() ? 0.6 : 1,
            }}
          >
            {busy
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating…</>
              : <><span style={{ fontSize: "22px" }}>{emoji}</span> Create Jar</>
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
