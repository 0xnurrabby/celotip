"use client";

import { useState } from "react";
import { parseUnits, encodeFunctionData } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { celo } from "wagmi/chains";
import { X, Send, Loader2 } from "lucide-react";
import { CELOTIP_ABI, ERC20_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS, TOKENS, TIP_PRESETS } from "@/lib/constants";
import { shortAddr } from "@/lib/utils";

interface Jar { id: bigint; handle: string; avatarEmoji: string; bio: string; owner: string; }

export function TipModal({ jar, onClose, onSuccess }: { jar: Jar; onClose: () => void; onSuccess: () => void }) {
  const { address } = useAccount();
  const pub         = usePublicClient();
  const { data: wc }= useWalletClient();

  const [token,   setToken  ] = useState<string>(TOKENS.cUSD.address);
  const [amount,  setAmount ] = useState("1");
  const [message, setMessage] = useState("");
  const [step,    setStep   ] = useState<"idle"|"approving"|"tipping"|"done">("idle");
  const [err,     setErr    ] = useState("");

  const selectedTok = Object.values(TOKENS).find(t => t.address === token)!;

  async function send() {
    if (!address || !wc || !pub) return;
    setErr(""); setStep("approving");
    try {
      // Switch to Celo first
      await wc.switchChain({ id: celo.id });

      const amt = parseUnits(amount, selectedTok.decimals);

      // 1. Approve
      const appData = encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [CONTRACT_ADDRESS, amt] });
      const appHash = await wc.sendTransaction({ account: address, to: token as `0x${string}`, data: appData, chain: celo });
      await pub.waitForTransactionReceipt({ hash: appHash });

      // 2. Tip
      setStep("tipping");
      const tipData = encodeFunctionData({ abi: CELOTIP_ABI, functionName: "tip", args: [jar.id, token as `0x${string}`, amt, message] });
      const tipHash = await wc.sendTransaction({ account: address, to: CONTRACT_ADDRESS, data: tipData, chain: celo });
      await pub.waitForTransactionReceipt({ hash: tipHash });

      setStep("done");
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Transaction failed");
      setStep("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#1a1a1a]/60">
      <div className="brut-card w-full max-w-sm border-2 border-[#1a1a1a] bg-[#FDFAF4] fade-up">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{jar.avatarEmoji}</span>
            <div>
              <p className="font-black text-base">@{jar.handle}</p>
              <p className="text-xs text-gray-500 font-mono">{shortAddr(jar.owner)}</p>
            </div>
          </div>
          <button onClick={onClose} className="brut-btn btn-white p-2"><X size={16}/></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Token */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Token</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TOKENS).map(t => (
                <button key={t.address} onClick={() => setToken(t.address)}
                  className={`brut-btn text-xs py-2 ${token===t.address ? "btn-yellow" : "btn-white"}`}>
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Amount presets */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Amount ({selectedTok.symbol})</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {TIP_PRESETS.map(p => (
                <button key={p.amount} onClick={() => setAmount(p.amount)}
                  className={`brut-btn text-[11px] py-1.5 px-1 ${amount===p.amount ? "btn-yellow" : "btn-white"}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="number" value={amount} min="0.01" step="0.01"
              onChange={e => setAmount(e.target.value)}
              className="brut-input font-mono font-bold"
              placeholder="Custom amount"
            />
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Message (optional)</p>
            <input
              value={message} onChange={e => setMessage(e.target.value)}
              maxLength={140} className="brut-input"
              placeholder="Say something nice..."
            />
          </div>

          {err && <p className="text-xs text-red-600 font-bold border-2 border-red-400 p-2 bg-red-50">{err}</p>}

          {/* Send */}
          {step === "done" ? (
            <div className="brut-btn btn-green w-full text-sm">✓ Tip Sent!</div>
          ) : (
            <button onClick={send} disabled={step !== "idle" || !amount}
              className="brut-btn btn-yellow w-full text-sm disabled:opacity-50">
              {step === "approving" && <><Loader2 size={14} className="animate-spin"/> Approving…</>}
              {step === "tipping"   && <><Loader2 size={14} className="animate-spin"/> Sending…</>}
              {step === "idle"      && <><Send size={14}/> Send {amount} {selectedTok.symbol}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
