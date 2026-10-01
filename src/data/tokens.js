// Complete Web3 Multi-Chain Networks (Uniswap & Leading Ecosystem DEXes)

export const SUPPORTED_CHAINS = [
  // --- Telegram & High Speed ---
  { 
    id: 'ton', 
    name: 'شبکه تون (TON)', 
    nativeSymbol: 'TON', 
    category: 'telegram',
    mainDex: 'STON.fi & DeDust',
    badge: 'کارمزد ناچیز تلگرام',
    color: '#0088CC' 
  },
  { 
    id: 'solana', 
    name: 'سولانا (Solana)', 
    nativeSymbol: 'SOL', 
    category: 'l1',
    mainDex: 'Jupiter & Raydium',
    badge: 'پرسرعت‌ترین شبکه جهانی',
    color: '#9945FF' 
  },
  { 
    id: 'tron', 
    name: 'ترون (TRON TRC-20)', 
    nativeSymbol: 'TRX', 
    category: 'l1',
    mainDex: 'SunSwap v2.0',
    badge: 'استاندارد انتقال تتر',
    color: '#EF0027' 
  },

  // --- Uniswap Major L1s ---
  { 
    id: 'ethereum', 
    name: 'اتریوم (Ethereum)', 
    nativeSymbol: 'ETH', 
    category: 'l1',
    mainDex: 'Uniswap v3 / 1inch',
    badge: 'بزرگترین نقدینگی دیفای',
    color: '#627EEA' 
  },
  { 
    id: 'bsc', 
    name: 'بایننس چین (BNB Chain)', 
    nativeSymbol: 'BNB', 
    category: 'l1',
    mainDex: 'PancakeSwap v3',
    badge: 'شبکه اقتصادی BEP-20',
    color: '#F3BA2F' 
  },
  { 
    id: 'avalanche', 
    name: 'آوالانچ (Avalanche C-Chain)', 
    nativeSymbol: 'AVAX', 
    category: 'l1',
    mainDex: 'Trader Joe & Uniswap',
    badge: 'نقدینگی بالا و سریع',
    color: '#E84142' 
  },

  // --- Ethereum Layer 2s (Uniswap Official) ---
  { 
    id: 'base', 
    name: 'بیس (Base - کوین‌بیس)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'Aerodrome & Uniswap v3',
    badge: 'اکوسیستم رسمی Coinbase',
    color: '#0052FF' 
  },
  { 
    id: 'arbitrum', 
    name: 'آربیتروم (Arbitrum One)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'Uniswap v3 & Camelot',
    badge: 'برترین لایه ۲ اتریوم',
    color: '#28A0F0' 
  },
  { 
    id: 'optimism', 
    name: 'آپتیمیزم (OP Mainnet)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'Velodrome & Uniswap v3',
    badge: 'سوپرچین امن اتریوم',
    color: '#FF0420' 
  },
  { 
    id: 'polygon', 
    name: 'پالیگان (Polygon PoS)', 
    nativeSymbol: 'POL', 
    category: 'l2',
    mainDex: 'QuickSwap & Uniswap v3',
    badge: 'مقیاس‌پذیر و ارزان',
    color: '#8247E5' 
  },
  { 
    id: 'zksync', 
    name: 'زد‌کی‌سینک (zkSync Era)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'SyncSwap & Uniswap v3',
    badge: 'فناوری دانش صفر (ZK)',
    color: '#8C8DFC' 
  },
  { 
    id: 'linea', 
    name: 'لینیا (Linea)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'SyncSwap & Lynex',
    badge: 'شبکه لایه ۲ Consensys',
    color: '#61DFFF' 
  },
  { 
    id: 'blast', 
    name: 'بلاست (Blast)', 
    nativeSymbol: 'ETH', 
    category: 'l2',
    mainDex: 'Thruster & Uniswap v3',
    badge: 'بازدهی خودکار Native Yield',
    color: '#FCFC03' 
  },

  // --- Next-Gen Non-EVM ---
  { 
    id: 'sui', 
    name: 'سویی (Sui Network)', 
    nativeSymbol: 'SUI', 
    category: 'non_evm',
    mainDex: 'Cetus Protocol',
    badge: 'معماری Move پرسرعت',
    color: '#4DA2FF' 
  },
  { 
    id: 'aptos', 
    name: 'آپتوس (Aptos)', 
    nativeSymbol: 'APT', 
    category: 'non_evm',
    mainDex: 'Liquidswap & Pontem',
    badge: 'زبان Move مقیاس‌پذیر',
    color: '#202020' 
  },
  { 
    id: 'zcash', 
    name: 'زی‌کش (Zcash Shielded)', 
    nativeSymbol: 'ZEC', 
    category: 'privacy',
    mainDex: 'Noir & Zashi Shielded',
    badge: 'حفظ حریم خصوصی و ضد فریز',
    color: '#ECB244' 
  }
];

