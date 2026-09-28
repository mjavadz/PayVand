import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  LogOut, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Info,
  ChevronDown,
  Layers
} from 'lucide-react';
import { getChainIcon, getWalletIcon, ArbitrumIcon, BaseIcon, PolygonIcon } from './Icons';
import { useWallet } from '../context/WalletContext';
import { getChainById } from '../config/chains';
import { shortenAddress } from '../utils/format';

// Ethereum Layer 2 networks grouped into dropdown
const ETH_L2_CHAINS = [
  { id: 'arbitrum', name: 'آربیتروم (Arbitrum One)', symbol: 'ARB', desc: 'بزرگترین لایه دوم اتریوم با کمترین کارمزد' },
  { id: 'base', name: 'بیس (Base)', symbol: 'BASE', desc: 'لایه دوم پرسرعت رسمی صرافی کوین‌بیس' },
  { id: 'polygon', name: 'پالیگان (Polygon)', symbol: 'POL', desc: 'اکوسیستم مقیاس‌پذیر و پرسرعت PoS' },
  { id: 'optimism', name: 'آپتیمیزم (Optimism)', symbol: 'OP', desc: 'معماری پیشرفته سوپرچین (Superchain)' },
  { id: 'zksync', name: 'زد‌کی‌سینک (zkSync Era)', symbol: 'ZK', desc: 'رول‌آپ با امنیت محاسباتی دانش صفر' },
  { id: 'linea', name: 'لینیا (Linea)', symbol: 'LINEA', desc: 'شبکه zkEVM شرکت ConsenSys (توسعه‌دهنده متامسک)' },
  { id: 'blast', name: 'بلاست (Blast)', symbol: 'BLAST', desc: 'لایه دوم دارای سوددهی ذاتی دارایی‌ها' },
];

const L2_IDS = new Set(ETH_L2_CHAINS.map(c => c.id));

// Standalone primary blockchains
const STANDALONE_TABS = [
  { id: 'ethereum', name: 'اتریوم (ETH)', isL2Group: false },
  { id: 'eth_l2', name: 'لایه‌های ۲ اتریوم', isL2Group: true },
  { id: 'solana', name: 'سولانا (SOL)', isL2Group: false },
  { id: 'ton', name: 'تون (TON)', isL2Group: false },
  { id: 'tron', name: 'ترون (TRX)', isL2Group: false },
  { id: 'bsc', name: 'بایننس (BNB)', isL2Group: false },
  { id: 'avalanche', name: 'آوالانچ (AVAX)', isL2Group: false },
  { id: 'sui', name: 'سویی (SUI)', isL2Group: false },
  { id: 'aptos', name: 'آپتوس (APT)', isL2Group: false },
];

const WALLET_OPTIONS = {
  evm: [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      desc: 'پرکاربردترین کیف‌پول وب۳ و افزونه مرورگر', 
      badge: 'پیشنهادی', 
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask),
      installUrl: 'https://metamask.io/download/'
    },
    { 
      id: 'rabby', 
      name: 'Rabby Wallet', 
      desc: 'امن‌ترین ولت دسکتاپ با شبیه‌سازی پیشرفته تراکنش', 
      badge: 'امنیت بالا',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.ethereum?.isRabby),
      installUrl: 'https://rabby.io/'
    },
    { 
      id: 'trustwallet', 
      name: 'Trust Wallet', 
      desc: 'کیف‌پول چند ارزی بایننس برای موبایل و افزونه',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.ethereum?.isTrust),
      installUrl: 'https://trustwallet.com/'
    },
    { 
      id: 'injected', 
      name: 'کیف‌پول مرورگر (Injected Web3)', 
      desc: 'اتصال خودکار به افزونه پیش‌فرض اتریوم',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.ethereum),
      installUrl: null
    }
  ],
  solana: [
    { 
      id: 'phantom', 
      name: 'Phantom', 
      desc: 'کیف‌پول سریع، امن و استاندارد سولانا', 
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.phantom?.solana || window.solana?.isPhantom),
      installUrl: 'https://phantom.app/'
    },
    { 
      id: 'solflare', 
      name: 'Solflare', 
      desc: 'پشتیبانی تخصصی از استیکینگ و دیفای سولانا',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.solflare),
      installUrl: 'https://solflare.com/'
    }
  ],
  ton: [
    { 
      id: 'tonkeeper', 
      name: 'Tonkeeper', 
      desc: 'محبوب‌ترین کیف‌پول اکوسیستم تلگرام و تون', 
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.tonkeeper || window.ton),
      installUrl: 'https://tonkeeper.com/'
    },
    { 
      id: 'mytonwallet', 
      name: 'MyTonWallet', 
      desc: 'پشتیبانی از چند حساب و استیکینگ توکن‌های TON',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.mytonwallet),
      installUrl: 'https://mytonwallet.io/'
    }
  ],
  tron: [
    { 
      id: 'tronlink', 
      name: 'TronLink', 
      desc: 'کیف‌پول رسمی شبکه ترون برای توکن‌های TRC-20', 
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.tronLink || window.tronWeb),
      installUrl: 'https://www.tronlink.org/'
    }
  ],
  sui: [
    {
      id: 'suiet',
      name: 'Suiet Wallet',
      desc: 'کیف‌پول بومی و امن شبکه سویی (Sui)',
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.suiet),
      installUrl: 'https://suiet.app/'
    },
    {
      id: 'suiwallet',
      name: 'Sui Wallet',
      desc: 'کیف‌پول رسمی بنیاد Mysten Labs برای سویی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.suiWallet),
      installUrl: 'https://sui.io/'
    }
  ],
  aptos: [
    {
      id: 'petra',
      name: 'Petra Wallet',
      desc: 'کیف‌پول رسمی بنیاد Aptos Labs',
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.aptos),
      installUrl: 'https://petra.app/'
    },
    {
      id: 'pontem',
      name: 'Pontem Wallet',
      desc: 'کیف‌پول تخصصی دیفای و صرافی‌های آپتوس',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.pontem),
      installUrl: 'https://pontem.network/'
    }
  ]
};

