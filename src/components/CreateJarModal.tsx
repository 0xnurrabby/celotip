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
  const pub         = usePublicClient();
  const { data: wc }= useWalletClient();

  const [handle, setHandle] = useState("");
  const [bio,    setBio   ] = useState("");
  const [emoji,  setEmoji ] = useState("🫙");
  const [busy,   setBusy  ] = useState(false);
  const [err,    setErr   ] = useState("");

  async function create() {
    if (!address || !wc || !pub || !handle) return;
    setBusy(true); setErr("");
    try {
      const data = encodeFunctionData({
        abi: CELOTIP_ABI, functionName: "createJar",
        args: [handle.replace(/^@/, ""), bio, emoji],
      });
      const hash = await wc.sendTransaction({
        account: address, to: CONTRACT_ADDRESS, data, chain: celo,
        feeCurrency: TOKENS.cUSD.address,
      });
      await pub.waitForTransactionReceipt({ hash });
      onSuccess(); onClose();
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#1a1a1a]/60">
      <div className="brut-card w-full max-w-sm border-2 border-[#1a1a1a] bg-[#FDFAF4] fade-up">

        <div className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Sparkles size={16}/>
            <p className="font-black text-base">Create Your Tip Jar</p>
          </div>
          <button onClick={onClose} className="brut-btn btn-white p-2"><X size={16}/></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Pick an avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-xl w-9 h-9 border-2 border-[#1a1a1a] transition-all ${emoji===e ? "bg-[#FFE566] scale-110" : "bg-[#FDFAF4]"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Handle */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Handle</p>
            <div className="flex">
              <span className="brut-input w-8 text-center font-bold border-r-0 bg-[#FFE566] flex-shrink-0">@</span>
              <input value={handle} onChange={e => setHandle(e.target.value.replace(/\s/g,""))}
                maxLength={30} className="brut-input border-l-0 flex-1" placeholder="yourname"/>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Bio <span className="font-normal normal-case text-gray-400">(optional)</span></p>
            <input value={bio} onChange={e => setBio(e.target.value)}
              maxLength={160} className="brut-input" placeholder="What do you create?"/>
          </div>

          {err && <p className="text-xs text-red-600 font-bold border-2 border-red-400 p-2 bg-red-50">{err}</p>}

          <button onClick={create} disabled={busy || !handle}
            className="brut-btn btn-yellow w-full text-sm disabled:opacity-50">
            {busy ? <><Loader2 size={14} className="animate-spin"/> Creating…</> : <><span className="text-base">{emoji}</span> Create Jar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
