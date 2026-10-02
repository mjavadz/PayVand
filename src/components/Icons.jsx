import React from 'react';

// Official Authentic Blockchain Logos
export const ChainLogo = ({ chainId, size = 20, className = '' }) => {
  if (chainId === 'zcash') {
    return <ZcashIcon size={size} className={className} />;
  }
  const normId = chainId === 'binance' ? 'bsc' : (chainId === 'avalanchec' ? 'avalanche' : chainId);
  return (
    <img
      src={`/assets/icons/chains/${normId}.png`}
      alt={chainId}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-contain shrink-0 ${className}`}
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
        return '/assets/icons/wallets/suiet.svg';
      case 'petra':
        return '/assets/icons/wallets/petra.svg';
      case 'pontem':
        return '/assets/icons/wallets/petra.svg';
      case 'coinbase':
        return '/assets/icons/wallets/coinbase.svg';
      case 'okx':
        return '/assets/icons/wallets/okx.svg';
      case 'zodl':
      case 'zashi':
        return '/assets/icons/wallets/zodl.png';
      default:
        return null;
    }
  };

  const src = getWalletSrc(walletId);
  if (walletId === 'noir') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={`rounded-xl shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#121826" />
        <circle cx="16" cy="16" r="10" stroke="#00E599" strokeWidth="2" fill="none" />
        <path d="M11 16l3.5 3.5L21 12" stroke="#00E599" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (walletId === 'ywallet') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={`rounded-xl shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#1E2330" />
        <path d="M10 10l6 7v6h2v-6l6-7h-3.5L17 14.5 13.5 10H10z" fill="#ECB244" />
      </svg>
    );
  }
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
    sui: 'sui',
    apt: 'aptos',
    aptos: 'aptos',
    zec: 'zcash',
    zcash: 'zcash'
  };

  if (chainMap[norm]) {
    return <ChainLogo chainId={chainMap[norm]} size={size} className={className} />;
  }

  if (norm === 'dai') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={`rounded-full shrink-0 ${className}`}>
        <circle cx="16" cy="16" r="16" fill="#F4B731" />
        <path d="M9 7.5h7.2c4.4 0 7.8 3.4 7.8 8.5s-3.4 8.5-7.8 8.5H9v-17zm3.2 3.1v10.8h4c2.8 0 4.6-2.1 4.6-5.4s-1.8-5.4-4.6-5.4h-4z" fill="#FFF" />
        <path d="M7 13h18v2.1H7zM7 17h18v2.1H7z" fill="#FFF" />
      </svg>
    );
  }

  if (norm === 'lusd') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={`rounded-full shrink-0 ${className}`}>
        <circle cx="16" cy="16" r="16" fill="#2E3A59" />
        <path d="M12 8v16h10v-3.5h-6V8H12z" fill="#7E92B6" />
        <circle cx="16" cy="16" r="13" stroke="#7E92B6" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (norm === 'zec' || norm === 'zcash' || norm === 'zec-z') {
    return <ZcashIcon size={size} className={className} />;
  }

  if (norm === 'stars') {
    return <StarsIcon size={size} className={className} />;
  }

  if (norm === 'gram') {
    return <GramIcon size={size} className={className} />;
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

export const ZcashIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={`rounded-full shrink-0 ${className}`}>
    <circle cx="16" cy="16" r="16" fill="#ECB244" />
    <path fill="#FFF" fillRule="nonzero" d="M15.096 19.846h6.297v3.35h-3.875c.064.958.097 1.847.161 2.804h-3.261v-2.77h-3.876c0-1.093-.129-2.187.065-3.213.097-.547.678-1.026 1.033-1.504a462.137 462.137 0 013.714-4.581c.485-.582.969-1.129 1.518-1.778h-6.04v-3.35h3.586V6h3.132v2.735h3.908c0 1.128.129 2.222-.065 3.248-.097.547-.678 1.026-1.065 1.504a462.138 462.138 0 01-3.714 4.581 37.083 37.083 0 01-1.518 1.778z" />
  </svg>
);

export const ZecIcon = ZcashIcon;

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

// Authentic Iranian Lion and Sun Flag (شیر و خورشید)
export const IranFlagIcon = ({ size = 20, className = '' }) => {
  const height = Math.round(size * 0.67);
  return (
    <svg 
      width={size} 
      height={height} 
      viewBox="0 0 48 32" 
      fill="none" 
      className={`shrink-0 inline-block align-middle rounded-[3px] shadow-xs ${className}`}
    >
      <defs>
        <clipPath id="iranFlagClipInline">
          <rect width="48" height="32" rx="4" fill="#fff"/>
        </clipPath>
      </defs>
      <g clipPath="url(#iranFlagClipInline)">
        <rect width="48" height="10.67" fill="#239F40"/>
        <rect y="10.67" width="48" height="10.66" fill="#FFFFFF"/>
        <rect y="21.33" width="48" height="10.67" fill="#DA0000"/>
        
        {/* Sun */}
        <circle cx="23.5" cy="14.5" r="4.2" fill="#F59E0B"/>
        <path d="M23.5 8.5L24.5 11H22.5Z" fill="#D97706"/>
        <path d="M19.2 10.2L21.5 12L20.5 12.8Z" fill="#D97706"/>
        <path d="M27.8 10.2L26.5 12.8L25.5 12Z" fill="#D97706"/>
        <path d="M16.5 13.5L19.2 14.2L18.8 13.2Z" fill="#D97706"/>
        <path d="M30.5 13.5L28.2 13.2L27.8 14.2Z" fill="#D97706"/>

        {/* Lion */}
        <path d="M16.5 17.5C15.5 15.5 16 13.5 17.5 12.8C18 12.5 18.5 13 18.2 13.5C17.2 14 17 15.5 17.8 17Z" fill="#B45309"/>
        <path d="M17.5 17C18.5 15.5 20.5 15 22.5 15C24.5 15 26 15.5 27 14.5C28 13.8 29.5 14.2 30 15C30.5 15.8 30 17 28.5 17.8C27 18.5 24 18.8 21.5 18.8C19.5 18.8 18 18 17.5 17Z" fill="#D97706"/>
        <circle cx="29" cy="14" r="2.2" fill="#D97706"/>
        <circle cx="29" cy="14" r="1.4" fill="#F59E0B"/>
        <circle cx="29.8" cy="13.6" r="0.4" fill="#78350F"/>
        <rect x="18" y="17.5" width="1.6" height="3.5" rx="0.6" fill="#B45309"/>
        <rect x="21" y="17.8" width="1.5" height="3.2" rx="0.6" fill="#D97706"/>
        <rect x="25.5" y="17.8" width="1.6" height="3.2" rx="0.6" fill="#D97706"/>
        <path d="M28 16.5L30.5 15" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M29.5 16.5L31.5 13.5C32.5 12 34 11 35.5 10.5C35.8 10.5 35.8 11 35.2 11.5C33.8 12.5 32.8 13.8 32 15.8L30.5 17.2Z" fill="#1E293B"/>
        <path d="M30 15.5C31.5 13 33 11.8 35.2 11" stroke="#FBBF24" strokeWidth="0.8" strokeLinecap="round"/>
      </g>
      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    </svg>
  );
};

// Telegram Gram Token Vector Icon
export const GramIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="gramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2AABEE" />
        <stop offset="100%" stopColor="#229ED9" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="16" fill="url(#gramGrad)" />
    <path d="M16 6L24.5 12L16 26L7.5 12L16 6Z" fill="#FFFFFF" fillOpacity="0.9" />
    <path d="M16 6L24.5 12H7.5L16 6Z" fill="#FFFFFF" fillOpacity="0.4" />
    <path d="M16 26L7.5 12H16V26Z" fill="#000000" fillOpacity="0.12" />
  </svg>
);

// Master Dynamic Icon Helpers
export const getChainIcon = (chainId, size = 20, className = '') => (
  <ChainLogo chainId={chainId} size={size} className={className} />
);

export const getWalletIcon = (walletId, size = 24, className = '') => (
  <WalletLogo walletId={walletId} size={size} className={className} />
);
