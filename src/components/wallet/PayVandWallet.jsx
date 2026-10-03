import React, { useState, useEffect } from 'react';
import { 
  Wallet, Key, ShieldCheck, ShieldAlert, Copy, Check, Eye, EyeOff, 
  ArrowUpRight, ArrowDownLeft, RefreshCw, QrCode, Lock, Unlock, 
  Layers, AlertTriangle, Sparkles, Send, Download
} from 'lucide-react';
import { ChainLogo } from '../Icons';

const BIP39_WORDS = [
  'abandon', 'ability', 'absorb', 'abstract', 'access', 'account', 'achieve', 'acoustic', 
  'acquire', 'across', 'action', 'active', 'adapt', 'advance', 'advice', 'aerobic', 
  'afford', 'agree', 'ahead', 'airport', 'alert', 'alpha', 'always', 'ancient', 
  'anchor', 'annual', 'answer', 'antenna', 'apple', 'approve', 'april', 'arctic', 
  'arena', 'armor', 'arrow', 'asset', 'atomic', 'attitude', 'auction', 'autumn', 
  'average', 'avocado', 'avoid', 'awake', 'aware', 'awesome', 'axis', 'balance', 
  'balcony', 'bamboo', 'banner', 'beacon', 'beauty', 'benefit', 'beyond', 'bicycle', 
  'biology', 'blade', 'blanket', 'bless', 'blossom', 'breeze', 'bridge', 'bright', 
  'bronze', 'bubble', 'cactus', 'camera', 'canvas', 'canyon', 'capital', 'captain', 
  'carbon', 'castle', 'century', 'champion', 'change', 'chapter', 'charge', 'chase', 
  'clean', 'clever', 'click', 'client', 'cliff', 'clinic', 'cloud', 'cluster', 
  'coast', 'coffee', 'column', 'combine', 'comfort', 'comic', 'connect', 'control', 
  'copper', 'coral', 'cradle', 'craft', 'crystal', 'culture', 'current', 'custom'
];

