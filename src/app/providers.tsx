"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

const qc = new QueryClient();

function AutoConnect({ children }: { children: React.ReactNode }) {
  const { connect } = useConnect();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(true);
    if ((window as any).ethereum?.isMiniPay)
      connect({ connector: injected({ target: "metaMask" }) });
  }, [connect]);
  if (!ok) return null;
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <AutoConnect>{children}</AutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