export default function WalletModal({ isOpen, onClose }) {
  const { 
    activeChain, 
    setActiveChain, 
    connectedWallets, 
    connectWallet, 
    connectDemoMode,
    disconnectWallet, 
    isConnecting,
    connectError 
  } = useWallet();

  const isInitialL2 = L2_IDS.has(activeChain);
  const [selectedMainTab, setSelectedMainTab] = useState(isInitialL2 ? 'eth_l2' : activeChain);
  const [selectedL2Chain, setSelectedL2Chain] = useState(isInitialL2 ? activeChain : 'arbitrum');
  const [isL2DropdownOpen, setIsL2DropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync state whenever modal opens or activeChain updates
  useEffect(() => {
    if (isOpen) {
      if (L2_IDS.has(activeChain)) {
        setSelectedMainTab('eth_l2');
        setSelectedL2Chain(activeChain);
      } else {
        setSelectedMainTab(activeChain);
      }
      setLocalError(null);
      setIsL2DropdownOpen(false);
    }
  }, [isOpen, activeChain]);

  if (!isOpen) return null;

  // The actual chain id for current wallet connection
  const targetChainId = selectedMainTab === 'eth_l2' ? selectedL2Chain : selectedMainTab;
  const chainConfig = getChainById(targetChainId) || getChainById('ethereum');
  const currentWallet = connectedWallets[targetChainId];

  // Resolve wallet options depending on chain type
  const chainType = chainConfig?.type || 'evm';
  const availableWallets = WALLET_OPTIONS[chainType] || WALLET_OPTIONS.evm;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectWallet = async (wallet) => {
    setLocalError(null);
    try {
      await connectWallet(targetChainId, wallet.name);
      if (activeChain !== targetChainId) {
        await setActiveChain(targetChainId);
      }
      onClose();
    } catch (e) {
      setLocalError(e.message || 'خطا در برقراری ارتباط با کیف‌پول');
    }
  };

  const handleEnableDemo = () => {
    connectDemoMode(targetChainId);
    if (activeChain !== targetChainId) {
      setActiveChain(targetChainId);
    }
    onClose();
  };

  const handleDisconnect = () => {
    disconnectWallet(targetChainId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accentSoft border border-accent/30 flex items-center justify-center text-accent">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">اتصال به کیف‌پول (غیرحضانتی)</h3>
              <p className="text-xs text-muted-foreground">کلیدهای خصوصی هرگز از دستگاه شما خارج نمی‌شوند</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Blockchains Tabs */}
        <div className="p-2.5 bg-background/60 border-b border-border flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {STANDALONE_TABS.map(tab => {
            const isTabActive = selectedMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedMainTab(tab.id);
                  setLocalError(null);
                  setIsL2DropdownOpen(false);
                }}
                className={`shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  isTabActive 
                    ? 'bg-accent/15 border border-accent/40 text-accent font-bold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {tab.isL2Group ? (
                  <div className="flex items-center gap-1">
                    <Layers size={14} className={isTabActive ? 'text-accent' : 'text-muted-foreground'} />
                    <span className="whitespace-nowrap">{tab.name}</span>
                  </div>
                ) : (
                  <>
                    {getChainIcon(tab.id, 16)}
                    <span className="whitespace-nowrap">{tab.name}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Ethereum Layer 2 Dropdown Bar (Visible only when L2 group tab is selected) */}
        {selectedMainTab === 'eth_l2' && (
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between gap-3 animate-fade-in relative z-20">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-accent" />
              <span className="text-xs font-bold text-foreground">انتخاب لایه دوم:</span>
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsL2DropdownOpen(!isL2DropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-accent/50 text-xs font-bold text-foreground transition-all shadow-sm"
              >
                {getChainIcon(selectedL2Chain, 15)}
                <span>{getChainById(selectedL2Chain)?.name || selectedL2Chain}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isL2DropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isL2DropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-30 space-y-1 animate-scale-in">
                  <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground border-b border-border/60 mb-1">
                    شبکه‌های مقیاس‌پذیری اتریوم (Rollups)
                  </div>
                  {ETH_L2_CHAINS.map(l2 => {
                    const isSelected = selectedL2Chain === l2.id;
                    return (
                      <button
                        key={l2.id}
                        type="button"
                        onClick={() => {
                          setSelectedL2Chain(l2.id);
                          setIsL2DropdownOpen(false);
                          setLocalError(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-right ${
                          isSelected 
                            ? 'bg-accentSoft text-accent font-bold' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getChainIcon(l2.id, 16)}
                          <div>
                            <span className="font-bold block">{l2.name}</span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {(localError || connectError) && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-destructiveSoft border border-destructive/30 flex items-start gap-2.5 text-xs text-red-300 animate-fade-in">
            <AlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{localError || connectError}</span>
            </div>
          </div>
        )}

        {/* Modal Body: Connected view vs Provider list */}
        <div className="p-4 sm:p-5">
          {currentWallet ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-accent/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <div className="flex items-center gap-1.5">
                      {getChainIcon(chainConfig.id, 16)}
                      <span className="text-xs font-bold text-accent">
                        متصل به شبکه {chainConfig.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentWallet.walletName}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg">
                  <span className="font-mono text-sm text-foreground" dir="ltr">
                    {shortenAddress(currentWallet.address, 8)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentWallet.address)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-emerald-300 font-bold px-2 py-1 rounded bg-accentSoft transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>

                {currentWallet.isDemo && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                    <Info size={13} />
                    <span>حالت مشاهده آزمایشی فعال است (تراکنش‌های واقعی ثبت نمی‌شوند).</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveChain(targetChainId);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-emerald-600 text-background font-bold text-sm transition-all"
                >
                  استفاده از این شبکه
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="p-2.5 rounded-xl border border-destructive/30 hover:bg-destructiveSoft text-destructive transition-colors"
                  title="قطع اتصال این کیف‌پول"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  {getChainIcon(chainConfig.id, 16)}
                  <span>کیف‌پول‌های سازگار با {chainConfig.name}:</span>
                </div>
                <span className="font-mono text-[11px] text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {chainConfig.nativeSymbol}
                </span>
              </div>

              {availableWallets.map((wallet) => {
                const isInstalled = wallet.checkInstalled();
                return (
                  <button
                    key={wallet.id}
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleSelectWallet(wallet)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-accent/40 transition-all text-right group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Seamless Wallet Logo — Clean and borderless */}
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        {getWalletIcon(wallet.id, 32, "rounded-xl")}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                            {wallet.name}
                          </span>
                          {isInstalled && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accentSoft text-accent border border-accent/20">
                              نصب شده
                            </span>
                          )}
                          {wallet.badge && !isInstalled && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground border border-border">
                              {wallet.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{wallet.desc}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-muted-foreground group-hover:text-accent transition-colors shrink-0 mr-2">
                      اتصال ➔
                    </span>
                  </button>
                );
              })}

              {/* Demo Mode Button for testing/reviewing */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleEnableDemo}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-border hover:border-accent/40 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles size={14} className="text-accent" />
                  <span>مشاهده رابط در حالت آزمایشی (Demo Mode)</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="mt-4 p-3 rounded-xl bg-background border border-border/60 flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
            <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
            <span>
              <strong>امنیت ۱۰۰٪ تضمین‌شده:</strong> ارتباط شما صرفاً از طریق استاندارد رسمی امضای Web3 برقرار می‌شود. هیچ رمز، کلید خصوصی یا دسترسی حساسی از شما خواسته نخواهد شد.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
