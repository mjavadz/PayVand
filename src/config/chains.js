// Centralized Configuration for all 15 Web3 Supported Chains & Networks
// EIP-3085 & EIP-3326 compliant chain definitions for seamless Web3 wallet switching

export const CHAIN_CATEGORIES = [
  { id: 'all', name: 'همه شبکه‌ها' },
  { id: 'ton', name: 'اکوسیستم تلگرام (TON)' },
  { id: 'solana', name: 'اکوسیستم سولانا (Solana)' },
  { id: 'evm', name: 'اتریوم و زنجیره‌های EVM' },
  { id: 'privacy', name: 'توکن‌های محرمانه (Privacy Coins)' },
  { id: 'move', name: 'شبکه‌های نسل نو (Move)' }
];

export const CHAINS = {
  // --- Telegram & High Speed ---
  ton: {
    id: 'ton',
    name: 'شبکه تون',
    englishName: 'The Open Network',
    nativeSymbol: 'TON',
    type: 'ton',
    category: 'ton',
    mainDex: 'STON.fi & DeDust',
    badge: 'کارمزد ناچیز تلگرام',
    color: '#0088CC',
    rpcUrls: ['https://toncenter.com/api/v2/jsonRPC'],
    blockExplorer: 'https://tonviewer.com',
    decimals: 9,
    defaultGas: '0.005 TON'
  },
  solana: {
    id: 'solana',
    name: 'سولانا',
    englishName: 'Solana',
    nativeSymbol: 'SOL',
    type: 'solana',
    category: 'solana',
    mainDex: 'Jupiter & Raydium',
    badge: 'پرسرعت‌ترین شبکه جهانی',
    color: '#9945FF',
    rpcUrls: ['https://api.mainnet-beta.solana.com', 'https://solana-rpc.publicnode.com'],
    blockExplorer: 'https://solscan.io',
    decimals: 9,
    defaultGas: '0.00005 SOL'
  },
  tron: {
    id: 'tron',
    name: 'ترون',
    englishName: 'TRON (TRC-20)',
    nativeSymbol: 'TRX',
    type: 'tron',
    category: 'l1',
    mainDex: 'SunSwap v2.0',
    badge: 'استاندارد انتقال تتر',
    color: '#EF0027',
    rpcUrls: ['https://api.trongrid.io'],
    blockExplorer: 'https://tronscan.org',
    decimals: 6,
    defaultGas: '3.5 TRX'
  },

  // --- Uniswap Major L1s (EVM) ---
  ethereum: {
    id: 'ethereum',
    name: 'اتریوم',
    englishName: 'Ethereum Mainnet',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 1,
    chainIdHex: '0x1',
    category: 'evm',
    mainDex: 'Uniswap v3 / 1inch',
    badge: 'بزرگترین نقدینگی دیفای',
    color: '#627EEA',
    rpcUrls: ['https://eth.llamarpc.com', 'https://ethereum-rpc.publicnode.com'],
    blockExplorer: 'https://etherscan.io',
    decimals: 18,
    defaultGas: '0.0008 ETH'
  },
  bsc: {
    id: 'bsc',
    name: 'بایننس چین',
    englishName: 'BNB Smart Chain',
    nativeSymbol: 'BNB',
    type: 'evm',
    chainId: 56,
    chainIdHex: '0x38',
    category: 'evm',
    mainDex: 'PancakeSwap v3',
    badge: 'شبکه اقتصادی BEP-20',
    color: '#F3BA2F',
    rpcUrls: ['https://binance.llamarpc.com', 'https://bsc-dataseed.binance.org'],
    blockExplorer: 'https://bscscan.com',
    decimals: 18,
    defaultGas: '0.0005 BNB'
  },
  avalanche: {
    id: 'avalanche',
    name: 'آوالانچ',
    englishName: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    type: 'evm',
    chainId: 43114,
    chainIdHex: '0xa86a',
    category: 'evm',
    mainDex: 'Trader Joe & Uniswap',
    badge: 'نقدینگی بالا و سریع',
    color: '#E84142',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc', 'https://avalanche.public-rpc.com'],
    blockExplorer: 'https://snowtrace.io',
    decimals: 18,
    defaultGas: '0.005 AVAX'
  },

  // --- Ethereum Layer 2s (EVM) ---
  base: {
    id: 'base',
    name: 'بیس',
    englishName: 'Base (Coinbase L2)',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 8453,
    chainIdHex: '0x2105',
    category: 'evm',
    mainDex: 'Aerodrome & Uniswap v3',
    badge: 'اکوسیستم رسمی Coinbase',
    color: '#0052FF',
    rpcUrls: ['https://mainnet.base.org', 'https://base.llamarpc.com'],
    blockExplorer: 'https://basescan.org',
    decimals: 18,
    defaultGas: '0.00002 ETH'
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'آربیتروم',
    englishName: 'Arbitrum One',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 42161,
    chainIdHex: '0xa4b1',
    category: 'evm',
    mainDex: 'Uniswap v3 & Camelot',
    badge: 'برترین لایه ۲ اتریوم',
    color: '#28A0F0',
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum.llamarpc.com'],
    blockExplorer: 'https://arbiscan.io',
    decimals: 18,
    defaultGas: '0.00004 ETH'
  },
  optimism: {
    id: 'optimism',
    name: 'آپتیمیزم',
    englishName: 'OP Mainnet',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 10,
    chainIdHex: '0xa',
    category: 'evm',
    mainDex: 'Velodrome & Uniswap v3',
    badge: 'سوپرچین امن اتریوم',
    color: '#FF0420',
    rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.llamarpc.com'],
    blockExplorer: 'https://optimistic.etherscan.io',
    decimals: 18,
    defaultGas: '0.00003 ETH'
  },
  polygon: {
    id: 'polygon',
    name: 'پالیگان',
    englishName: 'Polygon PoS',
    nativeSymbol: 'POL',
    type: 'evm',
    chainId: 137,
    chainIdHex: '0x89',
    category: 'evm',
    mainDex: 'QuickSwap & Uniswap v3',
    badge: 'مقیاس‌پذیر و ارزان',
    color: '#8247E5',
    rpcUrls: ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'],
    blockExplorer: 'https://polygonscan.com',
    decimals: 18,
    defaultGas: '0.01 POL'
  },
  zksync: {
    id: 'zksync',
    name: 'زد‌کی‌سینک',
    englishName: 'zkSync Era',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 324,
    chainIdHex: '0x144',
    category: 'evm',
    mainDex: 'SyncSwap & Uniswap v3',
    badge: 'فناوری دانش صفر (ZK)',
    color: '#8C8DFC',
    rpcUrls: ['https://mainnet.era.zksync.io'],
    blockExplorer: 'https://explorer.zksync.io',
    decimals: 18,
    defaultGas: '0.00003 ETH'
  },
  linea: {
    id: 'linea',
    name: 'لینیا',
    englishName: 'Linea Mainnet',
    nativeSymbol: 'ETH',
    type: 'evm',
    chainId: 59144,
    chainIdHex: '0xe708',
    category: 'evm',
    mainDex: 'SyncSwap & Lynex',
    badge: 'شبکه لایه ۲ Consensys',
    color: '#61DFFF',
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorer: 'https://lineascan.build',
    decimals: 18,
    defaultGas: '0.00004 ETH'
  },

  // --- Next-Gen Move Ecosystem ---
  sui: {
    id: 'sui',
    name: 'سویی',
    englishName: 'Sui Network',
    nativeSymbol: 'SUI',
    type: 'sui',
    category: 'move',
    mainDex: 'Cetus Protocol',
    badge: 'معماری Move پرسرعت',
    color: '#4DA2FF',
    rpcUrls: ['https://fullnode.mainnet.sui.io'],
    blockExplorer: 'https://suiscan.xyz',
    decimals: 9,
    defaultGas: '0.002 SUI'
  },
  aptos: {
    id: 'aptos',
    name: 'آپتوس',
    englishName: 'Aptos',
    nativeSymbol: 'APT',
    type: 'aptos',
    category: 'move',
    mainDex: 'Liquidswap & Pontem',
    badge: 'زبان Move مقیاس‌پذیر',
    color: '#202020',
    rpcUrls: ['https://fullnode.mainnet.aptoslabs.com/v1'],
    blockExplorer: 'https://explorer.aptoslabs.com',
    decimals: 8,
    defaultGas: '0.001 APT'
  },
  zcash: {
    id: 'zcash',
    name: 'زی‌کش',
    englishName: 'Zcash (Shielded)',
    nativeSymbol: 'ZEC',
    type: 'zcash',
    category: 'privacy',
    mainDex: 'Zodl & Noir Shielded',
    badge: 'دانش صفر (zk-SNARKs)',
    color: '#ECB244',
    rpcUrls: ['https://mainnet.lightwalletd.com:9067'],
    blockExplorer: 'https://blockchair.com/zcash',
    decimals: 8,
    defaultGas: '0.0001 ZEC'
  }
};

export const CHAIN_LIST = Object.values(CHAINS);

export function getChainById(id) {
  return CHAINS[id] || CHAINS.ton;
}

export function isEVMChain(chainOrId) {
  const c = typeof chainOrId === 'string' ? CHAINS[chainOrId] : chainOrId;
  return c?.type === 'evm';
}
