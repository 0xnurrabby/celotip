"use client";

import { useState } from "react";
import { parseUnits, encodeFunctionData } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { celo } from "wagmi/chains";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { CELOTIP_ABI, ERC20_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS, TOKENS, TIP_PRESETS } from "@/lib/constants";
import { shortAddr } from "@/lib/utils";

interface Jar {
  id: bigint; handle: string; avatarEmoji: string;
  bio: string; owner: string;
}

const TOKEN_COLORS: Record<string, string> = {
  cUSD: "#FFE566",
  USDT: "#B8F0C8",
  USDC: "#B8DEFF",
};

export function TipModal({ jar, onClose, onSuccess }: {
  jar: Jar; onClose: () => void; onSuccess: () => void;
}) {
  const { address } = useAccount();
  const pub          = usePublicClient();
  const { data: wc } = useWalletClient();

  const [token,   setToken  ] = useState(TOKENS.cUSD.address);
  const [amount,  setAmount ] = useState("1");
  const [message, setMessage] = useState("");
  const [step,    setStep   ] = useState<"idle" | "approving" | "tipping" | "done">("idle");
  const [err,     setErr    ] = useState("");

  const selectedTok = Object.values(TOKENS).find(t => t.address === token)!;
  const busy = step !== "idle" && step !== "done";

  async function send() {
    if (!address || !wc || !pub || !amount) return;
    setErr(""); setStep("approving");
    try {
      await wc.switchChain({ id: celo.id });
      const amt = parseUnits(amount, selectedTok.decimals);

      // Approve
      const appData = encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [CONTRACT_ADDRESS, amt] });
      const appHash = await wc.sendTransaction({ account: address, to: token as `0x${string}`, data: appData, chain: celo });
      await pub.waitForTransactionReceipt({ hash: appHash });

      // Tip
      setStep("tipping");
      const tipData = encodeFunctionData({ abi: CELOTIP_ABI, functionName: "tip", args: [jar.id, token as `0x${string}`, amt, message] });
      const tipHash = await wc.sendTransaction({ account: address, to: CONTRACT_ADDRESS, data: tipData, chain: celo });
      await pub.waitForTransactionReceipt({ hash: tipHash });

      setStep("done");
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Transaction failed");
      setStep("idle");
    }
  }

  // ── styles ──────────────────────────────────────────────────────
  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px", background: "rgba(26,26,26,0.7)",
  };
  const box: React.CSSProperties = {
    background: "#FDFAF4", border: "2px solid #1a1a1a",
    width: "100%", maxWidth: "420px",
    fontFamily: "inherit",
  };
  const sep: React.CSSProperties = { borderBottom: "2px solid #1a1a1a" };
  const sectionLabel: React.CSSProperties = {
    fontSize: "10px", fontWeight: 800,
    textTransform: "uppercase", letterSpacing: "0.1em",
    color: "#888", marginBottom: "10px",
  };
  const inp: React.CSSProperties = {
    border: "2px solid #1a1a1a", background: "#F5F0E8",
    padding: "11px 14px", fontSize: "15px",
    fontFamily: "inherit", width: "100%",
    outline: "none", color: "#1a1a1a",
    borderRadius: 0,
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={box} className="fade-up">

        {/* ── Header ───────────────────────────────── */}
        <div style={{ ...sep, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", border: "2px solid #1a1a1a",
              background: "#FFE566", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "24px", flexShrink: 0,
            }}>
              {jar.avatarEmoji}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "18px", lineHeight: 1 }}>@{jar.handle}</div>
              <div style={{ fontSize: "11px", color: "#888", fontFamily: "monospace", marginTop: "3px" }}>
                {shortAddr(jar.owner)}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            border: "2px solid #1a1a1a", background: "#F5F0E8",
            width: "34px", height: "34px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── Token ─────────────────────────────── */}
          <div>
            <div style={sectionLabel}>Token</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {Object.values(TOKENS).map(t => (
                <button key={t.address} onClick={() => setToken(t.address)} style={{
                  border: "2px solid #1a1a1a",
                  background: token === t.address ? TOKEN_COLORS[t.symbol] : "#F5F0E8",
                  padding: "10px 0", fontWeight: 800, fontSize: "14px",
                  cursor: "pointer", fontFamily: "inherit",
                  transform: token === t.address ? "translate(-2px,-2px)" : "none",
                  transition: "all 0.08s",
                }}>
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* ── Amount ────────────────────────────── */}
          <div>
            <div style={sectionLabel}>Amount ({selectedTok.symbol})</div>
            {/* Preset buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "10px" }}>
              {TIP_PRESETS.map(p => (
                <button key={p.amount} onClick={() => setAmount(p.amount)} style={{
                  border: "2px solid #1a1a1a",
                  background: amount === p.amount ? "#FFE566" : "#F5F0E8",
                  padding: "8px 4px", fontWeight: 700, fontSize: "11px",
                  cursor: "pointer", fontFamily: "inherit",
                  transform: amount === p.amount ? "translate(-2px,-2px)" : "none",
                  transition: "all 0.08s", textAlign: "center",
                }}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Custom input */}
            <input
              type="number" value={amount} min="0.01" step="0.01"
              onChange={e => setAmount(e.target.value)}
              style={inp}
              onFocus={e => (e.target.style.background = "#FFF8D6")}
              onBlur={e => (e.target.style.background = "#F5F0E8")}
              placeholder="Custom amount"
            />
          </div>

          {/* ── Message ───────────────────────────── */}
          <div>
            <div style={sectionLabel}>Message <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></div>
            <input
              value={message} onChange={e => setMessage(e.target.value)}
              maxLength={140} style={inp}
              onFocus={e => (e.target.style.background = "#FFF8D6")}
              onBlur={e => (e.target.style.background = "#F5F0E8")}
              placeholder="Say something nice… ✨"
            />
          </div>

          {/* ── Error ─────────────────────────────── */}
          {err && (
            <div style={{
              border: "2px solid #e53935", background: "#fff5f5",
              padding: "10px 14px", fontSize: "12px",
              color: "#c62828", fontWeight: 700, lineHeight: 1.4,
            }}>
              {err}
            </div>
          )}

          {/* ── Submit ────────────────────────────── */}
          {step === "done" ? (
            <div style={{
              border: "2px solid #1a1a1a", background: "#B8F0C8",
              padding: "16px", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              fontWeight: 900, fontSize: "16px",
            }}>
              <CheckCircle2 size={20} /> Tip Sent! 🎉
            </div>
          ) : (
            <button onClick={send} disabled={busy || !amount} style={{
              border: "2px solid #1a1a1a",
              background: busy || !amount ? "#ddd" : "#FFE566",
              padding: "16px", fontWeight: 900, fontSize: "15px",
              cursor: busy || !amount ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              fontFamily: "inherit", width: "100%",
              opacity: busy || !amount ? 0.6 : 1,
              transition: "transform 0.08s",
            }}
              onMouseEnter={e => { if (!busy && amount) (e.target as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = "none"; }}
            >
              {step === "approving" && <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Approving token…</>}
              {step === "tipping"   && <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending tip…</>}
              {step === "idle"      && <>💸 Send {amount || "0"} {selectedTok.symbol} to @{jar.handle}</>}
            </button>
          )}

          {/* Progress indicator */}
          {busy && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: "12px", height: "12px", border: "2px solid #1a1a1a",
                background: "#FFE566",
              }} />
              <div style={{ fontSize: "11px", color: "#666", fontWeight: 700 }}>
                Step {step === "approving" ? "1" : "2"} of 2 —{" "}
                {step === "approving" ? "Approving token spend" : "Sending your tip"}
              </div>
              <div style={{
                width: "12px", height: "12px", border: "2px solid #1a1a1a",
                background: step === "tipping" ? "#FFE566" : "#F5F0E8",
              }} />
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
