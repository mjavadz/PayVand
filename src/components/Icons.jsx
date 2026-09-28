import React from 'react';

// Official Authentic Blockchain Logos
export const ChainLogo = ({ chainId, size = 20, className = '' }) => {
  const normId = chainId === 'binance' ? 'bsc' : (chainId === 'avalanchec' ? 'avalanche' : chainId);
  return (
    <img
      src={`/assets/icons/chains/${normId}.png`}
      alt={chainId}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-contain shrink-0 ${className}`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/assets/icons/chains/ethereum.png';
      }}
    />
  );
};

// Official Authentic Web3 Wallet Logos
export const WalletLogo = ({ walletId, size = 24, className = '' }) => {
  const getWalletSrc = (id) => {
    switch (id) {
      case 'metamask':
        return '/assets/icons/wallets/metamask.svg';
      case 'rabby':
        return '/assets/icons/wallets/rabby.svg';
      case 'trustwallet':
        return '/assets/icons/wallets/trustwallet.svg';
      case 'phantom':
        return '/assets/icons/wallets/phantom.svg';
      case 'solflare':
        return '/assets/icons/wallets/solflare.svg';
      case 'tonkeeper':
        return '/assets/icons/wallets/tonkeeper.png';
      case 'mytonwallet':
        return '/assets/icons/wallets/mytonwallet.png';
      case 'tronlink':
        return '/assets/icons/wallets/tronlink.png';
      case 'suiet':
        return '/assets/icons/wallets/suiet.svg';
      case 'suiwallet':
        return '/assets/icons/chains/sui.png';
      case 'petra':
        return '/assets/icons/wallets/petra.ico';
      case 'pontem':
        return '/assets/icons/chains/aptos.png';
      case 'coinbase':
        return '/assets/icons/wallets/coinbase.svg';
      case 'okx':
        return '/assets/icons/wallets/okx.svg';
      default:
        return null;
    }
  };

  const src = getWalletSrc(walletId);
  if (!src) {
    return <WalletIcon size={size} className={className} />;
  }

  return (
    <img
      src={src}
      alt={walletId}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
};

// Official Token Logos (USDT, USDC, WBTC, UNI, etc.)
export const TokenLogo = ({ symbol = '', size = 20, className = '' }) => {
  const norm = (symbol || '').toLowerCase();
  
  // Chain tokens mapping
  const chainMap = {
    eth: 'ethereum',
    ethereum: 'ethereum',
    sol: 'solana',
    solana: 'solana',
    ton: 'ton',
    trx: 'tron',
    tron: 'tron',
    bnb: 'bsc',
    bsc: 'bsc',
    arb: 'arbitrum',
    arbitrum: 'arbitrum',
    base: 'base',
    pol: 'polygon',
    polygon: 'polygon',
    matic: 'polygon',
    avax: 'avalanche',
    avalanche: 'avalanche',
    op: 'optimism',
    optimism: 'optimism',
    zk: 'zksync',
    zksync: 'zksync',
    linea: 'linea',
    blast: 'blast',
    sui: 'sui',
    apt: 'aptos',
    aptos: 'aptos'
  };

  if (chainMap[norm]) {
    return <ChainLogo chainId={chainMap[norm]} size={size} className={className} />;
  }

  // Token asset mapping
  const tokenMap = {
    usdt: '/assets/icons/tokens/usdt.png',
    usdc: '/assets/icons/tokens/usdc.png',
    wbtc: '/assets/icons/tokens/wbtc.png',
    btc: '/assets/icons/tokens/wbtc.png',
    uni: '/assets/icons/tokens/uni.png',
  };

  const src = tokenMap[norm] || '/assets/icons/tokens/usdt.png';

  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-contain shrink-0 ${className}`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/assets/icons/chains/ethereum.png';
      }}
    />
  );
};

// Exported standard icon aliases to ensure full backwards-compatibility
export const EthereumIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="ethereum" size={size} className={className} />
);

export const SolanaIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="solana" size={size} className={className} />
);

export const TonIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="ton" size={size} className={className} />
);

export const TronIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="tron" size={size} className={className} />
);

export const BnbIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="bsc" size={size} className={className} />
);

export const ArbitrumIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="arbitrum" size={size} className={className} />
);

export const BaseIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="base" size={size} className={className} />
);

export const PolygonIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="polygon" size={size} className={className} />
);

export const OptimismIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="optimism" size={size} className={className} />
);

export const AvalancheIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="avalanche" size={size} className={className} />
);

export const ZkSyncIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="zksync" size={size} className={className} />
);

export const SuiIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="sui" size={size} className={className} />
);

export const AptosIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="aptos" size={size} className={className} />
);

export const LineaIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="linea" size={size} className={className} />
);

export const BlastIcon = ({ size = 24, className = '' }) => (
  <ChainLogo chainId="blast" size={size} className={className} />
);

export const UsdtIcon = ({ size = 24, className = '' }) => (
  <TokenLogo symbol="usdt" size={size} className={className} />
);

// Telegram Stars Vector Icon (Custom Golden Star)
export const StarsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="16" fill="url(#star_bg)" />
    <path d="M16 6.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L16 6.5z" fill="#FFF" />
    <path d="M16 8.5l2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.7L16 8.5z" fill="#FBBF24" />
    <defs>
      <linearGradient id="star_bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

// Wallet Brand Icons
export const MetaMaskIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="metamask" size={size} className={className} />
);

export const PhantomIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="phantom" size={size} className={className} />
);

export const SolflareIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="solflare" size={size} className={className} />
);

export const TonkeeperIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="tonkeeper" size={size} className={className} />
);

export const TrustWalletIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="trustwallet" size={size} className={className} />
);

export const RabbyIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="rabby" size={size} className={className} />
);

export const TronLinkIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="tronlink" size={size} className={className} />
);

export const SuiWalletIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="suiet" size={size} className={className} />
);

export const PetraIcon = ({ size = 24, className = '' }) => (
  <WalletLogo walletId="petra" size={size} className={className} />
);

// Generic UI Icons
export const ArrowDownUp = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 16 4 4 4-4" />
    <path d="M7 20V4" />
    <path d="m21 8-4-4-4 4" />
    <path d="M17 4v16" />
  </svg>
);

export const WalletIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

export const CheckIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CopyIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const ExternalLinkIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

export const SparklesIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
  </svg>
);

export const ShieldCheckIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

// Master Dynamic Icon Helpers
export const getChainIcon = (chainId, size = 20, className = '') => (
  <ChainLogo chainId={chainId} size={size} className={className} />
);

export const getWalletIcon = (walletId, size = 24, className = '') => (
  <WalletLogo walletId={walletId} size={size} className={className} />
);
