import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Clock,
  TrendingUp,
  Cpu,
  ChevronDown,
  Building2,
  ShieldAlert,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  ArrowRightLeft,
  ExternalLink,
  Zap,
  Check
} from 'lucide-react';
import { 
  TonIcon, 
  SolanaIcon, 
  EthereumIcon, 
  TronIcon, 
  UsdtIcon, 
  StarsIcon,
  IranFlagIcon
} from '../Icons';
import { detectBankFromIBAN } from '../../utils/bankDetector';
import { formatToman } from '../../utils/format';
import { getTokenPrice, getIranTetherRate, getIranExchangesBreakdown } from '../../services/priceService';
import { getTreasuryWallet } from '../../config/treasury';

const IRAN_CASHOUT_ASSETS = [
  { id: 'usdt_trc20', name: 'تتر (TRC-20)', symbol: 'USDT', icon: <UsdtIcon size={20} />, min: 10 },
  { id: 'usdt_ton', name: 'تتر شبکه تون (TON)', symbol: 'USDT', icon: <UsdtIcon size={20} />, min: 5 },
  { id: 'ton', name: 'تون‌کوین (Toncoin)', symbol: 'TON', icon: <TonIcon size={20} />, min: 2 },
  { id: 'stars', name: 'استارز تلگرام (Stars)', symbol: 'Stars', icon: <StarsIcon size={20} />, min: 100 },
];

