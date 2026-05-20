"use client";

import { formatTokenAmount, shortAddr, timeAgo } from "@/lib/utils";
import { getTokenByAddress } from "@/lib/utils";

interface TipEvent {
  tipper:    string;
  jarOwner:  string;
  jarId:     bigint;
  token:     string;
  amount:    bigint;
  message:   string;
  timestamp: bigint;
}

export function RecentTips({ tips, handles }: { tips: TipEvent[]; handles: Record<string, string> }) {
  if (!tips.length) return (
    <div className="brut-card border-2 border-[#1a1a1a] p-6 text-center">
      <p className="text-2xl mb-2">🫙</p>
      <p className="text-sm font-bold text-gray-400">No tips yet. Be the first!</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {tips.map((t, i) => {
        const tok = getTokenByAddress(t.token);
        const handle = handles[t.jarOwner.toLowerCase()];
        return (
          <div key={i} className="brut-card border-2 border-[#1a1a1a] p-3 flex items-start gap-3 fade-up">
            <div className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#FFE566] flex items-center justify-center text-base flex-shrink-0">
              💸
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">
                <span className="font-mono">{shortAddr(t.tipper)}</span>
                <span className="font-normal text-gray-500"> tipped </span>
                <span>@{handle || shortAddr(t.jarOwner)}</span>
              </p>
              <p className="text-sm font-black mt-0.5">
                {formatTokenAmount(t.amount, t.token)} {tok?.symbol}
              </p>
              {t.message && (
                <p className="text-xs text-gray-500 mt-1 italic truncate">&quot;{t.message}&quot;</p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-mono flex-shrink-0">{timeAgo(t.timestamp)}</p>
          </div>
        );
      })}
    </div>
  );
}
