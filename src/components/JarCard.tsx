"use client";

import { ExternalLink } from "lucide-react";
import { formatUSD, shortAddr } from "@/lib/utils";

interface Jar {
  id: bigint;
  owner: string;
  handle: string;
  bio: string;
  avatarEmoji: string;
  totalReceived: bigint;
  tipCount: bigint;
  exists?: boolean;
}

const CARD_COLORS = [
  "bg-[#FFE566]",
  "bg-[#B8F0C8]",
  "bg-[#FFB8CC]",
  "bg-[#B8DEFF]",
  "bg-[#DDB8FF]",
  "bg-[#FFD4A8]",
];

export function JarCard({ jar, rank, onTip, isOwn }: {
  jar: Jar;
  rank?: number;
  onTip: (jar: Jar) => void;
  isOwn?: boolean;
}) {
  const color = CARD_COLORS[Number(jar.id) % CARD_COLORS.length];

  return (
    <div className="brut-card border-2 border-[#1a1a1a] flex flex-col overflow-hidden fade-up">
      {/* color strip */}
      <div className={`${color} h-2.5 border-b-2 border-[#1a1a1a] flex-shrink-0`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {rank && rank <= 3 ? (
              <div className={`w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center font-black text-sm flex-shrink-0 rank-${rank}`}>
                #{rank}
              </div>
            ) : (
              <div className="w-10 h-10 border-2 border-[#1a1a1a] bg-[#F5F0E8] flex items-center justify-center text-2xl flex-shrink-0">
                {jar.avatarEmoji}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-black text-base truncate">@{jar.handle}</p>
              <p className="font-mono text-[11px] text-gray-400">{shortAddr(jar.owner)}</p>
            </div>
          </div>
          {isOwn && <span className="brut-tag bg-[#FFE566] text-[10px] flex-shrink-0 ml-2">YOU</span>}
        </div>

        {/* Bio */}
        {jar.bio && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-shrink-0">{jar.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
          <div className="border-2 border-[#1a1a1a] p-2.5 text-center bg-[#F5F0E8]">
            <p className="font-black text-xl leading-tight">${formatUSD(jar.totalReceived)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">Total Tips</p>
          </div>
          <div className="border-2 border-[#1a1a1a] p-2.5 text-center bg-[#F5F0E8]">
            <p className="font-black text-xl leading-tight">{jar.tipCount.toString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">Tip Count</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onTip(jar)}
            className={`brut-btn ${color} flex-1 text-xs py-2.5`}>
            💸 Tip @{jar.handle}
          </button>
          <a
            href={`https://celoscan.io/address/${jar.owner}`}
            target="_blank" rel="noopener noreferrer"
            className="brut-btn btn-white py-2.5 px-2.5"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