export const TOKENS = {
  ton: [
    { symbol: 'TON', name: 'Toncoin', decimals: 9, address: 'native', priceUSD: 1.60, icon: 'ton', isNative: true, censorshipResistant: true, securityLabel: 'کوین بومی (فاقد فریز)' },
    { symbol: 'USDT', name: 'Tether USD (TON)', decimals: 6, address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', priceUSD: 1.00, icon: 'usdt', isNative: false, freezable: true, securityLabel: 'متمرکز (تابع فریز)' },
    { symbol: 'STON', name: 'STON.fi Token', decimals: 9, address: 'EQA2kCVNwVsilYfTqRIdbmBmOC05w4aabG6TrqqJrqO26OHt', priceUSD: 3.85, icon: 'ston', isNative: false }
  ],

  solana: [
    { symbol: 'SOL', name: 'Solana', decimals: 9, address: 'native', priceUSD: 117.10, icon: 'sol', isNative: true, censorshipResistant: true, securityLabel: 'کوین بومی (فاقد فریز)' },
    { symbol: 'USDT', name: 'Tether USD (SPL)', decimals: 6, address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', priceUSD: 1.00, icon: 'usdt', isNative: false, freezable: true, securityLabel: 'متمرکز (تابع فریز)' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', priceUSD: 1.00, icon: 'usdc', isNative: false, freezable: true, securityLabel: 'متمرکز (تابع فریز)' },
    { symbol: 'JUP', name: 'Jupiter', decimals: 6, address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', priceUSD: 0.88, icon: 'jup', isNative: false }
  ],

  tron: [
    { symbol: 'TRX', name: 'TRON', decimals: 6, address: 'native', priceUSD: 0.34, icon: 'trx', isNative: true, censorshipResistant: true, securityLabel: 'کوین بومی (فاقد فریز)' },
    { symbol: 'USDT', name: 'Tether USD (TRC-20)', decimals: 6, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', priceUSD: 1.00, icon: 'usdt', isNative: false, freezable: true, securityLabel: 'متمرکز (تابع فریز)' },
    { symbol: 'BTT', name: 'BitTorrent (TRC-20)', decimals: 18, address: 'TAFjAVXVtbILFSSu36DmKn5eSJaqxGqtV6', priceUSD: 0.00000085, icon: 'btt', isNative: false }
  ],

  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true, censorshipResistant: true, securityLabel: 'کوین بومی (فاقد فریز)' },
    { symbol: 'LUSD', name: 'Liquity USD', decimals: 18, address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', priceUSD: 1.00, icon: 'lusd', isNative: false, censorshipResistant: true, securityLabel: '۱۰۰٪ تغییرناپذیر (ضد فریز)' },
    { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', priceUSD: 1.00, icon: 'dai', isNative: false, censorshipResistant: true, securityLabel: 'غیرمتمرکز (وثیقه‌ای)' },
    { symbol: 'USDT', name: 'Tether USD (ERC-20)', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', priceUSD: 1.00, icon: 'usdt', isNative: false, freezable: true, securityLabel: 'متمرکز (دارای تابع فریز)' },
    { symbol: 'USDC', name: 'USD Coin (ERC-20)', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', priceUSD: 1.00, icon: 'usdc', isNative: false, freezable: true, securityLabel: 'متمرکز (دارای تابع فریز)' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', priceUSD: 64500.00, icon: 'wbtc', isNative: false },
    { symbol: 'UNI', name: 'Uniswap', decimals: 18, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', priceUSD: 7.20, icon: 'uni', isNative: false }
  ],

  bsc: [
    { symbol: 'BNB', name: 'BNB (BEP-20)', decimals: 18, address: 'native', priceUSD: 580.00, icon: 'bnb', isNative: true },
    { symbol: 'USDT', name: 'Tether USD (BEP-20)', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955', priceUSD: 1.00, icon: 'usdt', isNative: false },
    { symbol: 'CAKE', name: 'PancakeSwap Token', decimals: 18, address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', priceUSD: 1.85, icon: 'cake', isNative: false }
  ],

  base: [
    { symbol: 'ETH', name: 'Ethereum (Base)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'USDC', name: 'USD Coin (Base)', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', priceUSD: 1.00, icon: 'usdc', isNative: false },
    { symbol: 'AERO', name: 'Aerodrome Finance', decimals: 18, address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', priceUSD: 1.15, icon: 'aero', isNative: false }
  ],

  arbitrum: [
    { symbol: 'ETH', name: 'Ethereum (Arbitrum)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'ARB', name: 'Arbitrum Token', decimals: 18, address: '0x912CE59144191C1204E64559FE8253a0e49E6548', priceUSD: 0.58, icon: 'arb', isNative: false },
    { symbol: 'USDT', name: 'Tether USD (Arbitrum)', decimals: 6, address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', priceUSD: 1.00, icon: 'usdt', isNative: false }
  ],

  optimism: [
    { symbol: 'ETH', name: 'Ethereum (Optimism)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'OP', name: 'Optimism Token', decimals: 18, address: '0x4200000000000000000000000000000000000042', priceUSD: 1.55, icon: 'op', isNative: false },
    { symbol: 'USDT', name: 'Tether USD (Optimism)', decimals: 6, address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', priceUSD: 1.00, icon: 'usdt', isNative: false }
  ],

  polygon: [
    { symbol: 'POL', name: 'Polygon Ecosystem Token', decimals: 18, address: 'native', priceUSD: 0.42, icon: 'pol', isNative: true },
    { symbol: 'USDT', name: 'Tether USD (Polygon)', decimals: 6, address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', priceUSD: 1.00, icon: 'usdt', isNative: false },
    { symbol: 'USDC', name: 'USD Coin (Polygon)', decimals: 6, address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', priceUSD: 1.00, icon: 'usdc', isNative: false }
  ],

  avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', decimals: 18, address: 'native', priceUSD: 28.50, icon: 'avax', isNative: true },
    { symbol: 'USDT', name: 'Tether USD (Avalanche)', decimals: 6, address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', priceUSD: 1.00, icon: 'usdt', isNative: false },
    { symbol: 'JOE', name: 'Trader Joe', decimals: 18, address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', priceUSD: 0.45, icon: 'joe', isNative: false }
  ],

  zksync: [
    { symbol: 'ETH', name: 'Ethereum (zkSync Era)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'USDC', name: 'USD Coin (zkSync)', decimals: 6, address: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4', priceUSD: 1.00, icon: 'usdc', isNative: false },
    { symbol: 'ZK', name: 'zkSync Token', decimals: 18, address: '0x5A7d6b2F92C77FAD6CCaBd100e1E9286CB32A4f0', priceUSD: 0.14, icon: 'zk', isNative: false }
  ],

  linea: [
    { symbol: 'ETH', name: 'Ethereum (Linea)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'USDC', name: 'USD Coin (Linea)', decimals: 6, address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', priceUSD: 1.00, icon: 'usdc', isNative: false }
  ],

  blast: [
    { symbol: 'ETH', name: 'Ethereum (Blast)', decimals: 18, address: 'native', priceUSD: 2692.00, icon: 'eth', isNative: true },
    { symbol: 'USDB', name: 'USD Blast Yield', decimals: 18, address: '0x4300000000000000000000000000000000000003', priceUSD: 1.00, icon: 'usdb', isNative: false }
  ],

  sui: [
    { symbol: 'SUI', name: 'Sui Token', decimals: 9, address: 'native', priceUSD: 1.88, icon: 'sui', isNative: true },
    { symbol: 'USDC', name: 'USD Coin (Sui)', decimals: 6, address: 'native', priceUSD: 1.00, icon: 'usdc', isNative: false }
  ],

  aptos: [
    { symbol: 'APT', name: 'Aptos Token', decimals: 8, address: 'native', priceUSD: 8.40, icon: 'apt', isNative: true },
    { symbol: 'USDT', name: 'Tether USD (Aptos)', decimals: 6, address: 'native', priceUSD: 1.00, icon: 'usdt', isNative: false }
  ],

  zcash: [
    { symbol: 'ZEC', name: 'Zcash (Shielded & Transparent)', decimals: 8, address: 'native', priceUSD: 1307.00, icon: 'zec', isNative: true, censorshipResistant: true, securityLabel: 'کوین محرمانه (zk-SNARKs)' },
    { symbol: 'ZEC-Z', name: 'ZEC Shielded Pool', decimals: 8, address: 'shielded_pool', priceUSD: 1307.00, icon: 'zec', isNative: false, censorshipResistant: true, securityLabel: 'استخر شیلدد دانش صفر' },
    { symbol: 'USDT', name: 'Tether USD (Bridged)', decimals: 6, address: 'bridged_usdt', priceUSD: 1.00, icon: 'usdt', isNative: false, freezable: true, securityLabel: 'متمرکز (تابع فریز)' }
  ]
};
