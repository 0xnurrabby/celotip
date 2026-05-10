"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect, useState } from "react";
import { Wallet, LogOut, Zap } from "lucide-react";
import { shortAddr } from "@/lib/utils";

export function Header({ onOpenJar }: { onOpenJar: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect }   = useConnect();
  const { disconnect }= useDisconnect();
  const [isMini, setIsMini] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ((window as any).ethereum?.isMiniPay) {
      setIsMini(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);

  return (
    <header className="border-b-2 border-[#1a1a1a] bg-[#FDFAF4] sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFE566] border-2 border-[#1a1a1a] flex items-center justify-center font-black text-sm">
            CT
          </div>
          <span className="font-black text-lg tracking-tight">CeloTip</span>
          <span className="brut-tag bg-[#B8F0C8] text-[10px] hidden sm:inline">CELO</span>
        </div>

        {/* Right */}
        {mounted && (
          <div className="flex items-center gap-2">
            {isMini && (
              <span className="brut-tag bg-[#FFE566] text-[10px]">MINIPAY</span>
            )}

            {isConnected && address ? (
              <>
                <button onClick={onOpenJar} className="brut-btn btn-yellow text-xs py-2 px-3">
                  <Zap size={13} /> My Jar
                </button>
                <div className="brut-card px-3 py-1.5 text-xs font-mono font-bold hidden sm:block">
                  {shortAddr(address)}
                </div>
                <button onClick={() => disconnect()} className="brut-btn btn-white py-2 px-2">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <button onClick={() => connect({ connector: injected() })} className="brut-btn btn-black text-xs py-2 px-3">
                <Wallet size={13} /> Connect
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
