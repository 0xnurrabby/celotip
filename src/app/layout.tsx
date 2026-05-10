import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const font = Space_Grotesk({ subsets: ["latin"], variable: "--font-main" });

export const metadata: Metadata = {
  title: "CeloTip — Tip Anyone on Celo",
  description: "Send micro-tips in cUSD, USDT or USDC to anyone on Celo. Create your tip jar and get rewarded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="bg-[#F5F0E8] text-[#1a1a1a] min-h-screen font-main">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
