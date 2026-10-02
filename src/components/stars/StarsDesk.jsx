import React, { useState } from 'react';
import { 
  Send, 
  AtSign,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { 
  TonIcon, 
  SolanaIcon, 
  TronIcon, 
  UsdtIcon, 
  StarsIcon 
} from '../Icons';
import { 
  STARS_PACKAGES, 
  PAYMENT_METHODS, 
  calculateStarsPrice, 
  createStarsOrder 
} from '../../services/starsService';
import { toPersianDigits, formatToman } from '../../utils/format';
import { getIranTetherRate } from '../../services/priceService';
import StarsInvoiceModal from './StarsInvoiceModal';

export default function StarsDesk({ onOrderCreated, onBackToSwap }) {
  const [mode, setMode] = useState('buy'); // 'buy' | 'sell'
  const [selectedStars, setSelectedStars] = useState(500);
  const [customStars, setCustomStars] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ton');

  // Sell Stars state
  const [sellStarsAmount, setSellStarsAmount] = useState('500');
  const [sellPayoutAddress, setSellPayoutAddress] = useState('');
  const [sellPayoutMethod, setSellPayoutMethod] = useState('ton');

  // Active Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [validationError, setValidationError] = useState('');

  const currentStarsCount = customStars ? Number(customStars) : selectedStars;
  const pricing = calculateStarsPrice(currentStarsCount, selectedMethod);

  // Sell pricing calculation (buying back at 92% rate)
  const sellRateToman = getIranTetherRate() || 234000;
  const sellCount = Number(sellStarsAmount) || 0;
  const sellPayoutUSD = (sellCount * 0.013).toFixed(2);
  const sellPayoutToman = Math.round(Number(sellPayoutUSD) * sellRateToman);

  const handlePackageClick = (stars) => {
    setSelectedStars(stars);
    setCustomStars('');
  };

  const handleCustomChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    setCustomStars(clean);
  };

  const handleCreateBuyOrder = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanUsername = telegramUsername.trim();
    if (!cleanUsername) {
      setValidationError('لطفاً آیدی اکانت یا کانال تلگرام را وارد فرمایید.');
      return;
    }

    if (!cleanUsername.replace('@', '').match(/^[a-zA-Z0-9_]{4,32}$/)) {
      setValidationError('فرمت آیدی تلگرام نامعتبر است (تنها حروف انگلیسی، عدد و _ مجاز است).');
      return;
    }

    if (currentStarsCount < 50) {
      setValidationError('حداقل تعداد خرید استارز ۵۰ عدد است.');
      return;
    }

    const order = createStarsOrder({
      type: 'buy',
      stars: currentStarsCount,
      username: cleanUsername,
      methodId: selectedMethod
    });

    setActiveInvoice(order);
    if (onOrderCreated) onOrderCreated(order);
  };

  const handleCreateSellOrder = (e) => {
    e.preventDefault();
    setValidationError('');

    const count = Number(sellStarsAmount);
    if (count < 100) {
      setValidationError('حداقل تعداد استارز جهت فروش به پلتفرم ۱۰۰ عدد می‌باشد.');
      return;
    }

    if (!sellPayoutAddress.trim()) {
      setValidationError('لطفاً آدرس کیف‌پول جهت دریافت معادل ارزی را وارد فرمایید.');
      return;
    }

    const order = createStarsOrder({
      type: 'sell',
      stars: count,
      username: telegramUsername.trim() || '@seller',
      methodId: sellPayoutMethod,
      payoutAddress: sellPayoutAddress.trim()
    });

    setActiveInvoice(order);
    if (onOrderCreated) onOrderCreated(order);
  };

  const renderMethodIcon = (id) => {
    switch (id) {
      case 'ton': return <TonIcon size={20} />;
      case 'usdt_trc20': return <UsdtIcon size={20} />;
      case 'sol': return <SolanaIcon size={20} />;
      case 'trx': return <TronIcon size={20} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {onBackToSwap && (
        <button
          type="button"
          onClick={onBackToSwap}
          className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-1 transition-all"
        >
          <ArrowRight size={14} />
          <span>بازگشت به سواپ چندزنجیره‌ای</span>
        </button>
      )}
      
      {/* Top Desk Card */}
      <div className="card p-5 sm:p-6 shadow-sm">
        
        {/* Header Title & Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <StarsIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-fg">میز معامله مستقیم استارز تلگرام</h2>
              <p className="text-xs text-fgMuted">خرید و فروش بی‌واسطه با تتر، تون، سولانا و ترون</p>
            </div>
          </div>

          {/* Mode Switch (Buy / Sell) */}
          <div className="p-1 bg-muted/60 border border-border rounded-lg flex items-center shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setMode('buy'); setValidationError(''); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === 'buy'
                  ? 'bg-card text-amber-400 shadow-sm border border-border'
                  : 'text-fgSubtle hover:text-fg'
              }`}
            >
              خرید استارز
            </button>
            <button
              type="button"
              onClick={() => { setMode('sell'); setValidationError(''); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === 'sell'
                  ? 'bg-card text-accent shadow-sm border border-border'
                  : 'text-fgSubtle hover:text-fg'
              }`}
            >
              فروش استارز
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-3 p-3 rounded-lg bg-destructiveSoft border border-destructive/30 text-red-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <HelpCircle size={15} className="text-destructive shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* =========================================================
            MODE 1: BUY STARS
           ========================================================= */}
        {mode === 'buy' && (
          <form onSubmit={handleCreateBuyOrder} className="mt-5 space-y-4">
            
            {/* Step 1: Telegram Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg flex items-center justify-between">
                <span>۱. نام کاربری تلگرام (اکانت یا ربات دریافت‌کننده):</span>
                <span className="text-[11px] text-fgSubtle font-normal">نیازی به پسورد نیست</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: javad_crypto یا @mybot"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="input pr-9 py-2.5 font-mono text-sm"
                  dir="ltr"
                />
                <AtSign size={16} className="absolute right-3 top-3 text-fgSubtle" />
              </div>
            </div>

            {/* Step 2: Select Package */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-fg">
                  ۲. انتخاب پکیج استارز:
                </label>
                <span className="text-[11px] text-amber-400 font-semibold font-mono">
                  هر استارز ≈ {formatToman(pricing.unitPriceToman)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STARS_PACKAGES.map((pkg) => {
                  const isSelected = !customStars && selectedStars === pkg.stars;
                  return (
                    <button
                      key={pkg.stars}
                      type="button"
                      onClick={() => handlePackageClick(pkg.stars)}
                      className={`p-2.5 rounded-xl border text-right transition-all group ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500/50 text-fg' 
                          : 'bg-muted/30 border-border hover:border-zinc-500'
                      }`}
                    >
                      {pkg.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold block w-fit mb-1 ${
                          pkg.popular ? 'bg-amber-400 text-bg' : 'bg-muted text-fgMuted'
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 font-bold text-sm text-fg group-hover:text-amber-400 transition-colors">
                        <StarsIcon size={14} />
                        <span>{toPersianDigits(pkg.stars)}</span>
                      </div>
                      <span className="text-[10px] text-fgSubtle block mt-0.5 font-mono">
                        {formatToman(calculateStarsPrice(pkg.stars, selectedMethod).totalToman)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Stars Input */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="یا تعداد دلخواه استارز را وارد نمایید (حداقل ۵۰)..."
                  value={customStars}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="input py-2 text-xs font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-fg">
                ۳. ارز پرداختی جهت تسویه:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                        isSelected 
                          ? 'bg-accentSoft border-accent/40 text-fg' 
                          : 'bg-muted/30 border-border text-fgMuted hover:text-fg'
                      }`}
                    >
                      {renderMethodIcon(m.id)}
                      <div>
                        <strong className="text-xs block text-fg">{m.symbol}</strong>
                        <span className="text-[10px] text-fgSubtle">{m.network.split(' ')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center text-fgMuted">
                <span>تعداد استارز انتخابی:</span>
                <strong className="text-fg font-mono">{toPersianDigits(currentStarsCount)} Stars</strong>
              </div>
              <div className="flex justify-between items-center text-fgMuted">
                <span>مبلغ کل به تومان:</span>
                <strong className="text-amber-400 font-bold text-sm font-mono">{formatToman(pricing.totalToman)}</strong>
              </div>
              <div className="flex justify-between items-center text-fgMuted pt-1.5 border-t border-border/60">
                <span>مبلغ نهایی قابل واریز کریپتو:</span>
                <strong className="text-accent font-mono text-sm" dir="ltr">
                  {pricing.cryptoAmount} {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.symbol}
                </strong>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-primary text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ثبت سفارش و صدور پیش‌فاکتور</span>
              <Send size={15} />
            </button>
          </form>
        )}

        {/* =========================================================
            MODE 2: SELL STARS
           ========================================================= */}
        {mode === 'sell' && (
          <form onSubmit={handleCreateSellOrder} className="mt-5 space-y-4 animate-fade-in">
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-fgMuted leading-relaxed">
              💡 استارزهای دریافتی از چنل یا ربات خود را با نرخ لحظه‌ای بازار نقد کنید. معادل کریپتو به کیف‌پول شما واریز می‌گردد.
            </div>

            {/* Stars to Sell */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg">
                تعداد استارز جهت فروش (حداقل ۱۰۰ عدد):
              </label>
              <input
                type="number"
                min="100"
                required
                placeholder="مثال: 1000"
                value={sellStarsAmount}
                onChange={(e) => setSellStarsAmount(e.target.value)}
                className="input py-2.5 font-mono text-sm"
                dir="ltr"
              />
            </div>

            {/* Payout Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg">
                ارز دریافتی شما:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSellPayoutMethod('ton')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                    sellPayoutMethod === 'ton' 
                      ? 'bg-[#0088CC]/15 border-[#0088CC]/50 text-fg' 
                      : 'bg-muted/30 border-border text-fgMuted'
                  }`}
                >
                  <TonIcon size={18} />
                  <div>
                    <strong className="text-xs block text-fg">Toncoin (TON)</strong>
                    <span className="text-[10px] text-fgSubtle">شبکه TON</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSellPayoutMethod('usdt_trc20')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                    sellPayoutMethod === 'usdt_trc20' 
                      ? 'bg-accentSoft border-accent/40 text-fg' 
                      : 'bg-muted/30 border-border text-fgMuted'
                  }`}
                >
                  <UsdtIcon size={18} />
                  <div>
                    <strong className="text-xs block text-fg">Tether (USDT TRC-20)</strong>
                    <span className="text-[10px] text-fgSubtle">شبکه ترون</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Payout Destination Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg">
                آدرس کیف‌پول شما جهت واریز وجه:
              </label>
              <input
                type="text"
                required
                placeholder="آدرس کیف‌پول مقصد خود را وارد نمایید..."
                value={sellPayoutAddress}
                onChange={(e) => setSellPayoutAddress(e.target.value)}
                className="input py-2.5 font-mono text-xs"
                dir="ltr"
              />
            </div>

            {/* Sell Summary */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center text-fgMuted">
                <span>مبلغ دریافتی شما به تومان:</span>
                <strong className="text-fg font-bold font-mono">{formatToman(sellPayoutToman)}</strong>
              </div>
              <div className="flex justify-between items-center text-fgMuted pt-1.5 border-t border-border/60">
                <span>معادل ارز واریزی به ولت شما:</span>
                <strong className="text-accent font-mono text-sm" dir="ltr">
                  ≈ {sellPayoutUSD} USD
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-primary text-sm flex items-center justify-center gap-2"
            >
              ثبت درخواست فروش استارز
            </button>
          </form>
        )}

      </div>

      {/* Invoice Modal */}
      <StarsInvoiceModal
        order={activeInvoice}
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        onOrderUpdated={(up) => setActiveInvoice(up)}
      />

    </div>
  );
}
