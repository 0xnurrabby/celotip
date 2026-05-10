import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const font = Space_Grotesk({ subsets: ["latin"], variable: "--font-main" });

export const metadata: Metadata = {
  title: "CeloTip — Tip Anyone on Celo",
  description: "Send micro-tips in cUSD, USDT or USDC to anyone on Celo. Create your tip jar and get rewarded.",
  other: {
    "talentapp:project_verification": "951f3621699130160504576804dabea27ad4b7d64b06afe681d5a3b0795ad4ff2112159803716b894e704eb7e883794e718bdd809c4ebf26a0abff0a406326c4",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable} style={{ width: "100%" }}>
      <body style={{
        width: "100%",
        minHeight: "100vh",
        background: "#F5F0E8",
        color: "#1a1a1a",
        fontFamily: "var(--font-main, sans-serif)",
        overflowX: "hidden",
      }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