export default function IranToolkit({ initialSubTab = 'cashout' }) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [showExchangesList, setShowExchangesList] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [selectedAsset, setSelectedAsset] = useState(IRAN_CASHOUT_ASSETS[0]);
  const [assetAmount, setAssetAmount] = useState('100');
  const [shebaNumber, setShebaNumber] = useState('');
  const [accountOwner, setAccountOwner] = useState('');
  const [detectedBank, setDetectedBank] = useState(null);
  const [cashoutInvoice, setCashoutInvoice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  const tomanRate = getIranTetherRate() || 234000;
  const exchanges = getIranExchangesBreakdown();

  const [calcInput, setCalcInput] = useState('100');

  const getAssetPriceUSD = (assetId) => {
    if (assetId.startsWith('usdt')) return 1.0;
    if (assetId === 'ton') return getTokenPrice('TON') || 1.60;
    if (assetId === 'stars') return 0.014;
    return 1.0;
  };

  const assetUSDPrice = getAssetPriceUSD(selectedAsset.id);
  const totalUSDValue = (Number(assetAmount) || 0) * assetUSDPrice;
  const finalTomanPayout = Math.round(totalUSDValue * tomanRate * 0.992);

  const handleShebaChange = (val) => {
    let clean = val.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    if (!clean.startsWith('IR') && clean.length > 0) {
      clean = 'IR' + clean;
    }
    if (clean.length > 26) clean = clean.slice(0, 26);
    setShebaNumber(clean);

    const bank = detectBankFromIBAN(clean);
    setDetectedBank(bank);
  };

  const handleCreateCashout = (e) => {
    e.preventDefault();
    setFormError('');

    const num = Number(assetAmount);
    if (!num || num < selectedAsset.min) {
      setFormError(`حداقل مقدار: ${selectedAsset.min} ${selectedAsset.symbol}`);
      return;
    }

    if (shebaNumber.length < 26) {
      setFormError('شماره شبا باید کامل (۲۶ کاراکتر با IR) باشد');
      return;
    }

    if (!accountOwner.trim()) {
      setFormError('نام صاحب حساب الزامی است');
      return;
    }

    const orderId = 'IR-' + Math.floor(100000 + Math.random() * 900000);
    const treasury = getTreasuryWallet(selectedAsset.id);
    const depositAddress = treasury?.address || '0xdB25e672d7873d178f6465E242BAdF44e990A787';

    setCashoutInvoice({
      orderId,
      asset: selectedAsset,
      amount: num,
      usdValue: totalUSDValue.toFixed(2),
      tomanPayout: finalTomanPayout,
      shebaNumber,
      accountOwner: accountOwner.trim(),
      bankName: detectedBank?.name || 'شبکه شتاب',
      depositAddress,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      
      {/* Title & Badge with Lion & Sun Flag */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-xs flex items-center justify-center">
            <IranFlagIcon size={40} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-foreground font-sans">جعبه‌ابزار تخصصی کاربران ایران</h1>
            <p className="text-[11px] text-muted-foreground font-sans">تسویه آنی ریالی، نرخ ۵ صرافی برتر و سپر ضد فریز</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[10px] px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30 whitespace-nowrap shrink-0">
          فعال و تضمین‌شده
        </span>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center p-1 bg-muted/50 border border-border rounded-lg max-w-fit mx-auto">
        <button
          type="button"
          onClick={() => setSubTab('cashout')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            subTab === 'cashout'
              ? 'bg-card text-fg border border-border shadow-sm'
              : 'text-fgSubtle hover:text-fg hover:bg-card/50'
          }`}
        >
          <CreditCard size={13} />
          <span>نقد کردن به تومان</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('gas_tracker')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            subTab === 'gas_tracker'
              ? 'bg-card text-fg border border-border shadow-sm'
              : 'text-fgSubtle hover:text-fg hover:bg-card/50'
          }`}
        >
          <TrendingUp size={13} />
          <span>نرخ ۵ صرافی و کارمزد</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('anti_sanction')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            subTab === 'anti_sanction'
              ? 'bg-card text-emerald-400 border border-border shadow-sm'
              : 'text-fgSubtle hover:text-fg hover:bg-card/50'
          }`}
        >
          <ShieldAlert size={13} className="text-emerald-400" />
          <span>سپر ضد فریز و قطع منشأ</span>
        </button>
      </div>

      {/* Live Rate Banner */}
      <div className="card card-hover p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-fgMuted">
              نرخ تتر: <strong className="text-fg">میانگین ۵ صرافی برتر ایران</strong>
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setShowExchangesList(!showExchangesList)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-accent font-mono font-bold transition-all"
          >
            <span>{formatToman(tomanRate)}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showExchangesList ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showExchangesList && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5 animate-fade-in">
            <span className="text-xs text-fgSubtle block mb-1">استعلام زنده ۵ صرافی برتر (بر اساس حجم):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {exchanges.map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted border border-border/50">
                  <span className="text-xs text-fgMuted flex items-center gap-1.5">
                    <Building2 size={11} className="text-fgSubtle" />
                    {ex.name}
                  </span>
                  <span className="font-mono text-xs text-accent font-bold" dir="ltr">
                    {formatToman(ex.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SUBTAB 1: CASHOUT */}
      {subTab === 'cashout' && (
        <div className="card card-hover p-4 sm:p-5 space-y-4 animate-fade-in">
          
          <div className="pb-3 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">فروش رمزارز و استارز با واریز به حساب بانکی ایران</h2>
            <p className="text-xs text-fgMuted mt-0.5">تسویه مستقیم پایا و کارت به کارت به کلیه بانک‌های عضو شتاب</p>
          </div>

          {!cashoutInvoice ? (
            <form onSubmit={handleCreateCashout} className="space-y-3.5">
              
              {/* Asset Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fgMuted">ارزی که قصد فروش دارید:</label>
                <div className="grid grid-cols-2 gap-2">
                  {IRAN_CASHOUT_ASSETS.map((asset) => {
                    const isSelected = selectedAsset.id === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setSelectedAsset(asset)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-all ${
                          isSelected
                            ? 'bg-accentSoft border-accent/30 text-fg'
                            : 'bg-muted border-border text-fgSubtle hover:text-fg hover:bg-card'
                        }`}
                      >
                        <div className="shrink-0">{asset.icon}</div>
                        <div>
                          <strong className="text-xs block text-fg">{asset.symbol}</strong>
                          <span className="text-[10px] text-fgMuted">{asset.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1.5">
                <div className="flex justify-between items-center text-xs text-fgSubtle">
                  <span>مقدار برای فروش:</span>
                  <span className="text-[10px] text-fgMuted">حداقل: {selectedAsset.min} {selectedAsset.symbol}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={assetAmount}
                    onChange={(e) => setAssetAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full bg-transparent text-xl font-bold text-fg placeholder-fgSubtle focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-fgMuted px-2 py-1 bg-card rounded border border-border">
                    {selectedAsset.symbol}
                  </span>
                </div>

                <div className="text-xs text-fgSubtle">≈ ${totalUSDValue.toFixed(2)} دلار</div>
              </div>

              {/* Bank Info */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-fgMuted">حساب بانکی ایران جهت دریافت:</label>

                <input
                  type="text"
                  placeholder="شماره شبا (مثال: IR120120000000001234567890)"
                  value={shebaNumber}
                  onChange={(e) => handleShebaChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs text-fg placeholder-fgSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono"
                  dir="ltr"
                />

                {detectedBank && (
                  <div className="flex items-center gap-1.5 p-2 rounded-md bg-accentSoft border border-accent/20 text-xs text-accent">
                    <CheckCircle2 size={12} />
                    <span>بانک: <strong>{detectedBank.name}</strong></span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="نام صاحب حساب (مطابق کارت بانکی)"
                  value={accountOwner}
                  onChange={(e) => setAccountOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs text-fg placeholder-fgSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1 text-xs">
                <div className="flex justify-between items-center text-fgSubtle">
                  <span>نرخ مبنا (میانگین ۵ صرافی):</span>
                  <span className="font-mono text-fg">{formatToman(tomanRate)}</span>
                </div>
                <div className="flex justify-between items-center text-fgSubtle pt-1 border-t border-border/50">
                  <span className="font-semibold text-fg">مبلغ واریزی به حساب شما:</span>
                  <strong className="text-accent font-bold text-sm">{formatToman(finalTomanPayout)}</strong>
                </div>
              </div>

              {formError && (
                <div className="p-2 rounded-md bg-destructiveSoft border border-destructive/30 text-destructive text-xs flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-lg btn-primary text-xs"
              >
                ثبت پیش‌فاکتور فروش
              </button>

            </form>
          ) : (
            /* Invoice Card */
            <div className="space-y-3 animate-scale-in">
              <div className="p-3 rounded-lg bg-card border border-accent/30 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <span className="text-[10px] text-fgSubtle block">شناسه پیش‌فاکتور</span>
                    <strong className="text-xs text-accent font-mono">{cashoutInvoice.orderId}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Clock size={12} />
                    <span>مهلت ۱۵ دقیقه</span>
                  </div>
                </div>

                <div className="p-2.5 bg-muted rounded border border-border space-y-1.5">
                  <div className="flex justify-between text-fgSubtle">
                    <span>مبلغ واریزی:</span>
                    <strong className="text-accent font-bold">{formatToman(cashoutInvoice.tomanPayout)}</strong>
                  </div>
                  <div className="flex justify-between text-fgSubtle">
                    <span>بانک و صاحب:</span>
                    <span className="text-fg">{cashoutInvoice.bankName} • {cashoutInvoice.accountOwner}</span>
                  </div>
                  <div className="flex justify-between text-fgSubtle font-mono text-xs" dir="ltr">
                    <span>{cashoutInvoice.shebaNumber}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-fgMuted block">
                    آدرس کیف‌پول جهت انتقال {cashoutInvoice.amount} {cashoutInvoice.asset.symbol}:
                  </span>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <span className="font-mono text-xs text-fg truncate flex-1" dir="ltr">
                      {cashoutInvoice.depositAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cashoutInvoice.depositAddress)}
                      className="p-1 rounded bg-muted text-fgSubtle hover:text-fg"
                      title="کپی"
                    >
                      {copied ? <CheckCircle2 size={12} className="text-accent" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-fgSubtle leading-relaxed">
                  پس از تایید تراکنش در بلاکچین، مبلغ ریالی به صورت آنی به شبای شما واریز می‌شود.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCashoutInvoice(null)}
                className="w-full py-2.5 rounded-lg bg-muted border border-border text-xs font-semibold text-fgSubtle hover:text-fg hover:bg-border transition-colors"
              >
                معامله جدید
              </button>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: GAS TRACKER */}
      {subTab === 'gas_tracker' && (
        <div className="card card-hover p-4 sm:p-5 space-y-4 animate-fade-in">
          <div>
            <h2 className="text-sm font-semibold text-fg">ماشین‌حساب تتر و مقایسه کارمزد شبکه‌ها</h2>
            <p className="text-xs text-fgMuted mt-0.5">بر اساس نرخ میانگین ۵ صرافی ({formatToman(tomanRate)})</p>
          </div>

          <div className="p-3 rounded-lg bg-muted border border-border space-y-2">
            <span className="text-xs font-semibold text-fgMuted block">ماشین‌حساب تتر ➔ تومان:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              <div>
                <label className="text-[10px] text-fgSubtle block mb-0.5">مقدار تتر (USDT):</label>
                <input
                  type="text"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full px-3 py-1.5 rounded-md bg-card border border-border text-xs text-fg font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-[10px] text-fgSubtle block mb-0.5">معادل تومان:</label>
                <div className="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-accent font-bold font-mono">
                  {formatToman(Math.round((Number(calcInput) || 0) * tomanRate))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-fgMuted block">مقایسه کارمزد ریالی انتقال:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-muted border border-border space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TonIcon size={14} />
                    <span className="text-xs font-semibold text-fg">تون (TON)</span>
                  </div>
                  <span className="badge badge-accent text-[9px]">بسیار کم</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-fgSubtle">کارمزد:</span>
                  <div className="text-left font-mono">
                    <strong className="text-xs text-fg block">~0.005 TON</strong>
                    <span className="text-[10px] text-accent block">≈ {formatToman(Math.round(0.005 * (getTokenPrice('TON') || 1.6) * tomanRate))}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted border border-border space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SolanaIcon size={14} />
                    <span className="text-xs font-semibold text-fg">سولانا (Solana)</span>
                  </div>
                  <span className="badge badge-accent text-[9px]">سریع</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-fgSubtle">کارمزد:</span>
                  <div className="text-left font-mono">
                    <strong className="text-xs text-fg block">~0.00005 SOL</strong>
                    <span className="text-[10px] text-accent block">≈ {formatToman(Math.round(0.00005 * (getTokenPrice('SOL') || 117) * tomanRate))}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted border border-border space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TronIcon size={14} />
                    <span className="text-xs font-semibold text-fg">ترون (TRC-20)</span>
                  </div>
                  <span className="badge text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">متداول</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-fgSubtle">کارمزد:</span>
                  <div className="text-left font-mono">
                    <strong className="text-xs text-fg block">~13.5 TRX</strong>
                    <span className="text-[10px] text-amber-400 block">≈ {formatToman(Math.round(13.5 * (getTokenPrice('TRX') || 0.34) * tomanRate))}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted border border-border space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <EthereumIcon size={14} />
                    <span className="text-xs font-semibold text-fg">اتریوم (EVM)</span>
                  </div>
                  <span className="badge text-[9px] bg-muted text-fgSubtle border border-border">گران</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-fgSubtle">کارمزد:</span>
                  <div className="text-left font-mono">
                    <strong className="text-xs text-fg block">~0.0008 ETH</strong>
                    <span className="text-[10px] text-rose-400 block">≈ {formatToman(Math.round(0.0008 * (getTokenPrice('ETH') || 2690) * tomanRate))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ANTI-SANCTION & SHIELD PROTOCOL */}
      {subTab === 'anti_sanction' && (
        <div className="card card-hover p-4 sm:p-6 space-y-5 animate-fade-in text-start">
          
          {/* Header */}
          <div className="border-b border-border/40 pb-3.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldAlert size={18} />
              </span>
              <h2 className="text-base font-bold text-foreground">
                سپر ضد فریز و قطع ردپای آن‌چین (Anti-Freeze Shield)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              راهنمای ساده و گام‌به‌گام برای جلوگیری از مسدود شدن تتر و حفظ ۱۰۰٪ حریم خصوصی در کیف‌پول‌های شخصی.
            </p>
          </div>

          {/* Quick TL;DR Note Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <AlertTriangle size={14} />
              <span>ریشه خطر: چرا تتر (USDT) فریز می‌شود؟</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-normal">
              شرکت صادرکنندهٔ تتر به دستور نهادهای نظارتی می‌تواند هر آدرسی را در چند ثانیه مسدود (Freeze) کند. در صورت ارسال مستقیم از صرافی ایرانی به کیف‌پول‌های بین‌المللی، آدرس شما شناسایی و ریسک مسدودسازی دارایی به شدت بالا می‌رود.
            </p>
          </div>

          {/* 3-Step Simple Roadmap */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <Zap size={14} className="text-accent" />
                <span>فرمول ۳ مرحله‌ای خروج امن و تمیز از صرافی</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                مسیر پیشنهادی
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-accent text-background font-mono text-[11px] font-black flex items-center justify-center shrink-0">۱</span>
                    <span>خرید رمزارز واسط</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">گام اول</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  در صرافی ایرانی به جای تتر مستقیم، <strong className="text-foreground">زی‌کش (ZEC)</strong>، <strong className="text-foreground">تون (TON)</strong> یا لایت‌کوین بخرید.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-400 text-background font-mono text-[11px] font-black flex items-center justify-center shrink-0">۲</span>
                    <span>انتقال به ولت شخصی</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">قطع ردپا</span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed font-normal">
                  دارایی را به کیف‌پول شخصی (نه صرافی خارجی) و به یک آدرس امن یا محرمانه منتقل کنید تا پیوند صرافی قطع شود.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-sans">
                    <span className="w-5 h-5 rounded-full bg-accent text-background font-mono text-[11px] font-black flex items-center justify-center shrink-0">۳</span>
                    <span>سواپ تمیز در پروتکل پی‌وند</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">مقصد نهایی</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  در پی‌وند (PayVand) ارز خود را به <strong className="text-foreground">ETH</strong>، <strong className="text-foreground">DAI</strong> یا دلار دلخواه تبدیل کنید؛ دارایی شما کاملاً پاک و با ریسک صفر است.
                </p>
              </div>
            </div>
          </div>

          {/* Asset Risk Comparison (Compact & Responsive - No 2-line wraps) */}
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <Layers size={14} className="text-accent" />
              <span>کدام ارزها ضد فریز هستند؟ (مقایسه سریع ریسک)</span>
            </h3>

            <div className="space-y-2">
              {/* LUSD */}
              <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#2E3A59] flex items-center justify-center text-xs font-bold text-[#7E92B6] shrink-0 border border-white/10">
                    LUSD
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">Liquity (LUSD)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25 whitespace-nowrap">
                        مصونیت ۱۰۰٪
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      قرارداد تغییرناپذیر، بدون کلید ادمین، فاقد هرگونه تابع فریز
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
                  بهترین برای دلار
                </span>
              </div>

              {/* DAI */}
              <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#F4B731] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    DAI
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">Dai Stablecoin</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25 whitespace-nowrap">
                        غیرمتمرکز
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      استیبل‌کوین وثیقه‌ای غیرمتمرکز؛ بدون لیست سیاه دلخواه
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
                  نقدینگی بالا
                </span>
              </div>

              {/* Native Coins */}
              <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0 border border-accent/30">
                    L1
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">کوین‌های بومی (TON / SOL / ETH)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25 whitespace-nowrap">
                        غیرقابل فریز
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      ارزهای اصلی شبکه؛ از نظر فنی مسدودسازی آن ناممکن است
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
                  امنیت کامل
                </span>
              </div>

              {/* USDT - FIXED 1-LINE WRAP */}
              <div className="p-3 rounded-xl bg-card border border-rose-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#26A17B] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    USDT
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">تتر (USDT)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-400 font-bold border border-rose-500/25 whitespace-nowrap">
                        ریسک بالای فریز
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      دارای تابع مسدودسازی؛ رصد دائمی توسط شرکت‌های نظارتی
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-400 shrink-0 whitespace-nowrap">
                  پرهیز از نگهداری
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Network Tools & Anti-Sanction DNS */}
          <div className="space-y-2.5 pt-3 border-t border-border/40">
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <Cpu size={14} className="text-accent" />
              <span>اتصال مستقیم نودها و DNSهای ضدتحریم (بدون وی‌پی‌ان)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs">شکن (Shecan)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('178.22.122.100, 185.51.200.2')}
                    className="text-[10px] text-accent hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy size={11} />
                    <span>کپی DNS</span>
                  </button>
                </div>
                <p className="font-mono text-muted-foreground text-[11px]" dir="ltr">
                  178.22.122.100 • 185.51.200.2
                </p>
                <p className="text-[10px] text-muted-foreground">
                  دورزدن تحریم‌های وب۳ و خطای ۴۰۳ صرافی‌ها بدون افت پینگ.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs">نودهای لبه کلودفلر</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/15 text-accent font-semibold">فعال</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                  ترافیک سواپ مستقیماً از طریق شبکه لبه کلودفلر پی‌وند بدون نیاز به فیلترشکن عبور می‌کند.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}