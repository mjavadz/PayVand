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
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getChainIcon, getWalletIcon } from './Icons';
import { useWallet } from '../context/WalletContext';
import { getChainById, isEVMChain } from '../config/chains';
import { shortenAddress } from '../utils/format';

// All EVM-compatible networks sharing the standard 0x Ethereum address format
const EVM_NETWORKS = [
  { id: 'ethereum', name: 'اتریوم (Ethereum Mainnet)', symbol: 'ETH', tag: 'لایه ۱ اصلی', desc: 'بزرگترین اکوسیستم نقدینگی دیفای' },
  { id: 'arbitrum', name: 'آربیتروم (Arbitrum One)', symbol: 'ARB', tag: 'لایه ۲', desc: 'بزرگترین لایه دوم اتریوم با کمترین کارمزد' },
  { id: 'base', name: 'بیس (Base)', symbol: 'BASE', tag: 'لایه ۲ کوین‌بیس', desc: 'رول‌آپ پرسرعت رسمی شرکت کوین‌بیس' },
  { id: 'bsc', name: 'بایننس چین (BNB Smart Chain)', symbol: 'BNB', tag: 'EVM بایننس', desc: 'شبکه پرسرعت اکوسیستم بایننس' },
  { id: 'polygon', name: 'پالیگان (Polygon PoS)', symbol: 'POL', tag: 'PoS / L2', desc: 'اکوسیستم مقیاس‌پذیر و ارزان' },
  { id: 'avalanche', name: 'آوالانچ (Avalanche C-Chain)', symbol: 'AVAX', tag: 'EVM آواکس', desc: 'تسویه نهایی تراکنش‌ها زیر ۱ ثانیه' },
  { id: 'optimism', name: 'آپتیمیزم (Optimism OP)', symbol: 'OP', tag: 'سوپرچین', desc: 'معماری مقیاس‌پذیری آپتیمیستیک' },
  { id: 'zksync', name: 'زد‌کی‌سینک (zkSync Era)', symbol: 'ZK', tag: 'zk-Rollup', desc: 'امنیت محاسباتی بر پایه دانش صفر' },
  { id: 'linea', name: 'لینیا (Linea zkEVM)', symbol: 'LINEA', tag: 'ConsenSys', desc: 'لایه ۲ رسمی توسعه‌دهنده متامسک' },
];

const EVM_ID_SET = new Set(EVM_NETWORKS.map(c => c.id));

// Top Ecosystem Tabs: Dedicated tabs with authentic logos for each blockchain
const ECOSYSTEM_TABS = [
  { id: 'ton', name: 'تون (TON)', iconChainId: 'ton' },
  { id: 'solana', name: 'سولانا (SOL)', iconChainId: 'solana' },
  { id: 'ethereum', name: 'اتریوم (ETH)', iconChainId: 'ethereum' },
  { id: 'arbitrum', name: 'آربیتروم (ARB)', iconChainId: 'arbitrum' },
  { id: 'base', name: 'بیس (Base)', iconChainId: 'base' },
  { id: 'bsc', name: 'بایننس (BNB)', iconChainId: 'bsc' },
  { id: 'polygon', name: 'پالیگان (POL)', iconChainId: 'polygon' },
  { id: 'avalanche', name: 'آوالانچ (AVAX)', iconChainId: 'avalanche' },
  { id: 'optimism', name: 'آپتیمیزم (OP)', iconChainId: 'optimism' },
  { id: 'zksync', name: 'زد‌کی‌سینک (ZK)', iconChainId: 'zksync' },
  { id: 'linea', name: 'لینیا (Linea)', iconChainId: 'linea' },
  { id: 'zcash', name: 'زی‌کش (ZEC)', iconChainId: 'zcash' },
  { id: 'tron', name: 'ترون (TRX)', iconChainId: 'tron' },
  { id: 'sui', name: 'سویی (SUI)', iconChainId: 'sui' },
  { id: 'aptos', name: 'آپتوس (APT)', iconChainId: 'aptos' },
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
  ],
  zcash: [
    {
      id: 'zodl',
      name: 'Zodl Wallet (سابقاً Zashi)',
      desc: 'کیف‌پول رسمی شیلدد و دانش‌صفر بنیاد ZODL Lab (پیش‌تر Zashi ECC)',
      badge: 'پیشنهادی',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.zodl || window.zashi),
      installUrl: 'https://zodl.com/'
    },
    {
      id: 'noir',
      name: 'Noir Wallet',
      desc: 'کیف‌پول وب۳ زی‌کش با قابلیت سواپ آنی و ارتباط با لایه‌های اتریوم',
      badge: 'توکن‌های محرمانه (Privacy Coins)',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.noirWallet),
      installUrl: 'https://noirwallet.com/'
    },
    {
      id: 'ywallet',
      name: 'YWallet',
      desc: 'کیف‌پول سبک و پرسرعت برای استخرهای سپلینگ و اورکید زی‌کش',
      checkInstalled: () => typeof window !== 'undefined' && Boolean(window.ywallet),
      installUrl: 'https://ywallet.app/'
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

  const [selectedTab, setSelectedTab] = useState(activeChain || 'ethereum');
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync state whenever modal opens or activeChain updates
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(activeChain || 'ethereum');
      setLocalError(null);
    }
  }, [isOpen, activeChain]);

  if (!isOpen) return null;

  // The actual blockchain network targeted for connection
  const targetChainId = selectedTab;
  const chainConfig = getChainById(targetChainId) || getChainById('ethereum');
  const currentWallet = connectedWallets[targetChainId];

  // Resolve wallet options depending on chain type
  const chainType = isEVMChain(chainConfig) ? 'evm' : (chainConfig?.type || 'evm');
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
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accentSoft border border-accent/30 flex items-center justify-center text-accent">
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

        {/* Primary Ecosystem Tabs - Flex-wrap to prevent horizontal scrolling */}
        <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {ECOSYSTEM_TABS.map(tab => {
            const isTabActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedTab(tab.id);
                  setLocalError(null);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  isTabActive 
                    ? 'bg-accent/20 border border-accent/40 text-accent font-bold shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-white/[0.06]'
                }`}
              >
                {getChainIcon(tab.iconChainId, 15)}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Informational banner for EVM chains */}
        {isEVMChain(chainConfig) && (
          <div className="px-4 py-2 bg-muted/40 border-b border-border/40 flex items-center justify-between text-[11px] text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>سازگار با استاندارد آدرس اتریوم (0x...)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              {getChainIcon(chainConfig.id, 14)}
              <span>{chainConfig.name}</span>
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {(localError || connectError) && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-destructiveSoft border border-destructive/30 flex items-start gap-2.5 text-xs text-red-300 animate-fade-in">
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
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
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

                <div className="flex items-center justify-between p-2.5 bg-background border border-border rounded-xl">
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
          <div className="mt-4 p-3 rounded-2xl bg-background border border-border/40 flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
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
