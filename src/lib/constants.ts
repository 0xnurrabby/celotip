export const CONTRACT_ADDRESS = "0x9F4b5E7dD3F6b389eD96a35FDD34a89F1860655b" as `0x${string}`;

export const TOKENS = {
  cUSD: { address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`, symbol: "cUSD", decimals: 18 },
  USDT: { address: "0x617f3112bf5397D0467D315cC709EF968D9ba546" as `0x${string}`, symbol: "USDT", decimals: 6  },
  USDC: { address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`, symbol: "USDC", decimals: 6  },
} as const;

export const CELO_CHAIN_ID = 42220;

export const TIP_PRESETS = [
  { label: "☕ Coffee",  amount: "0.5"  },
  { label: "🍕 Pizza",  amount: "2"    },
  { label: "🚀 Rocket", amount: "5"    },
  { label: "💎 Diamond",amount: "10"   },
] as const;

export const AVATAR_EMOJIS = ["🫙","🎨","🎵","⚡","🔥","🌊","🌸","🦋","🎯","🏆","💡","🎭","🦄","🍀","🌙"];
