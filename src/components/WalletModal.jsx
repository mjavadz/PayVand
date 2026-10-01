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
import { getChainById } from '../config/chains';
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
  { id: 'blast', name: 'بلاست (Blast)', symbol: 'BLAST', tag: 'لایه ۲', desc: 'لایه دوم دارای سودآوری ذاتی برای اتر و تتر' },
];

const EVM_ID_SET = new Set(EVM_NETWORKS.map(c => c.id));

// Top Ecosystem Tabs: Unified EVM family + Non-EVM standalone blockchains
const ECOSYSTEM_TABS = [
  { id: 'evm', name: 'اتریوم و زنجیره‌های EVM', isEvm: true, iconChainId: 'ethereum' },
  { id: 'solana', name: 'سولانا (SOL)', isEvm: false, iconChainId: 'solana' },
  { id: 'ton', name: 'تون (TON)', isEvm: false, iconChainId: 'ton' },
  { id: 'tron', name: 'ترون (TRX)', isEvm: false, iconChainId: 'tron' },
  { id: 'zcash', name: 'زی‌کش (ZEC)', isEvm: false, iconChainId: 'zcash' },
  { id: 'sui', name: 'سویی (SUI)', isEvm: false, iconChainId: 'sui' },
  { id: 'aptos', name: 'آپتوس (APT)', isEvm: false, iconChainId: 'aptos' },
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

  const isCurrentEvm = EVM_ID_SET.has(activeChain);
  const [selectedTab, setSelectedTab] = useState(isCurrentEvm ? 'evm' : activeChain);
  const [selectedEvmChain, setSelectedEvmChain] = useState(isCurrentEvm ? activeChain : 'ethereum');
  const [isEvmDropdownOpen, setIsEvmDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync state whenever modal opens or activeChain updates
  useEffect(() => {
    if (isOpen) {
      if (EVM_ID_SET.has(activeChain)) {
        setSelectedTab('evm');
        setSelectedEvmChain(activeChain);
      } else {
        setSelectedTab(activeChain);
      }
      setLocalError(null);
      setIsEvmDropdownOpen(false);
    }
  }, [isOpen, activeChain]);

  if (!isOpen) return null;

  // The actual blockchain network targeted for connection
  const targetChainId = selectedTab === 'evm' ? selectedEvmChain : selectedTab;
  const chainConfig = getChainById(targetChainId) || getChainById('ethereum');
  const currentWallet = connectedWallets[targetChainId];

  // Resolve wallet options depending on chain type
  const chainType = chainConfig?.type || 'evm';
  const availableWallets = WALLET_OPTIONS[chainType] || WALLET_OPTIONS.evm;
  const currentEvmObj = EVM_NETWORKS.find(n => n.id === selectedEvmChain) || EVM_NETWORKS[0];

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
        <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap gap-1.5">
          {ECOSYSTEM_TABS.map(tab => {
            const isTabActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedTab(tab.id);
                  setLocalError(null);
                  setIsEvmDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  isTabActive 
                    ? 'bg-accent/20 border border-accent/40 text-accent font-bold shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-white/[0.06]'
                }`}
              >
                {tab.isEvm ? (
                  <div className="flex items-center gap-1.5">
                    {getChainIcon('ethereum', 15)}
                    <span>{tab.name}</span>
                  </div>
                ) : (
                  <>
                    {getChainIcon(tab.iconChainId, 15)}
                    <span>{tab.name}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Unified EVM Networks Dropdown Menu (Ethereum + L2s + BSC + Avalanche) */}
        {selectedTab === 'evm' && (
          <div className="px-4 py-3 bg-muted/40 border-b border-border/40 space-y-2 animate-fade-in relative z-20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">انتخاب زنجیره EVM:</span>
              </div>

              {/* EVM Chain Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEvmDropdownOpen(!isEvmDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-accent/40 text-xs font-bold text-foreground transition-all shadow-sm"
                >
                  {getChainIcon(selectedEvmChain, 16)}
                  <span>{currentEvmObj.name}</span>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isEvmDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {isEvmDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 animate-scale-in">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground border-b border-border/40 mb-1">
                      زنجیره‌های سازگار با آدرس اتریوم (0x...)
                    </div>
                    {EVM_NETWORKS.map(evm => {
                      const isSelected = selectedEvmChain === evm.id;
                      return (
                        <button
                          key={evm.id}
                          type="button"
                          onClick={() => {
                            setSelectedEvmChain(evm.id);
                            setIsEvmDropdownOpen(false);
                            setLocalError(null);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-right ${
                            isSelected 
                              ? 'bg-accentSoft text-accent font-bold' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {getChainIcon(evm.id, 18)}
                            <div className="truncate">
                              <span className="font-bold block truncate">{evm.name}</span>
                              <span className="text-[10px] text-muted-foreground">{evm.tag}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-accent shrink-0 mr-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Reassurance Badge: All EVM chains use the same Ethereum address */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>تمام این شبکه‌ها با آدرس اتریوم (0x...) و کیف‌پول‌های یکسان کار می‌کنند.</span>
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
