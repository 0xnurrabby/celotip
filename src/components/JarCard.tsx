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

const BG_COLORS = ["bg-[#FFE566]","bg-[#B8F0C8]","bg-[#FFB8CC]","bg-[#B8DEFF]","bg-[#DDB8FF]","bg-[#FFD4A8]"];

export function JarCard({
  jar, rank, onTip, isOwn,
}: {
  jar: Jar;
  rank?: number;
  onTip: (jar: Jar) => void;
  isOwn?: boolean;
}) {
  const bg = BG_COLORS[Number(jar.id) % BG_COLORS.length];

  return (
    <div className={`brut-card border-2 border-[#1a1a1a] overflow-hidden fade-up`}>
      {/* colour top strip */}
      <div className={`${bg} h-2 border-b-2 border-[#1a1a1a]`}/>

      <div className="p-4">
        {/* top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {rank && rank <= 3 ? (
              <div className={`w-9 h-9 border-2 border-[#1a1a1a] flex items-center justify-center font-black text-sm rank-${rank}`}>
                #{rank}
              </div>
            ) : (
              <div className="w-9 h-9 border-2 border-[#1a1a1a] flex items-center justify-center text-2xl bg-[#FDFAF4]">
                {jar.avatarEmoji}
              </div>
            )}
            <div>
              <p className="font-black text-base leading-tight">@{jar.handle}</p>
              <p className="font-mono text-[11px] text-gray-400">{shortAddr(jar.owner)}</p>
            </div>
          </div>

          {isOwn && (
            <span className="brut-tag bg-[#FFE566] text-[10px]">YOU</span>
          )}
        </div>

        {/* bio */}
        {jar.bio && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{jar.bio}</p>
        )}

        {/* stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="border-2 border-[#1a1a1a] p-2 text-center bg-[#FDFAF4]">
            <p className="font-black text-lg leading-tight">${formatUSD(jar.totalReceived)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Tips</p>
          </div>
          <div className="border-2 border-[#1a1a1a] p-2 text-center bg-[#FDFAF4]">
            <p className="font-black text-lg leading-tight">{jar.tipCount.toString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tip Count</p>
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <button onClick={() => onTip(jar)} className={`brut-btn ${bg} flex-1 text-xs py-2`}>
            💸 Tip @{jar.handle}
          </button>
          <a
            href={`https://celoscan.io/address/${jar.owner}`}
            target="_blank" rel="noopener noreferrer"
            className="brut-btn btn-white py-2 px-2"
          >
            <ExternalLink size={13}/>
          </a>
        </div>
      </div>
    </div>
  );
}
