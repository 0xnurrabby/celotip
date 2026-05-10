"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Header } from "@/components/Header";
import { JarCard } from "@/components/JarCard";
import { TipModal } from "@/components/TipModal";
import { CreateJarModal } from "@/components/CreateJarModal";
import { RecentTips } from "@/components/RecentTips";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { CELOTIP_ABI } from "@/lib/abi";
import { Search, Trophy, Clock, Plus, Zap } from "lucide-react";

export type Jar = {
  id: bigint; owner: string; handle: string;
  bio: string; avatarEmoji: string;
  totalReceived: bigint; tipCount: bigint; exists?: boolean;
};
type TipEv = {
  tipper: string; jarOwner: string; jarId: bigint;
  token: string; amount: bigint; message: string; timestamp: bigint;
};

const TICKER_MSGS = [
  "🫙 Send micro-tips in cUSD, USDT, USDC",
  "⚡ Built on Celo · MiniPay compatible",
  "🏆 Top tippers on the leaderboard",
  "💸 1% platform fee · instant payouts",
  "🌍 Real onchain tips · real impact",
];

export default function Home() {
  const { address } = useAccount();
  const pub         = usePublicClient();

  const [tab,       setTab      ] = useState<"leaderboard"|"recent">("leaderboard");
  const [jars,      setJars     ] = useState<Jar[]>([]);
  const [tips,      setTips     ] = useState<TipEv[]>([]);
  const [search,    setSearch   ] = useState("");
  const [myJar,     setMyJar    ] = useState<Jar | null>(null);
  const [tipTarget, setTipTarget] = useState<Jar | null>(null);
  const [showCreate,setShowCreate] = useState(false);
  const [showMyJar, setShowMyJar ] = useState(false);
  const [loading,   setLoading  ] = useState(true);

  // handle lookup: jarOwner address → handle
  const handles: Record<string, string> = {};
  jars.forEach(j => { handles[j.owner.toLowerCase()] = j.handle; });

  const load = useCallback(async () => {
    if (!pub) return;
    setLoading(true);
    try {
      const [lb, recent] = await Promise.all([
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getLeaderboard" }),
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getRecentTips", args: [20n] }),
      ]);
      setJars(lb as Jar[]);
      setTips(recent as TipEv[]);
    } catch { /* contract not yet deployed — show empty state */ }
    setLoading(false);
  }, [pub]);

  // fetch my jar whenever address changes
  const loadMyJar = useCallback(async () => {
    if (!pub || !address) { setMyJar(null); return; }
    try {
      const j = await pub.readContract({
        address: CONTRACT_ADDRESS, abi: CELOTIP_ABI,
        functionName: "getJarByOwner", args: [address],
      });
      setMyJar(j as Jar);
    } catch { setMyJar(null); }
  }, [pub, address]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadMyJar(); }, [loadMyJar]);

  const filtered = jars.filter(j =>
    j.handle.toLowerCase().includes(search.toLowerCase()) ||
    j.bio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Header onOpenJar={() => setShowMyJar(true)} />

      {/* ── Ticker ───────────────────────────────────── */}
      <div className="ticker-wrap py-1.5">
        <div className="ticker-inner text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
          {[...TICKER_MSGS, ...TICKER_MSGS].map((m, i) => (
            <span key={i} className="flex-shrink-0">{m}</span>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Hero ─────────────────────────────────────── */}
        <div className="brut-card border-2 border-[#1a1a1a] p-6 bg-[#FFE566]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-3xl sm:text-4xl leading-none tracking-tight">
                TIP ANYONE<br/>ON CELO ⚡
              </h2>
              <p className="text-sm mt-2 font-medium text-gray-700 max-w-xs">
                Create your tip jar. Share the link. Get paid in cUSD, USDT or USDC — instantly onchain.
              </p>
            </div>
            {address ? (
              myJar ? (
                <button onClick={() => setShowMyJar(true)}
                  className="brut-btn btn-black text-sm px-6 py-3 self-start sm:self-auto">
                  <span className="text-lg">{myJar.avatarEmoji}</span> @{myJar.handle}
                </button>
              ) : (
                <button onClick={() => setShowCreate(true)}
                  className="brut-btn btn-black text-sm px-6 py-3 self-start sm:self-auto">
                  <Plus size={15}/> Create Jar
                </button>
              )
            ) : (
              <div className="border-2 border-[#1a1a1a] bg-[#FDFAF4] p-3 text-xs font-bold max-w-[180px]">
                👆 Connect wallet to create your tip jar
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tip Jars",    value: jars.length.toString() },
            { label: "Tips Sent",   value: tips.length.toString()  },
            { label: "On Celo",     value: "✓"                    },
          ].map(s => (
            <div key={s.label} className="brut-card border-2 border-[#1a1a1a] p-3 text-center">
              <p className="font-black text-2xl">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search ──────────────────────────────────── */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="brut-input pl-8" placeholder="Search jars by handle or bio…"/>
        </div>

        {/* ── Tabs ────────────────────────────────────── */}
        <div className="flex gap-0 border-2 border-[#1a1a1a] w-fit">
          <button onClick={() => setTab("leaderboard")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider border-r-2 border-[#1a1a1a] ${tab==="leaderboard" ? "bg-[#FFE566]" : "bg-[#FDFAF4]"}`}>
            <Trophy size={13}/> Leaderboard
          </button>
          <button onClick={() => setTab("recent")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider ${tab==="recent" ? "bg-[#FFE566]" : "bg-[#FDFAF4]"}`}>
            <Clock size={13}/> Recent Tips
          </button>
        </div>

        {/* ── Content ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="brut-card border-2 border-[#1a1a1a] h-40 animate-pulse bg-[#FDFAF4]"/>
            ))}
          </div>
        ) : tab === "leaderboard" ? (
          filtered.length === 0 ? (
            <div className="brut-card border-2 border-[#1a1a1a] p-10 text-center bg-[#FDFAF4]">
              <p className="text-4xl mb-3">🫙</p>
              <p className="font-black text-lg mb-1">No jars yet</p>
              <p className="text-sm text-gray-500 mb-4">Be the first to create a tip jar on Celo</p>
              {address && !myJar && (
                <button onClick={() => setShowCreate(true)} className="brut-btn btn-yellow">
                  <Plus size={14}/> Create First Jar
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((jar, i) => (
                <JarCard
                  key={jar.id.toString()}
                  jar={jar}
                  rank={i + 1}
                  onTip={(j) => setTipTarget(j)}
                  isOwn={jar.owner.toLowerCase() === address?.toLowerCase()}
                />
              ))}
            </div>
          )
        ) : (
          <RecentTips tips={tips} handles={handles} />
        )}

        {/* ── My Jar panel ────────────────────────────── */}
        {showMyJar && myJar && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#1a1a1a]/60">
            <div className="brut-card border-2 border-[#1a1a1a] w-full max-w-sm bg-[#FDFAF4] fade-up">
              <div className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]">
                <p className="font-black">My Jar</p>
                <button onClick={() => setShowMyJar(false)} className="brut-btn btn-white p-2">✕</button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{myJar.avatarEmoji}</span>
                  <div>
                    <p className="font-black text-xl">@{myJar.handle}</p>
                    <p className="text-xs text-gray-500">{myJar.bio}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-2 border-[#1a1a1a] p-3 text-center bg-[#B8F0C8]">
                    <p className="font-black text-xl">{myJar.tipCount.toString()}</p>
                    <p className="text-[10px] font-bold uppercase">Tips</p>
                  </div>
                  <div className="border-2 border-[#1a1a1a] p-3 text-center bg-[#FFE566]">
                    <p className="font-black text-xl">${myJar.totalReceived > 0n ? (Number(myJar.totalReceived) / 1e18).toFixed(2) : "0"}</p>
                    <p className="text-[10px] font-bold uppercase">Received</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowMyJar(false); setTipTarget(myJar); }}
                  className="brut-btn btn-yellow w-full text-sm">
                  <Zap size={14}/> Tip Yourself (test)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── No jar prompt ───────────────────────────── */}
        {address && !myJar && !loading && (
          <div className="brut-card border-2 border-[#1a1a1a] p-5 bg-[#B8F0C8] flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-sm">You don&apos;t have a tip jar yet!</p>
              <p className="text-xs text-gray-600 mt-0.5">Create one and start receiving tips.</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="brut-btn btn-black text-xs px-4 py-2 flex-shrink-0">
              <Plus size={13}/> Create
            </button>
          </div>
        )}

      </main>

      {/* ── Modals ──────────────────────────────────── */}
      {tipTarget && (
        <TipModal jar={tipTarget} onClose={() => setTipTarget(null)} onSuccess={load}/>
      )}
      {showCreate && (
        <CreateJarModal onClose={() => setShowCreate(false)} onSuccess={() => { load(); loadMyJar(); }}/>
      )}
    </div>
  );
}
