import { formatUnits } from "viem";
import { TOKENS } from "./constants";

export function shortAddr(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function getTokenByAddress(addr: string) {
  return Object.values(TOKENS).find(t => t.address.toLowerCase() === addr.toLowerCase());
}

export function formatTokenAmount(amount: bigint, tokenAddr: string): string {
  const token = getTokenByAddress(tokenAddr);
  const dec   = token?.decimals ?? 18;
  const val   = parseFloat(formatUnits(amount, dec));
  return val.toFixed(val < 1 ? 4 : 2);
}

// normalised 18-decimal leaderboard amount
export function formatUSD(normalised: bigint): string {
  const val = parseFloat(formatUnits(normalised, 18));
  if (val >= 1000) return (val / 1000).toFixed(1) + "k";
  return val.toFixed(2);
}

export function timeAgo(ts: bigint): string {
  const diff = Date.now() / 1000 - Number(ts);
  if (diff < 60)   return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400)return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
