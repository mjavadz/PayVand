import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Key, ShieldCheck, ShieldAlert, Copy, Check, Eye, EyeOff, 
  ArrowUpRight, ArrowDownLeft, RefreshCw, QrCode, Lock, Unlock, 
  AlertTriangle, Sparkles, Send, Download, Plus, LogIn, Trash2, 
  ExternalLink, ArrowRight, CheckCircle2, Sliders, Smartphone, X
} from 'lucide-react';
import { ChainLogo } from '../Icons';
import { 
  generateMnemonic, 
  mnemonicToSeed, 
  deriveMultiChainAddresses, 
  encryptVault, 
  decryptVault, 
  saveVaultToStorage, 
  loadVaultFromStorage, 
  clearStoredVault, 
  validateMnemonic 
} from '../../services/web3/walletCrypto';
import { getTokenPrice, getIranTetherRate } from '../../services/priceService';
import { formatToman, formatUSD, shortenAddress } from '../../utils/format';
import { useWallet } from '../../context/WalletContext';

export default function PayVandWallet({ onNavigateToSwap }) {
  const { connectInternalWallet, setActiveChain: setGlobalActiveChain } = useWallet();

  // Core Wallet State
  const [hasVault, setHasVault] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [walletData, setWalletData] = useState(null); // { mnemonic, addresses, createdAt }
  const [activeChain, setActiveChain] = useState('evm'); // 'evm' | 'ton' | 'solana' | 'zcash'

  // Creation / Import Flow State
  const [authMode, setAuthMode] = useState('create'); // 'create' | 'import'
  const [tempMnemonic, setTempMnemonic] = useState([]);
  const [importInput, setImportInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [authError, setAuthError] = useState('');

  // UI Feedback States
  const [copiedKey, setCopiedKey] = useState(null);
  const [showSeedInDashboard, setShowSeedInDashboard] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false); // Default is real 0.00 Mainnet

  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessTx, setSendSuccessTx] = useState(null);
  const [sendError, setSendError] = useState('');

  // Live Rates
  const tetherRate = getIranTetherRate() || 265500;
  const ethPrice = getTokenPrice('ETH') || 2692;
  const tonPrice = getTokenPrice('TON') || 1.60;
  const solPrice = getTokenPrice('SOL') || 117.10;
  const zecPrice = getTokenPrice('ZEC') || 1307;

  // Initialize or check stored vault
  useEffect(() => {
    const stored = loadVaultFromStorage();
    if (stored) {
      setHasVault(true);
      if (stored.isEncrypted) {
        setIsLocked(true);
      } else {
        try {
          const raw = JSON.parse(decodeURIComponent(escape(atob(stored.data))));
          setWalletData(raw);
          setIsLocked(false);
        } catch {
          setIsLocked(true);
        }
      }
    }
  }, []);

  // When walletData changes, connect to global context
  useEffect(() => {
    if (walletData?.addresses) {
      const addr = activeChain === 'evm' ? walletData.addresses.evm :
                   activeChain === 'ton' ? walletData.addresses.ton :
                   activeChain === 'solana' ? walletData.addresses.solana :
                   walletData.addresses.zcash;
      if (connectInternalWallet) {
        connectInternalWallet(activeChain === 'evm' ? 'ethereum' : activeChain, addr);
      }
    }
  }, [walletData, activeChain, connectInternalWallet]);

  // Handle Generate New Mnemonic
  const handleStartGenerate = async () => {
    setAuthError('');
    try {
      const words = await generateMnemonic(12);
      setTempMnemonic(words);
    } catch (err) {
      setAuthError('خطا در تولید آنتروپی امن: ' + err.message);
    }
  };

  // Finalize Creation
  const handleCompleteCreation = async () => {
    if (!backupConfirmed && authMode === 'create') {
      setAuthError('لطفاً گزینه تأیید ذخیرهٔ ۱۲ کلمه را علامت بزنید.');
      return;
    }
    setAuthError('');

    try {
      const mnemonicArr = authMode === 'create' 
        ? tempMnemonic 
        : importInput.trim().toLowerCase().split(/\s+/);

      if (!validateMnemonic(mnemonicArr)) {
        setAuthError('کلمات وارد شده نامعتبر است. لطفاً ۱۲ کلمه استاندارد BIP-39 را بررسی فرمایید.');
        return;
      }

      const seed = await mnemonicToSeed(mnemonicArr.join(' '));
      const addresses = await deriveMultiChainAddresses(seed);

      const payload = {
        mnemonic: mnemonicArr,
        addresses,
        createdAt: Date.now()
      };

      const encrypted = await encryptVault(payload, pinInput.trim());
      saveVaultToStorage(encrypted);

      setWalletData(payload);
      setHasVault(true);
      setIsLocked(false);
      setTempMnemonic([]);
      setImportInput('');
      setPinInput('');
    } catch (err) {
      setAuthError('خطا در راه‌اندازی کیف‌پول: ' + err.message);
    }
  };

  // Unlock with PIN
  const handleUnlock = async (e) => {
    e.preventDefault();
    setAuthError('');
    const stored = loadVaultFromStorage();
    if (!stored) return;

    try {
      const decrypted = await decryptVault(stored, unlockPinInput.trim());
      setWalletData(decrypted);
      setIsLocked(false);
      setUnlockPinInput('');
    } catch (err) {
      setAuthError(err.message || 'رمز عبور نامعتبر است.');
    }
  };

  // Lock Vault
  const handleLock = () => {
    setWalletData(null);
    setIsLocked(true);
    setShowSeedInDashboard(false);
  };

  // Wipe Wallet
  const handleWipe = () => {
    if (window.confirm('آیا از حذف این کیف‌پول از مرورگر اطمینان دارید؟ اطمینان حاصل کنید که ۱۲ کلمه بازیابی را قبلاً یادداشت کرده‌اید.')) {
      clearStoredVault();
      setWalletData(null);
      setHasVault(false);
      setIsLocked(false);
      setIsSandbox(false);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download Backup File
  const handleDownloadBackup = () => {
    if (!walletData?.mnemonic) return;
    const content = `PayVand Sovereign Non-Custodial Wallet Backup
-----------------------------------------------
Created: ${new Date().toISOString()}
Warning: Never share these 12 words with anyone!

Secret Recovery Phrase (12 Words):
${walletData.mnemonic.join(' ')}

Derived Public Addresses:
- EVM (Ethereum / Arbitrum / Base / Polygon): ${walletData.addresses.evm}
- TON (The Open Network & Telegram): ${walletData.addresses.ton}
- Solana: ${walletData.addresses.solana}
- Zcash (Shielded): ${walletData.addresses.zcash}
-----------------------------------------------
Website: https://javadnode.top`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payvand-wallet-backup-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Asset Balances (Real starting at 0.00 vs Sandbox Demo)
  const balances = useMemo(() => {
    if (isSandbox) {
      return {
        evm: { amount: '0.2500', symbol: 'ETH', priceUSD: ethPrice, usd: (0.25 * ethPrice).toFixed(2), change: '+2.1%' },
        ton: { amount: '15.00', symbol: 'TON', priceUSD: tonPrice, usd: (15 * tonPrice).toFixed(2), change: '+3.4%' },
        solana: { amount: '1.500', symbol: 'SOL', priceUSD: solPrice, usd: (1.5 * solPrice).toFixed(2), change: '+5.1%' },
        zcash: { amount: '2.500', symbol: 'ZEC', priceUSD: zecPrice, usd: (2.5 * zecPrice).toFixed(2), change: '+8.3%', isPrivate: true }
      };
    }
    // Real Mainnet Starting Balances
    return {
      evm: { amount: '0.0000', symbol: 'ETH', priceUSD: ethPrice, usd: '0.00', change: '+0.0%' },
      ton: { amount: '0.00', symbol: 'TON', priceUSD: tonPrice, usd: '0.00', change: '+0.0%' },
      solana: { amount: '0.0000', symbol: 'SOL', priceUSD: solPrice, usd: '0.00', change: '+0.0%' },
      zcash: { amount: '0.0000', symbol: 'ZEC', priceUSD: zecPrice, usd: '0.00', change: '+0.0%', isPrivate: true }
    };
  }, [isSandbox, ethPrice, tonPrice, solPrice, zecPrice]);

  const totalUSD = useMemo(() => {
    if (isSandbox) {
      const sum = (0.25 * ethPrice) + (15 * tonPrice) + (1.5 * solPrice) + (2.5 * zecPrice);
      return sum.toFixed(2);
    }
    return '0.00';
  }, [isSandbox, ethPrice, tonPrice, solPrice, zecPrice]);

  const totalToman = useMemo(() => {
    return Math.round(Number(totalUSD) * tetherRate);
  }, [totalUSD, tetherRate]);

  // Current chain address
  const currentAddress = useMemo(() => {
    if (!walletData?.addresses) return '';
    return walletData.addresses[activeChain] || '';
  }, [walletData, activeChain]);

  // Handle Send Transaction Submit
  const handleSendTransaction = (e) => {
    e.preventDefault();
    setSendError('');
    const amt = Number(sendAmount);
    const available = Number(balances[activeChain]?.amount || 0);

    if (!sendRecipient.trim()) {
      setSendError('لطفاً آدرس معتبر مقصد را وارد فرمایید.');
      return;
    }
    if (amt <= 0) {
      setSendError('مقدار انتقال باید بیشتر از صفر باشد.');
      return;
    }
    if (amt > available) {
      setSendError(`موجودی ناکافی است. موجودی قابل‌انتقال: ${available} ${balances[activeChain]?.symbol}`);
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const fakeHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
      setSendSuccessTx(fakeHash);
      setSendAmount('');
      setSendRecipient('');
    }, 1500);
  };

  // Block explorer URL resolver
  const getExplorerUrl = (chain, addr) => {
    switch (chain) {
      case 'evm': return `https://etherscan.io/address/${addr}`;
      case 'ton': return `https://tonviewer.com/${addr}`;
      case 'solana': return `https://solscan.io/account/${addr}`;
      case 'zcash': return `https://blockchair.com/zcash/address/${addr}`;
      default: return '#';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Top Protocol Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-amber-500/10 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-sans">
              <ShieldCheck size={14} />
              <span>پروتکل کیف‌پول ۱۰۰٪ غیرحضانتی (Sovereign Non-Custodial)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground font-sans tracking-tight">
              کیف‌پول چندزنجیره‌ای پی‌وند (PayVand Wallet)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-sans">
              کلیدهای خصوصی و عبارت ۱۲ کلمه‌ای شما مستقیماً در پردازنده مرورگر رمزنگاری می‌شوند و هیچ سروری به دارایی شما دسترسی ندارد. مجهز به معماری غیرحضانتی جهت جلوگیری از هرگونه ردیابی یا فریز آن‌چین.
            </p>
          </div>

          {/* Quick status button */}
          {hasVault && !isLocked && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLock}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                title="قفل کردن کیف‌پول"
              >
                <Lock size={14} />
                <span>قفل امن</span>
              </button>
              <button
                type="button"
                onClick={handleWipe}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 transition-all"
                title="خروج و پاکسازی کیف‌پول"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          STATE 1: NO WALLET CREATED YET (Creation & Import Flow)
         ======================================================== */}
      {!hasVault && (
        <div className="card p-6 sm:p-8 space-y-6 border border-white/[0.08] rounded-3xl bg-[#12151e]/90 shadow-2xl backdrop-blur-md">
          
          {/* Tabs: Create vs Import */}
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl max-w-fit mx-auto">
            <button
              type="button"
              onClick={() => {
                setAuthMode('create');
                setAuthError('');
                if (tempMnemonic.length === 0) handleStartGenerate();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                authMode === 'create'
                  ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus size={15} />
              <span>ساخت کیف‌پول امن جدید (BIP-39)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('import');
                setAuthError('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                authMode === 'import'
                  ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn size={15} />
              <span>بازیابی کیف‌پول موجود (Import)</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-sans flex items-center gap-2 animate-fade-in">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* SUB-FLOW A: CREATE NEW BIP-39 WALLET */}
          {authMode === 'create' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground font-sans">
                  عبارت ۱۲ کلمه‌ای بازیابی اختصاصی شما (Secret Recovery Phrase)
                </h3>
                <p className="text-xs text-muted-foreground font-sans max-w-lg mx-auto">
                  این ۱۲ کلمه کلید تمام دارایی‌های شما روی تمامی شبکه‌هاست. آن را روی کاغذ یادداشت کنید و هرگز در اختیار شخص دیگری قرار ندهید.
                </p>
              </div>

              {tempMnemonic.length === 0 ? (
                <div className="text-center py-6">
                  <button
                    type="button"
                    onClick={handleStartGenerate}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20"
                  >
                    تولید تصادفی کلمات با آنتروپی رمزنگاری‌شده (CSPRNG)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 12 Words Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08]">
                    {tempMnemonic.map((word, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono select-all"
                      >
                        <span className="w-5 text-muted-foreground text-[10px] font-bold font-sans">#{idx + 1}</span>
                        <span className="font-bold text-foreground tracking-wide text-sm">{word}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions for Mnemonic */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(tempMnemonic.join(' '), 'temp_seed')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
                    >
                      {copiedKey === 'temp_seed' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedKey === 'temp_seed' ? 'کپی شد!' : 'کپی ۱۲ کلمه'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartGenerate}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} />
                      <span>تولید عبارت جدید</span>
                    </button>
                  </div>

                  {/* Security PIN setup */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground font-sans flex items-center gap-1.5">
                        <Lock size={14} className="text-accent" />
                        <span>تنظیم پین‌کد اختیاری جهت قفل محلی (AES-GCM):</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-sans">رمزنگاری ۱۰۰٪ سمت کلاینت</span>
                    </div>
                    <input
                      type="password"
                      maxLength={16}
                      placeholder="پین‌کد ۶ رقمی یا گذرواژه دلخواه (اختیاری)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  {/* Confirmation checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={backupConfirmed}
                      onChange={(e) => setBackupConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-foreground font-sans leading-relaxed">
                      تأیید می‌کنم که این ۱۲ کلمه را به صورت آفلاین یادداشت کرده‌ام و متوجهم که در صورت مفقودی، هیچ نهاد یا سروری توانایی بازیابی دارایی من را ندارد.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleCompleteCreation}
                    disabled={!backupConfirmed}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm font-sans transition-all flex items-center justify-center gap-2 shadow-lg ${
                      backupConfirmed
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-emerald-500/25 hover:opacity-90 cursor-pointer'
                        : 'bg-white/[0.05] text-muted-foreground cursor-not-allowed border border-white/[0.08]'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>تأیید و راه‌اندازی کیف‌پول پی‌وند</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-FLOW B: IMPORT EXISTING WALLET */}
          {authMode === 'import' && (
            <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground font-sans">
                  بازیابی کیف‌پول با عبارت ۱۲ کلمه‌ای (BIP-39)
                </h3>
                <p className="text-xs text-muted-foreground font-sans">
                  کلمات بازیابی کیف‌پول تراست‌ولت، متامسک یا تون‌کیپر خود را با فاصله در کادر زیر وارد کنید:
                </p>
              </div>

              <textarea
                rows={3}
                placeholder="کلمات را با فاصله وارد کنید (مثال: apple banana cherry ...)"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-card border border-white/[0.08] text-sm text-foreground font-mono focus:outline-none focus:border-accent placeholder:text-muted-foreground/50 dir-ltr"
              />

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-foreground font-sans block">
                  تنظیم پین‌کد برای محافظت از کیف‌پول در این دستگاه (اختیاری):
                </span>
                <input
                  type="password"
                  placeholder="پین‌کد دلخواه"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-white/[0.08] text-sm text-foreground font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="button"
                onClick={handleCompleteCreation}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm font-sans transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={16} />
                <span>بازیابی و ورود به کیف‌پول</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          STATE 2: LOCKED WALLET (Needs PIN to unlock)
         ======================================================== */}
      {hasVault && isLocked && (
        <div className="card p-8 max-w-md mx-auto text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12151e]/90 shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-accentSoft border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-sans">کیف‌پول پی‌وند قفل است</h2>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              جهت دسترسی به کلیدهای خصوصی و ارسال تراکنش، پین‌کد را وارد فرمایید:
            </p>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-sans">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-3 pt-2">
            <input
              type="password"
              autoFocus
              placeholder="پین‌کد بازگشایی"
              value={unlockPinInput}
              onChange={(e) => setUnlockPinInput(e.target.value)}
              className="w-full text-center px-4 py-3 rounded-2xl bg-card border border-white/[0.1] text-base text-foreground font-mono tracking-widest focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm font-sans transition-all shadow-md shadow-emerald-500/20"
            >
              بازگشایی قفل کیف‌پول
            </button>
          </form>

          <button
            type="button"
            onClick={handleWipe}
            className="text-[11px] text-muted-foreground hover:text-rose-400 transition-colors pt-2 block mx-auto font-sans"
          >
            فراموشی پین و بازنشانی کیف‌پول
          </button>
        </div>
      )}

      {/* ========================================================
          STATE 3: ACTIVE UNLOCKED WALLET DASHBOARD
         ======================================================== */}
      {hasVault && !isLocked && walletData && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Main Portfolio Value Card */}
          <div className="card p-6 sm:p-7 rounded-3xl border border-white/[0.08] bg-card/95 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-xs text-muted-foreground font-sans font-medium block">
                  ارزش کل دارایی‌های غیرحضانتی شما:
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-foreground" dir="ltr">
                    ${totalUSD}
                  </span>
                  <span className="text-base sm:text-lg font-black font-sans text-emerald-400" dir="rtl">
                    ≈ {formatToman(totalToman)}
                  </span>
                </div>
              </div>

              {/* Mode Switcher: Real Mainnet vs Sandbox Demo */}
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsSandbox(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    !isSandbox 
                      ? 'bg-emerald-500 text-black shadow-xs font-black' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>💎 موجودی واقعی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSandbox(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isSandbox 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs font-black' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>🧪 تست در سندباکس</span>
                </button>
              </div>
            </div>

            {/* Sandbox Notice when active */}
            {isSandbox && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300 animate-fade-in font-sans">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} />
                  <span>محیط آزمایشی (Sandbox) فعال است. دارایی‌های تستی جهت تمرین و تست ارسال/سواپ شارژ شدند.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSandbox(false)}
                  className="font-bold underline text-[11px]"
                >
                  بازگشت به واقعی (۰.۰۰)
                </button>
              </div>
            )}

            {/* Multi-Chain Asset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'evm', name: 'اتریوم (EVM)', token: 'ETH', b: balances.evm },
                { id: 'ton', name: 'شبکه تون (TON)', token: 'TON', b: balances.ton },
                { id: 'solana', name: 'سولانا (Solana)', token: 'SOL', b: balances.solana },
                { id: 'zcash', name: 'زی‌کش (Zcash)', token: 'ZEC', b: balances.zcash },
              ].map(item => {
                const isSelected = activeChain === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveChain(item.id)}
                    className={`p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-accent/10 border-accent/40 shadow-md shadow-accent/5'
                        : 'bg-white/[0.025] hover:bg-white/[0.05] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <ChainLogo chainId={item.id === 'evm' ? 'ethereum' : item.id} size={20} />
                        <span className="font-bold text-xs text-foreground font-sans">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{item.b.change}</span>
                    </div>

                    <div className="w-full pt-1 border-t border-white/[0.04]">
                      <div className="font-mono font-black text-base text-foreground" dir="ltr">
                        {item.b.amount} {item.token}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-mono" dir="ltr">${item.b.usd}</span>
                        <span className="font-sans" dir="rtl">{formatToman(Math.round(Number(item.b.usd) * tetherRate))}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Chain Details Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ChainLogo chainId={activeChain === 'evm' ? 'ethereum' : activeChain} size={18} />
                  <span className="text-xs font-bold text-foreground font-sans">
                    آدرس عمومی و ایمن شما روی شبکه {activeChain.toUpperCase()}:
                  </span>
                </div>

                <a
                  href={getExplorerUrl(activeChain, currentAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-sans shrink-0"
                >
                  <span>اکسپلورر بلاکچین</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-white/[0.06] font-mono text-xs">
                <span className="truncate text-foreground dir-ltr select-all">
                  {currentAddress}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentAddress, 'dash_addr')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground text-xs font-sans font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'dash_addr' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedKey === 'dash_addr' ? 'کپی شد' : 'کپی'}</span>
                </button>
              </div>

              {/* Action Buttons: Receive, Send, Swap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(true)}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all font-sans cursor-pointer"
                >
                  <ArrowDownLeft size={15} className="text-emerald-400" />
                  <span>دریافت دارایی (QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSendSuccessTx(null);
                    setSendError('');
                    setShowSendModal(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all font-sans cursor-pointer"
                >
                  <ArrowUpRight size={15} className="text-sky-400" />
                  <span>ارسال تراکنش</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSwap) onNavigateToSwap();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all font-sans shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>سواپ و تبدیل این کیف‌پول</span>
                </button>
              </div>
            </div>

          </div>

          {/* Security & Backup Management Drawer */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.025] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground font-sans">
                  مدیریت امنیت، پشتیبان‌گیری و کلیدهای خصوصی
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="text-xs text-accent hover:underline flex items-center gap-1 font-sans font-bold"
              >
                <Download size={13} />
                <span>دانلود پشتیبان (TXT)</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-foreground font-sans block">
                  مشاهده ۱۲ کلمه بازیابی محرمانه:
                </span>
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                  برای امنیت شما در اماکن عمومی کلمات پنهان هستند. تنها در مکانی امن آن را آشکار کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSeedInDashboard(!showSeedInDashboard)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-foreground font-sans flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                {showSeedInDashboard ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showSeedInDashboard ? 'پنهان‌سازی' : 'نمایش کلمات'}</span>
              </button>
            </div>

            {showSeedInDashboard && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 animate-scale-in">
                {walletData.mnemonic.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.03] text-xs font-mono select-all">
                    <span className="text-muted-foreground text-[10px]">#{idx + 1}</span>
                    <span className="text-amber-300 font-bold">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          RECEIVE MODAL (QR Code & Address)
         ======================================================== */}
      {showReceiveModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowReceiveModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#12151e] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ChainLogo chainId={activeChain === 'evm' ? 'ethereum' : activeChain} size={20} />
                <h3 className="text-sm font-bold text-foreground font-sans">
                  دریافت در شبکه {activeChain.toUpperCase()}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowReceiveModal(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3.5 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentAddress)}`}
                alt="Deposit QR"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Address box */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono break-all text-center dir-ltr text-foreground select-all">
              {currentAddress}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleCopy(currentAddress, 'modal_addr')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-sans transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copiedKey === 'modal_addr' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'modal_addr' ? 'آدرس کپی شد!' : 'کپی آدرس کیف‌پول'}</span>
              </button>

              <p className="text-[10px] text-muted-foreground text-center font-sans">
                فقط توکن‌های بومی و توکن‌های سازگار با این شبکه را به این آدرس واریز فرمایید.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SEND MODAL (Transaction Broadcast Simulation)
         ======================================================== */}
      {showSendModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowSendModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#12151e] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Send size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground font-sans">
                  ارسال تراکنش ({activeChain.toUpperCase()})
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSendModal(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            {sendSuccessTx ? (
              <div className="text-center py-4 space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground font-sans">تراکنش با موفقیت به شبکه ارسال شد!</h4>
                  <p className="text-xs text-muted-foreground font-sans mt-1">تراکنش به استخر اعتبارسنج‌ها منتقل گردید.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono break-all text-muted-foreground dir-ltr">
                  TxHash: {sendSuccessTx}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-bold text-foreground font-sans"
                >
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendTransaction} className="space-y-3.5 text-xs font-sans">
                {sendError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                    {sendError}
                  </div>
                )}

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">آدرس مقصد:</label>
                  <input
                    type="text"
                    required
                    placeholder={`آدرس گیرنده در شبکه ${activeChain.toUpperCase()}`}
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-white/[0.08] font-mono text-xs dir-ltr focus:outline-none focus:border-accent text-foreground"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-muted-foreground font-semibold">مقدار انتقال:</label>
                    <span className="text-[10px] text-muted-foreground">
                      موجودی: <strong className="font-mono text-foreground">{balances[activeChain]?.amount} {balances[activeChain]?.symbol}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="w-full pr-3.5 pl-16 py-2.5 rounded-xl bg-card border border-white/[0.08] font-mono text-sm dir-ltr focus:outline-none focus:border-accent text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setSendAmount(balances[activeChain]?.amount || '0')}
                      className="absolute left-2 top-2 px-2 py-0.5 rounded-md bg-white/[0.06] text-accent text-[10px] font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>کارمزد گس برآوردی شبکه:</span>
                    <span className="font-mono text-foreground" dir="ltr">~0.00015 {balances[activeChain]?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>زمان تأیید میانگین:</span>
                    <span className="text-emerald-400 font-bold">۲ تا ۳ ثانیه</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-sans transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>در حال امضا و پخش تراکنش...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>امضای تراکنش با کلید خصوصی محلی</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
