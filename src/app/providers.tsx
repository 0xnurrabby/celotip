"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { useEffect, useSyncExternalStore } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

const qc = new QueryClient();
const subscribe = () => () => {};

type MiniPayWindow = Window & { ethereum?: { isMiniPay?: boolean } };

function isMiniPay() {
  return typeof window !== "undefined" && Boolean((window as MiniPayWindow).ethereum?.isMiniPay);
}

function AutoConnect({ children }: { children: React.ReactNode }) {
  const { connect } = useConnect();
  const miniPay = useSyncExternalStore(subscribe, isMiniPay, () => false);

  useEffect(() => {
    if (miniPay) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect, miniPay]);

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
