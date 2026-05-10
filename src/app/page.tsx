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

const TICKER = [
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
  const [spinning,   setSpinning  ] = useState(false);

  const handles: Record<string, string> = {};
  jars.forEach(j => { handles[j.owner.toLowerCase()] = j.handle; });

  const load = useCallback(async (silent = false) => {
    if (!pub) return;
    if (!silent) setLoading(true); else setSpinning(true);
    try {
      const [lb, recent] = await Promise.all([
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getLeaderboard" }),
        pub.readContract({ address: CONTRACT_ADDRESS, abi: CELOTIP_ABI, functionName: "getRecentTips", args: [20n] }),
      ]);
      setJars(lb as Jar[]);
      setTips(recent as TipEv[]);
    } catch { /* empty */ }
    setLoading(false); setSpinning(false);
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

  const S = {
    page: { width: "100%", minHeight: "100vh", background: "#F5F0E8", display: "flex", flexDirection: "column" as const },
    wrap: { width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "0 20px" },
    hero: { background: "#FFE566", border: "2px solid #1a1a1a", padding: "32px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" as const },
    heroTitle: { fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1, letterSpacing: "-0.02em" },
    heroSub: { fontSize: "14px", marginTop: "12px", color: "#555", maxWidth: "360px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" },
    statBox: { background: "#FDFAF4", border: "2px solid #1a1a1a", padding: "16px", textAlign: "center" as const },
    statNum: { fontWeight: 900, fontSize: "2rem", lineHeight: 1 },
    statLbl: { fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#777", marginTop: "4px" },
    promptBar: { background: "#B8F0C8", border: "2px solid #1a1a1a", padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
    searchRow: { display: "flex", gap: "10px", marginBottom: "20px" },
    searchWrap: { flex: 1, position: "relative" as const },
    searchIcon: { position: "absolute" as const, left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999", pointerEvents: "none" as const },
    tabs: { display: "flex", border: "2px solid #1a1a1a", width: "fit-content", marginBottom: "20px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
    empty: { background: "#FDFAF4", border: "2px solid #1a1a1a", padding: "60px 20px", textAlign: "center" as const },
  };

  return (
    <div style={S.page}>
      <Header onOpenJar={() => setShowMyJar(true)} />

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {[...TICKER, ...TICKER].map((m, i) => <span key={i} style={{ flexShrink: 0 }}>{m}</span>)}
        </div>
      </div>

      <main style={{ flex: 1, ...S.wrap, paddingTop: "24px", paddingBottom: "40px" }}>

        {/* Hero */}
        <div style={S.hero}>
          <div>
            <h2 style={S.heroTitle}>TIP ANYONE<br />ON CELO ⚡</h2>
            <p style={S.heroSub}>Create your tip jar. Share it. Get paid in cUSD, USDT or USDC — instantly onchain.</p>
          </div>
          {address ? (
            myJar ? (
              <button onClick={() => setShowMyJar(true)} className="brut-btn btn-black" style={{ fontSize: "14px", padding: "12px 24px" }}>
                <span style={{ fontSize: "20px" }}>{myJar.avatarEmoji}</span> @{myJar.handle}
              </button>
            ) : (
              <button onClick={() => setShowCreate(true)} className="brut-btn btn-black" style={{ fontSize: "14px", padding: "12px 24px" }}>
                <Plus size={16} /> Create My Jar
              </button>
            )
          ) : (
            <div style={{ background: "#FDFAF4", border: "2px solid #1a1a1a", padding: "16px", fontSize: "13px", fontWeight: 700, maxWidth: "200px" }}>
              👆 Connect wallet to create your tip jar
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {[
            { label: "Tip Jars",  value: loading ? "…" : jars.length.toString() },
            { label: "Tips Sent", value: loading ? "…" : tips.length.toString() },
            { label: "On Celo",   value: "✓" },
          ].map(s => (
            <div key={s.label} style={S.statBox}>
              <div style={S.statNum}>{s.value}</div>
              <div style={S.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* No jar prompt */}
        {address && !myJar && !loading && (
          <div style={S.promptBar}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "14px" }}>You don&apos;t have a tip jar yet!</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>Create one and start receiving tips from anyone.</div>
            </div>
            <button onClick={() => setShowCreate(true)} className="brut-btn btn-black" style={{ fontSize: "12px", padding: "8px 16px", flexShrink: 0 }}>
              <Plus size={13} /> Create
            </button>
          </div>
        )}

        {/* Search */}
        <div style={S.searchRow}>
          <div style={S.searchWrap}>
            <Search size={14} style={S.searchIcon} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="brut-input"
              style={{ paddingLeft: "36px" }}
              placeholder="Search by handle or bio…"
            />
          </div>
          <button onClick={() => load(true)} className="brut-btn btn-white" style={{ padding: "10px 14px" }}>
            <RefreshCw size={15} style={{ animation: spinning ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {[
            { key: "leaderboard", icon: <Trophy size={13} />, label: "Leaderboard" },
            { key: "recent",      icon: <Clock   size={13} />, label: "Recent Tips"  },
          ].map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", fontSize: "12px", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.05em",
                background: tab === t.key ? "#FFE566" : "#FDFAF4",
                border: "none",
                borderRight: i === 0 ? "2px solid #1a1a1a" : "none",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={S.grid}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "#FDFAF4", border: "2px solid #1a1a1a", height: "200px", opacity: 0.5 }} />
            ))}
          </div>
        ) : tab === "leaderboard" ? (
          filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🫙</div>
              <div style={{ fontWeight: 900, fontSize: "20px", marginBottom: "8px" }}>No jars yet</div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Be the first to create a tip jar on Celo</div>
              {address && !myJar && (
                <button onClick={() => setShowCreate(true)} className="brut-btn btn-yellow">
                  <Plus size={14} /> Create First Jar
                </button>
              )}
            </div>
          ) : (
            <div style={S.grid}>
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

      {/* My Jar overlay */}
      {showMyJar && myJar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(26,26,26,0.6)" }}>
          <div className="brut-card fade-up" style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "2px solid #1a1a1a" }}>
              <span style={{ fontWeight: 900, fontSize: "18px" }}>My Jar</span>
              <button onClick={() => setShowMyJar(false)} className="brut-btn btn-white" style={{ padding: "6px 10px" }}>✕</button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "48px" }}>{myJar.avatarEmoji}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "22px" }}>@{myJar.handle}</div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{myJar.bio}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ border: "2px solid #1a1a1a", padding: "16px", textAlign: "center", background: "#B8F0C8" }}>
                  <div style={{ fontWeight: 900, fontSize: "28px" }}>{myJar.tipCount.toString()}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Tips Received</div>
                </div>
                <div style={{ border: "2px solid #1a1a1a", padding: "16px", textAlign: "center", background: "#FFE566" }}>
                  <div style={{ fontWeight: 900, fontSize: "28px" }}>${myJar.totalReceived > 0n ? (Number(myJar.totalReceived) / 1e18).toFixed(2) : "0"}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>USD Earned</div>
                </div>
              </div>
              <button onClick={() => { setShowMyJar(false); setTipTarget(myJar); }} className="brut-btn btn-yellow" style={{ width: "100%", justifyContent: "center" }}>
                <Zap size={14} /> Tip Yourself (test)
              </button>
            </div>
          </div>
        </div>
      )}

      {tipTarget  && <TipModal jar={tipTarget} onClose={() => setTipTarget(null)} onSuccess={() => load(true)} />}
      {showCreate && <CreateJarModal onClose={() => setShowCreate(false)} onSuccess={() => { load(true); loadMyJar(); }} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
