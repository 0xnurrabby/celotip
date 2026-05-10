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
import { Search, Trophy, Clock, Plus, Zap, RefreshCw } from "lucide-react";

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
  "🔥 Create your jar · share · earn",
];

export default function Home() {
  const { address } = useAccount();
  const pub = usePublicClient();

  const [tab,        setTab       ] = useState<"leaderboard" | "recent">("leaderboard");
  const [jars,       setJars      ] = useState<Jar[]>([]);
  const [tips,       setTips      ] = useState<TipEv[]>([]);
  const [search,     setSearch    ] = useState("");
  const [myJar,      setMyJar     ] = useState<Jar | null>(null);
  const [tipTarget,  setTipTarget ] = useState<Jar | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showMyJar,  setShowMyJar ] = useState(false);
  const [loading,    setLoading   ] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handles: Record<string, string> = {};
  jars.forEach(j => { handles[j.owner.toLowerCase()] = j.handle; });

  const load = useCallback(async (silent = false) => {
    if (!pub) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [lb, recent] = await Promise.all([
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getLeaderboard" }),
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getRecentTips", args: [20n] }),
      ]);
      setJars(lb as Jar[]);
      setTips(recent as TipEv[]);
    } catch { /* contract empty */ }
    setLoading(false);
    setRefreshing(false);
  }, [pub]);

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
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header onOpenJar={() => setShowMyJar(true)} />

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner text-xs font-bold uppercase tracking-wider">
          {[...TICKER_MSGS, ...TICKER_MSGS].map((m, i) => (
            <span key={i} className="flex-shrink-0">{m}</span>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="brut-card border-2 border-[#1a1a1a] p-6 bg-[#FFE566]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-4xl sm:text-5xl leading-none tracking-tight">
                TIP ANYONE<br />ON CELO ⚡
              </h2>
              <p className="text-sm mt-3 font-medium text-gray-700 max-w-sm">
                Create your tip jar. Share it. Get paid in cUSD, USDT or USDC — instantly onchain.
              </p>
            </div>
            {address ? (
              myJar ? (
                <button onClick={() => setShowMyJar(true)}
                  className="brut-btn btn-black text-sm px-6 py-3 self-start sm:self-auto whitespace-nowrap">
                  <span className="text-lg">{myJar.avatarEmoji}</span> @{myJar.handle}
                </button>
              ) : (
                <button onClick={() => setShowCreate(true)}
                  className="brut-btn btn-black text-sm px-6 py-3 self-start sm:self-auto whitespace-nowrap">
                  <Plus size={15} /> Create My Jar
                </button>
              )
            ) : (
              <div className="border-2 border-[#1a1a1a] bg-[#FDFAF4] p-4 text-sm font-bold max-w-[200px]">
                👆 Connect wallet to create your tip jar
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tip Jars",  value: loading ? "…" : jars.length.toString() },
            { label: "Tips Sent", value: loading ? "…" : tips.length.toString() },
            { label: "On Celo",   value: "✓" },
          ].map(s => (
            <div key={s.label} className="brut-card border-2 border-[#1a1a1a] p-4 text-center">
              <p className="font-black text-3xl">{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* No jar prompt */}
        {address && !myJar && !loading && (
          <div className="brut-card border-2 border-[#1a1a1a] p-4 bg-[#B8F0C8] flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-sm">You don&apos;t have a tip jar yet!</p>
              <p className="text-xs text-gray-600 mt-0.5">Create one and start receiving tips from anyone.</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="brut-btn btn-black text-xs px-4 py-2 flex-shrink-0">
              <Plus size={13} /> Create
            </button>
          </div>
        )}

        {/* Search + Refresh */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="brut-input pl-9" placeholder="Search by handle or bio…" />
          </div>
          <button onClick={() => load(true)} className="brut-btn btn-white px-3">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-2 border-[#1a1a1a] w-fit">
          <button onClick={() => setTab("leaderboard")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider border-r-2 border-[#1a1a1a] ${tab === "leaderboard" ? "bg-[#FFE566]" : "bg-[#FDFAF4] hover:bg-[#f0ebe0]"}`}>
            <Trophy size={13} /> Leaderboard
          </button>
          <button onClick={() => setTab("recent")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider ${tab === "recent" ? "bg-[#FFE566]" : "bg-[#FDFAF4] hover:bg-[#f0ebe0]"}`}>
            <Clock size={13} /> Recent Tips
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="brut-card border-2 border-[#1a1a1a] h-48 animate-pulse bg-[#FDFAF4]" />
            ))}
          </div>
        ) : tab === "leaderboard" ? (
          filtered.length === 0 ? (
            <div className="brut-card border-2 border-[#1a1a1a] p-14 text-center bg-[#FDFAF4]">
              <p className="text-5xl mb-4">🫙</p>
              <p className="font-black text-xl mb-2">No jars yet</p>
              <p className="text-sm text-gray-500 mb-5">Be the first to create a tip jar on Celo</p>
              {address && !myJar && (
                <button onClick={() => setShowCreate(true)} className="brut-btn btn-yellow">
                  <Plus size={14} /> Create First Jar
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      </main>

      {/* My Jar modal */}
      {showMyJar && myJar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/60">
          <div className="brut-card border-2 border-[#1a1a1a] w-full max-w-sm bg-[#FDFAF4] fade-up">
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]">
              <p className="font-black text-lg">My Jar</p>
              <button onClick={() => setShowMyJar(false)} className="brut-btn btn-white p-2 text-base leading-none">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{myJar.avatarEmoji}</span>
                <div>
                  <p className="font-black text-2xl">@{myJar.handle}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{myJar.bio}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#B8F0C8]">
                  <p className="font-black text-3xl">{myJar.tipCount.toString()}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider mt-1">Tips Received</p>
                </div>
                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#FFE566]">
                  <p className="font-black text-3xl">
                    ${myJar.totalReceived > 0n ? (Number(myJar.totalReceived) / 1e18).toFixed(2) : "0"}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider mt-1">USD Earned</p>
                </div>
              </div>
              <button
                onClick={() => { setShowMyJar(false); setTipTarget(myJar); }}
                className="brut-btn btn-yellow w-full">
                <Zap size={14} /> Tip Yourself (test)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {tipTarget && (
        <TipModal jar={tipTarget} onClose={() => setTipTarget(null)} onSuccess={() => load(true)} />
      )}
      {showCreate && (
        <CreateJarModal onClose={() => setShowCreate(false)} onSuccess={() => { load(true); loadMyJar(); }} />
      )}
    </div>
  );
}
