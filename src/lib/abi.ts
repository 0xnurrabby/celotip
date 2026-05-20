export const CELOTIP_ABI = [
  // createJar
  { inputs:[{name:"handle",type:"string"},{name:"bio",type:"string"},{name:"avatarEmoji",type:"string"}], name:"createJar", outputs:[{name:"",type:"uint256"}], stateMutability:"nonpayable", type:"function" },
  // tip
  { inputs:[{name:"jarId",type:"uint256"},{name:"token",type:"address"},{name:"amount",type:"uint256"},{name:"message",type:"string"}], name:"tip", outputs:[], stateMutability:"nonpayable", type:"function" },
  // tipByHandle
  { inputs:[{name:"handle",type:"string"},{name:"token",type:"address"},{name:"amount",type:"uint256"},{name:"message",type:"string"}], name:"tipByHandle", outputs:[], stateMutability:"nonpayable", type:"function" },
  // getLeaderboard
  { inputs:[], name:"getLeaderboard", outputs:[{ components:[{name:"id",type:"uint256"},{name:"owner",type:"address"},{name:"handle",type:"string"},{name:"bio",type:"string"},{name:"avatarEmoji",type:"string"},{name:"totalReceived",type:"uint256"},{name:"tipCount",type:"uint256"},{name:"exists",type:"bool"}], name:"", type:"tuple[]" }], stateMutability:"view", type:"function" },
  // getJarTips
  { inputs:[{name:"jarId",type:"uint256"},{name:"limit",type:"uint256"}], name:"getJarTips", outputs:[{ components:[{name:"tipper",type:"address"},{name:"jarOwner",type:"address"},{name:"jarId",type:"uint256"},{name:"token",type:"address"},{name:"amount",type:"uint256"},{name:"message",type:"string"},{name:"timestamp",type:"uint256"}], name:"", type:"tuple[]" }], stateMutability:"view", type:"function" },
  // getRecentTips
  { inputs:[{name:"limit",type:"uint256"}], name:"getRecentTips", outputs:[{ components:[{name:"tipper",type:"address"},{name:"jarOwner",type:"address"},{name:"jarId",type:"uint256"},{name:"token",type:"address"},{name:"amount",type:"uint256"},{name:"message",type:"string"},{name:"timestamp",type:"uint256"}], name:"", type:"tuple[]" }], stateMutability:"view", type:"function" },
  // getJarByOwner
  { inputs:[{name:"owner",type:"address"}], name:"getJarByOwner", outputs:[{ components:[{name:"id",type:"uint256"},{name:"owner",type:"address"},{name:"handle",type:"string"},{name:"bio",type:"string"},{name:"avatarEmoji",type:"string"},{name:"totalReceived",type:"uint256"},{name:"tipCount",type:"uint256"},{name:"exists",type:"bool"}], name:"", type:"tuple" }], stateMutability:"view", type:"function" },
  // jars / ownerToJar / hasJar / handleToJar / jarCount
  { inputs:[{name:"",type:"uint256"}], name:"jars", outputs:[{name:"id",type:"uint256"},{name:"owner",type:"address"},{name:"handle",type:"string"},{name:"bio",type:"string"},{name:"avatarEmoji",type:"string"},{name:"totalReceived",type:"uint256"},{name:"tipCount",type:"uint256"},{name:"exists",type:"bool"}], stateMutability:"view", type:"function" },
  { inputs:[{name:"",type:"address"}], name:"hasJar", outputs:[{name:"",type:"bool"}], stateMutability:"view", type:"function" },
  { inputs:[], name:"jarCount", outputs:[{name:"",type:"uint256"}], stateMutability:"view", type:"function" },
  // events
  { anonymous:false, inputs:[{indexed:true,name:"jarId",type:"uint256"},{indexed:true,name:"owner",type:"address"},{indexed:false,name:"handle",type:"string"}], name:"JarCreated", type:"event" },
  { anonymous:false, inputs:[{indexed:true,name:"jarId",type:"uint256"},{indexed:true,name:"tipper",type:"address"},{indexed:true,name:"token",type:"address"},{indexed:false,name:"amount",type:"uint256"},{indexed:false,name:"message",type:"string"}], name:"TipSent", type:"event" },
] as const;

export const ERC20_ABI = [
  { inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], name:"approve",    outputs:[{name:"",type:"bool"}], stateMutability:"nonpayable", type:"function" },
  { inputs:[{name:"account",type:"address"}],                               name:"balanceOf",  outputs:[{name:"",type:"uint256"}], stateMutability:"view",       type:"function" },
  { inputs:[{name:"owner",type:"address"},{name:"spender",type:"address"}], name:"allowance",  outputs:[{name:"",type:"uint256"}], stateMutability:"view",       type:"function" },
  { inputs:[],                                                              name:"decimals",   outputs:[{name:"",type:"uint8"}],   stateMutability:"view",       type:"function" },
  { inputs:[],                                                              name:"symbol",     outputs:[{name:"",type:"string"}],  stateMutability:"view",       type:"function" },
] as const;
