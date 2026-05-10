"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect, useState } from "react";
import { Wallet, LogOut, Zap } from "lucide-react";
import { shortAddr } from "@/lib/utils";

export function Header({ onOpenJar }: { onOpenJar: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect }    = useConnect();
  const { disconnect } = useDisconnect();
  const [isMini,  setIsMini ] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ((window as any).ethereum?.isMiniPay) {
      setIsMini(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);

  const h: React.CSSProperties = {
    width: "100%", background: "#FDFAF4",
    borderBottom: "2px solid #1a1a1a",
    position: "sticky", top: 0, zIndex: 50,
  };
  const inner: React.CSSProperties = {
    width: "100%", maxWidth: "1100px", margin: "0 auto",
    padding: "0 20px", height: "56px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const logo: React.CSSProperties = {
    width: "36px", height: "36px", background: "#FFE566",
    border: "2px solid #1a1a1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: "13px", flexShrink: 0,
  };
  const btn: React.CSSProperties = {
    border: "2px solid #1a1a1a", cursor: "pointer",
    fontWeight: 700, fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: "6px",
    fontSize: "13px", padding: "7px 14px",
  };

  return (
    <header style={h}>
      <div style={inner}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={logo}>CT</div>
          <span style={{ fontWeight: 900, fontSize: "20px", letterSpacing: "-0.02em" }}>CeloTip</span>
          <span style={{ border: "2px solid #1a1a1a", padding: "2px 8px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: "#B8F0C8" }}>
            CELO
          </span>
        </div>

        {/* Right */}
        {mounted && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isMini && (
              <span style={{ border: "2px solid #1a1a1a", padding: "2px 8px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", background: "#FFE566" }}>
                MINIPAY
              </span>
            )}

            {isConnected && address ? (
              <>
                <button onClick={onOpenJar} style={{ ...btn, background: "#FFE566" }}>
                  <Zap size={13} /> My Jar
                </button>
                <div style={{ border: "2px solid #1a1a1a", padding: "7px 12px", fontSize: "12px", fontFamily: "monospace", fontWeight: 700, background: "#FDFAF4" }}>
                  {shortAddr(address)}
                </div>
                <button onClick={() => disconnect()} style={{ ...btn, background: "#FDFAF4", padding: "7px 10px" }}>
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <button onClick={() => connect({ connector: injected() })} style={{ ...btn, background: "#1a1a1a", color: "#F5F0E8" }}>
                <Wallet size={13} /> Connect
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