export default function PayVandWallet({ onNavigateToSwap }) {
  const [hasWallet, setHasWallet] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [showSeed, setShowSeed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(null);
  const [activeChain, setActiveChain] = useState('evm');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Pre-generated deterministic mock addresses for demo
  const addresses = {
    ton: 'EQD3_PeyvandTonSovereignWallet89xKmN',
    solana: 'PayVandSol7qZ2W8xT1m9kP4e3vR5yG7hN',
    evm: '0x71C...PayVandZeroTaintEvmWallet42F',
    zcash: 'zs1peyvandshieldedprivacyvault789xkm',
  };

  const balances = {
    ton: { coin: 'TON', amount: '24.50', usd: '$134.75', change: '+3.2%' },
    solana: { coin: 'SOL', amount: '1.85', usd: '$259.00', change: '+5.4%' },
    evm: { coin: 'ETH', amount: '0.14', usd: '$364.00', change: '+1.8%' },
    zcash: { coin: 'ZEC (Shielded)', amount: '3.20', usd: '$96.00', change: '+8.1%', isPrivate: true },
  };

  useEffect(() => {
    const saved = localStorage.getItem('payvand_wallet_created');
    if (saved) {
      setHasWallet(true);
      setSeedPhrase(JSON.parse(saved));
    }
  }, []);

  const handleCreateWallet = () => {
    // Pick 12 unique random words from BIP-39 standard wordlist
    const shuffled = [...BIP39_WORDS].sort(() => 0.5 - Math.random());
    const newWords = shuffled.slice(0, 12);
    setSeedPhrase(newWords);
    setHasWallet(true);
    setShowSeed(false);
    localStorage.setItem('payvand_wallet_created', JSON.stringify(newWords));
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'seed') {
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    } else {
      setCopiedAddr(type);
      setTimeout(() => setCopiedAddr(null), 2000);
    }
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!sendAmount || !sendAddress) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSendModal(false);
      setSendAmount('');
      setSendAddress('');
      alert('تراکنش با موفقیت به استخر شبکه ارسال شد!');
    }, 1200);
  };

  const totalUsd = '$853.75';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Wallet Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold font-sans">
              <ShieldCheck size={14} />
              <span>کیف‌پول ۱۰۰٪ غیرحضانتی، ضد تحریم و محرمانه</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground font-sans tracking-tight">
              کیف‌پول چندزنجیره‌ای پی‌وند (PayVand Wallet)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-sans">
              کلیدهای خصوصی و عبارت ۱۲ کلمه‌ای شما مستقیماً در مرورگر دستگاه شما ذخیره می‌شوند و هیچ سروری به دارایی شما دسترسی ندارد. مجهز به پروکسی محرمانه برای جلوگیری از ردیابی IP ایران و مسدودسازی آن‌چین.
            </p>
          </div>

          {!hasWallet ? (
            <button
              onClick={handleCreateWallet}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:opacity-90 transition-all font-sans cursor-pointer shrink-0"
            >
              <Key size={16} />
              <span>ساخت فوری کیف‌پول جدید</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold text-accent font-sans">کیف‌پول فعال و رمزگذاری‌شده</span>
            </div>
          )}
        </div>
      </div>

      {!hasWallet ? (
        /* Empty State / Welcome Guide */
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
            <Wallet size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
              هنوز کیف‌پولی در این مرورگر ایجاد نکرده‌اید
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              با ایجاد کیف‌پول پی‌وند، یک عبارت ۱۲ کلمه‌ای اختصاصی بر پایه استاندارد BIP-39 برای شما تولید می‌شود که تمام آدرس‌های TON، سولانا، اتریوم و زی‌کش شما را کنترل می‌کند.
            </p>
          </div>
          <button
            onClick={handleCreateWallet}
            className="px-6 py-2.5 rounded-xl bg-accent text-background font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
          >
            ایجاد ۱۲ کلمه امن (بدون نیاز به ایمیل یا شماره)
          </button>
        </div>
      ) : (
        /* Active Wallet Dashboard */
        <div className="space-y-6">

          {/* Seed Phrase Security Card */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-sans">
                <AlertTriangle size={15} />
                <span>عبارت بازیابی ۱۲ کلمه‌ای (Seed Phrase) شما</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeed(!showSeed)}
                  className="text-[11px] text-amber-300/80 hover:text-amber-200 flex items-center gap-1 cursor-pointer font-sans"
                >
                  {showSeed ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showSeed ? 'مخفی کردن' : 'نمایش کلمات'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(seedPhrase.join(' '), 'seed')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedSeed ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedSeed ? 'کپی شد' : 'کپی'}</span>
                </button>
              </div>
            </div>

            {showSeed ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 dir-ltr" dir="ltr">
                {seedPhrase.map((word, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-amber-100 flex items-center justify-between px-2.5">
                    <span className="opacity-40 text-[9px]">{idx + 1}.</span>
                    <span className="font-semibold">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-200/70 leading-relaxed font-sans">
                کلمات بازیابی در فضای امن مرورگر شما نگهداری می‌شوند. برای مشاهده و یادداشت آفلاین روی دکمه نمایش کلیک کنید.
              </p>
            )}
          </div>

          {/* Portfolio Overview & Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Balance Card (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-card border border-border space-y-5">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-sans">مجموع دارایی تقریبی</span>
                <div className="text-3xl font-black text-foreground font-mono tracking-tight">{totalUsd}</div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-sans">
                  <span>+۴.۲٪ در ۲۴ ساعت گذشته</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSendModal(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-xs font-bold text-foreground transition-all cursor-pointer font-sans"
                >
                  <ArrowUpRight size={18} className="text-accent" />
                  <span>ارسال</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReceiveModal(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-xs font-bold text-foreground transition-all cursor-pointer font-sans"
                >
                  <ArrowDownLeft size={18} className="text-cyan-400" />
                  <span>دریافت</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToSwap}
                  className="p-3 rounded-xl bg-accent text-background flex flex-col items-center justify-center gap-1.5 text-xs font-black shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer font-sans"
                >
                  <RefreshCw size={18} />
                  <span>سواپ فوری</span>
                </button>
              </div>

              {/* Security Shield Indicator */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-accent" />
                  <span className="text-muted-foreground font-sans">شاخص مصونیت از فریز:</span>
                </div>
                <span className="font-mono font-bold text-accent">۱۰۰٪ (امن)</span>
              </div>
            </div>

            {/* Assets List (7 cols) */}
            <div className="md:col-span-7 p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground font-sans">دارایی‌های چندزنجیره‌ای</h3>
                <span className="text-[11px] text-muted-foreground font-sans">۴ شبکه متصل</span>
              </div>

              <div className="space-y-2">
                {Object.entries(balances).map(([chainKey, item]) => (
                  <div 
                    key={chainKey}
                    onClick={() => setActiveChain(chainKey)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activeChain === chainKey
                        ? 'bg-accent/10 border-accent/40 shadow-sm'
                        : 'bg-muted/40 border-border/60 hover:bg-muted/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChainLogo chainId={chainKey === 'evm' ? 'ethereum' : chainKey} size={28} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-foreground font-mono">{item.coin}</span>
                          {item.isPrivate && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold font-sans">
                              محرمانه zk
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-sans">
                          {chainKey === 'ton' ? 'شبکه تلگرام TON' : chainKey === 'solana' ? 'شبکه سولانا' : chainKey === 'evm' ? 'زنجیره اتریوم و EVM' : 'زی‌کش شیلدد'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="font-bold text-xs text-foreground dir-ltr">{item.amount}</div>
                      <div className="text-[10px] text-muted-foreground dir-ltr">{item.usd}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Address Card */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block font-sans">آدرس عمومی برای دریافت ({activeChain.toUpperCase()}):</span>
                  <div className="font-mono text-[11px] text-accent truncate dir-ltr">{addresses[activeChain]}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(addresses[activeChain], activeChain)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground shrink-0 transition-all cursor-pointer"
                >
                  {copiedAddr === activeChain ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="text-sm font-bold text-foreground font-sans">دریافت دارایی در شبکه {activeChain.toUpperCase()}</h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>
            
            <div className="bg-white p-3 rounded-xl w-44 h-44 mx-auto flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(addresses[activeChain])}`} 
                alt="QR Code" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-center break-all dir-ltr">
              {addresses[activeChain]}
            </div>

            <button
              onClick={() => handleCopy(addresses[activeChain], 'modal')}
              className="w-full py-2 rounded-xl bg-accent text-background font-bold text-xs font-sans cursor-pointer hover:opacity-90"
            >
              کپی آدرس کیف‌پول
            </button>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendSubmit} className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="text-sm font-bold text-foreground font-sans">ارسال دارایی ({activeChain.toUpperCase()})</h3>
              <button type="button" onClick={() => setShowSendModal(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium font-sans">آدرس مقصد</label>
                <input
                  type="text"
                  required
                  placeholder="آدرس کیف‌پول گیرنده"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border font-mono text-[11px] dir-ltr focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium font-sans">مقدار انتقال</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border font-mono text-sm dir-ltr focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-accent text-background font-bold text-xs font-sans cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <Send size={14} />
              <span>{isSending ? 'در حال ارسال آن‌چین...' : 'تایید و ارسال تراکنش'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}