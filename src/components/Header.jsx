import React from 'react';
import { 
  WalletIcon, 
  Clock, 
  CreditCard,
  Wallet,
  Store
} from 'lucide-react';
import { 
  ChainLogo,
  StarsIcon,
  IranFlagIcon
} from './Icons';
import { shortenAddress } from '../utils/format';
import { Badge } from '@/components/ui/badge';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  activeChain, 
  walletAddress, 
  isDemo,
  onOpenWalletModal,
  onOpenChainSelector
}) {
  const renderChainIcon = () => (
    <ChainLogo chainId={activeChain} size={16} />
  );

  const getChainName = () => {
    const names = {
      ethereum: 'اتریوم',
      solana: 'سولانا',
      ton: 'تون',
      tron: 'ترون',
      bsc: 'بایننس چین',
      base: 'بیس',
      arbitrum: 'آربیتروم',
      optimism: 'آپتیمیزم',
      polygon: 'پالیگان',
      avalanche: 'آوالانچ',
      zksync: 'زد‌کی‌سینک',
      linea: 'لینیا',
      sui: 'سویی',
      aptos: 'آپتوس',
      zcash: 'زی‌کش',
    };
    return names[activeChain] || 'شبکه';
  };

  const tabs = [
    { id: 'swap', label: 'سواپ و تلگرام', icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg> },
    { id: 'wallet', label: 'کیف‌پول پی‌وند', icon: <Wallet size={14} /> },
    { id: 'checkout', label: 'درگاه و افزونه', icon: <Store size={14} /> },
    { id: 'iran', label: 'جعبه‌ابزار ایران', icon: <IranFlagIcon size={16} /> },
    { id: 'orders', label: 'سفارشات', icon: <Clock size={14} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 group" aria-label="PayVand Home">
            <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.svg" alt="PayVand Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.35)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-foreground tracking-tight hidden sm:block font-sans">PayVand</span>
              <span className="text-xs font-bold text-accent hidden md:inline font-sans">پی‌وند</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse hidden sm:block" />
            </div>
          </a>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-0.5 p-1 bg-muted/40 border border-border rounded-xl" aria-label="Main navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground border border-border shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Active Chain Selector */}
          <button
            type="button"
            onClick={onOpenChainSelector}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-card border border-border hover:border-accent/40 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground"
            title="انتخاب شبکه مبادله"
            aria-label="Select network"
          >
            {renderChainIcon()}
            <span className="hidden sm:inline">{getChainName()}</span>
          </button>

          {/* Wallet Connect Button with VibeFarsi styling */}
          <button
            type="button"
            onClick={onOpenWalletModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              walletAddress
                ? 'bg-card border border-accent/40 text-accent hover:bg-muted'
                : 'bg-accent text-background font-bold hover:bg-emerald-600 active:scale-[0.98]'
            }`}
            aria-label={walletAddress ? 'Wallet connected' : 'Connect wallet'}
          >
            {walletAddress ? (
              <>
                <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-accent'} animate-pulse`} aria-hidden="true" />
                <span className="font-mono" dir="ltr">{shortenAddress(walletAddress)}</span>
                {isDemo && <span className="text-[10px] text-amber-400 font-normal">(دمو)</span>}
              </>
            ) : (
              <>
                <WalletIcon size={14} />
                <span>اتصال کیف پول</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
