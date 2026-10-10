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
  Check,
  Calendar as CalendarLucide,
  CalendarDays,
  CalendarCheck2,
  ArrowLeftRight,
  Info
} from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { DatePicker } from '../ui/date-picker';
import { 
  formatJalali, 
  formatJalaliNumeric, 
  toJalali, 
  toGregorian, 
  JALALI_MONTHS, 
  JALALI_WEEKDAYS, 
  jalaliWeekday 
} from '../../lib/jalali';
import { toPersianDigits } from '../../utils/format';
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

  // Jalali Calendar & Converter States
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());
  const [convDirection, setConvDirection] = useState('j2g'); // j2g: شمسی به میلادی, g2j: میلادی به شمسی
  const [convJDay, setConvJDay] = useState(() => String(toJalali(new Date()).jd));
  const [convJMonth, setConvJMonth] = useState(() => String(toJalali(new Date()).jm));
  const [convJYear, setConvJYear] = useState(() => String(toJalali(new Date()).jy));
  const [convGDay, setConvGDay] = useState(() => String(new Date().getDate()));
  const [convGMonth, setConvGMonth] = useState(() => String(new Date().getMonth() + 1));
  const [convGYear, setConvGYear] = useState(() => String(new Date().getFullYear()));
  const [conversionResult, setConversionResult] = useState('');

  const handleConvertDate = () => {
    try {
      if (convDirection === 'j2g') {
        const y = parseInt(convJYear, 10);
        const m = parseInt(convJMonth, 10);
        const d = parseInt(convJDay, 10);
        if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
          setConversionResult('تاریخ شمسی واردشده نامعتبر است');
          return;
        }
        const gDate = toGregorian(y, m, d);
        const gStr = gDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setConversionResult(`معادل میلادی: ${gStr} (${gDate.toISOString().slice(0, 10)})`);
      } else {
        const y = parseInt(convGYear, 10);
        const m = parseInt(convGMonth, 10);
        const d = parseInt(convGDay, 10);
        if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
          setConversionResult('تاریخ میلادی واردشده نامعتبر است');
          return;
        }
        const gDate = new Date(y, m - 1, d);
        const jStr = formatJalali(gDate, { weekday: true, year: true });
        const jNum = formatJalaliNumeric(gDate);
        setConversionResult(`معادل شمسی: ${jStr} (${jNum})`);
      }
    } catch {
      setConversionResult('خطا در تبدیل تاریخ');
    }
  };

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
            <p className="text-[11px] text-muted-foreground font-sans">تسویه آنی ریالی، نرخ ۶ صرافی برتر و سپر ضد فریز</p>
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
          <span>نرخ ۶ صرافی و کارمزد</span>
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
          <span>سپر ضد فریز</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            subTab === 'calendar'
              ? 'bg-card text-emerald-400 border border-border shadow-sm'
              : 'text-fgSubtle hover:text-fg hover:bg-card/50'
          }`}
        >
          <CalendarLucide size={13} className={subTab === 'calendar' ? 'text-emerald-400' : ''} />
          <span>تقویم شمسی و تسویه</span>
        </button>
      </div>

      {/* Unified Live Rate Summary Banner */}
      <div className="card card-hover p-4 border border-white/[0.08] rounded-2xl bg-white/[0.02] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs sm:text-sm text-foreground font-sans font-bold flex flex-wrap items-center gap-2">
                <span>نرخ مرجع تتر در پی‌وند:</span>
                <span className="text-emerald-400 font-sans font-black text-sm sm:text-base" dir="rtl">
                  {formatToman(tomanRate)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">
                محاسبه برخط از ۶ صرافی معتبر: نوبیتکس، والکس، بیت‌پین، رمزینکس، اوام‌پی فینکس و آبان‌تتر
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setSubTab('gas_tracker')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-sans transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 ${
              subTab === 'gas_tracker'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>تابلوی مقایسه ۶ صرافی</span>
            <span>←</span>
          </button>
        </div>
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
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex justify-between items-center text-xs">
                <span className="font-semibold text-fg">مبلغ واریزی به حساب شما:</span>
                <strong className="text-emerald-400 font-sans font-black text-sm sm:text-base">{formatToman(finalTomanPayout)}</strong>
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

      {/* SUBTAB 2: GAS TRACKER & 6 EXCHANGES */}
      {subTab === 'gas_tracker' && (
        <div className="card card-hover p-4 sm:p-5 space-y-4 animate-fade-in border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-bold text-foreground font-sans">تابلوی مقایسه زنده نرخ ۶ صرافی برتر ایران</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                نرخ مرجع سایت (میانگین وزنی): <strong className="text-emerald-400 font-sans font-extrabold">{formatToman(tomanRate)}</strong>
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold self-start sm:self-auto shrink-0">
              ۶ صرافی فعال
            </span>
          </div>

          {/* 6 Exchanges Live Comparison Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {exchanges.map((ex, idx) => {
                const diff = ex.price - tomanRate;
                const isCheaper = diff < 0;
                return (
                  <div 
                    key={ex.id || idx}
                    className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-foreground font-sans truncate">
                          {ex.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground font-mono shrink-0">
                        {ex.volumeShare ? `سهم ${ex.volumeShare}` : 'فعال'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.04]">
                      <span className="text-xs text-muted-foreground font-sans">نرخ تتر:</span>
                      <span className="font-sans font-black text-sm sm:text-base text-emerald-400" dir="rtl">
                        {formatToman(ex.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>فاصله از میانگین:</span>
                      <span className={`font-sans font-bold ${isCheaper ? 'text-sky-400' : 'text-amber-400'}`} dir="rtl">
                        {diff === 0 ? 'نرخ مبنا' : `${Math.abs(diff)} تومان ${isCheaper ? 'پایین‌تر' : 'بالاتر'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Information Banner */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-muted-foreground flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="font-sans leading-relaxed">
              کلیه قیمت‌ها به‌صورت زنده از API صرافی‌های رسمی داخلی (نوبیتکس، والکس، بیت‌پین، رمزینکس، اوام‌پی فینکس و آبان‌تتر) به‌روزرسانی شده و میانگین وزنی آن‌ها به عنوان نرخ مرجع تسویه در پلتفرم پی‌وند اعمال می‌شود.
            </span>
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

      {/* SubTab 4: Jalali Calendar & Banking Settlement Schedule */}
      {subTab === 'calendar' && (
        <div className="space-y-4 animate-fade-in font-sans">
          
          {/* Header Status Card */}
          <div className="card p-4 border border-border/70 rounded-2xl bg-card space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-2">
                    <span>تاریخ رسمی امروز ایران:</span>
                    <span className="text-emerald-400 font-black">{formatJalali(new Date(), { weekday: true, year: true })}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">
                    بر مبنای ساعت رسمی کشور (Asia/Tehran • UTC+03:30) • تقویم خورشیدی رسمی
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {new Date().getDay() === 5 ? 'جمعه • تعطیل رسمی' : 'روز کاری فعال شبکه بانکی'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
              <span>معادل میلادی روز جاری:</span>
              <span className="font-mono text-foreground font-bold" dir="ltr">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* 2-Column Responsive Grid: Calendar on Right, Settlement & Tools on Left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            
            {/* Column 1: Interactive FarsiUI Jalali Calendar Component */}
            <div className="space-y-3 flex flex-col items-center">
              <Calendar
                selected={selectedCalendarDate}
                onSelect={setSelectedCalendarDate}
                className="w-full max-w-full"
              />

              {/* Selected Day Info Card */}
              <div className="w-full p-3.5 rounded-2xl bg-card border border-border/70 text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">روز انتخاب‌شده در تقویم:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatJalali(selectedCalendarDate, { weekday: true, year: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>وضعیت تسویه پایا:</span>
                  <span className={selectedCalendarDate.getDay() === 5 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedCalendarDate.getDay() === 5 ? 'تعطیل (انتقال به صبح شنبه)' : 'فعال در ۴ چرخه روزانه'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Banking Settlement Timetable & Converter */}
            <div className="space-y-3.5">
              
              {/* Card 1: Official PAYA & SATNA Settlement Cycles */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Clock size={15} className="text-accent" />
                    <span>سیکل‌های تسویه شاپرک و پایا (بانک مرکزی)</span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">۴ چرخه رسمی</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block text-xs">چرخه ۱ (بامداد)</span>
                      <span className="text-[10px] text-muted-foreground">تراکنش‌های ساعت ۱۹:۰۰ الی ۲۴:۰۰</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs" dir="ltr">۰۳:۴۵ صبح</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block text-xs">چرخه ۲ (صبحگاهی)</span>
                      <span className="text-[10px] text-muted-foreground">تراکنش‌های بامداد تا ساعت ۱۰:۰۰</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs" dir="ltr">۱۰:۴۵ صبح</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block text-xs">چرخه ۳ (ظهرگاهی)</span>
                      <span className="text-[10px] text-muted-foreground">تراکنش‌های ساعات اولیه اداری</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs" dir="ltr">۱۳:۴۵ بعدازظهر</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block text-xs">چرخه ۴ (عصرگاهی)</span>
                      <span className="text-[10px] text-muted-foreground">آخرین تسویه روز کاری جاری</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs" dir="ltr">۱۸:۴۵ عصر</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2 font-sans">
                  <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    در روزهای جمعه و تعطیلات رسمی، مبالغ نقدشده در چرخه اول اولین روز کاری بعد (شنبه ساعت ۰۳:۴۵) به حساب شما واریز خواهد شد.
                  </span>
                </div>
              </div>

              {/* Card 2: Two-way Date Converter */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ArrowLeftRight size={15} className="text-accent" />
                    <span>مبدل تقویم شمسی ↔ میلادی</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setConvDirection(d => d === 'j2g' ? 'g2j' : 'j2g');
                      setConversionResult('');
                    }}
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 font-sans"
                  >
                    <span>{convDirection === 'j2g' ? 'تغییر به میلادی به شمسی' : 'تغییر به شمسی به میلادی'}</span>
                  </button>
                </div>

                {convDirection === 'j2g' ? (
                  <div className="space-y-2.5 font-sans">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">روز</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={convJDay}
                          onChange={(e) => setConvJDay(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">ماه</label>
                        <select
                          value={convJMonth}
                          onChange={(e) => setConvJMonth(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs font-sans"
                        >
                          {JALALI_MONTHS.map((mName, idx) => (
                            <option key={mName} value={idx + 1}>{mName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">سال</label>
                        <input
                          type="number"
                          value={convJYear}
                          onChange={(e) => setConvJYear(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConvertDate}
                      className="w-full py-2 rounded-xl bg-accent hover:bg-emerald-600 text-background font-bold text-xs transition-colors shadow-xs"
                    >
                      تبدیل به تقویم میلادی
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 font-sans">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1 font-mono">Day</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={convGDay}
                          onChange={(e) => setConvGDay(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1 font-mono">Month</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={convGMonth}
                          onChange={(e) => setConvGMonth(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1 font-mono">Year</label>
                        <input
                          type="number"
                          value={convGYear}
                          onChange={(e) => setConvGYear(e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-center font-bold text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConvertDate}
                      className="w-full py-2 rounded-xl bg-accent hover:bg-emerald-600 text-background font-bold text-xs transition-colors shadow-xs"
                    >
                      تبدیل به تقویم شمسی
                    </button>
                  </div>
                )}

                {conversionResult && (
                  <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-xs font-bold text-accent text-center animate-fade-in font-sans">
                    {conversionResult}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}