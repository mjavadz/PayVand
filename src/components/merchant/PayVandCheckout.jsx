import React, { useState } from 'react';
import { Store, Code, Copy, Check, ShieldCheck, Zap, ArrowLeft, ExternalLink, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { IranFlagIcon } from '../Icons';

export default function PayVandCheckout() {
  const [storeName, setStoreName] = useState('فروشگاه آرایشی و بهداشتی ترنج');
  const [merchantWallet, setMerchantWallet] = useState('UQD7...PayVandMerchant98x');
  const [amount, setAmount] = useState('45');
  const [currency, setCurrency] = useState('USDT (TON)');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'html', 'react', 'woocommerce'

  const htmlSnippet = `<!-- افزونه درگاه پرداخت پی‌وند برای فروشگاه‌های اینترنتی -->
<script src="https://javadnode.top/payvand-widget.js" async></script>

<button 
  data-payvand-checkout
  data-store="${storeName}"
  data-amount="${amount}"
  data-currency="${currency}"
  data-merchant="${merchantWallet}"
  style="background: linear-gradient(135deg, #10B981, #06B6D4); color: #000; font-weight: bold; padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer;">
  پرداخت امن کریپتویی با پی‌وند
</button>`;

  const reactSnippet = `import { useEffect } from 'react';

export function PayVandButton({ amount = "${amount}", currency = "${currency}" }) {
  const handlePay = () => {
    if (window.PayVand) {
      window.PayVand.open({
        storeName: "${storeName}",
        amount: "${amount}",
        currency: "${currency}",
        merchant: "${merchantWallet}",
        onSuccess: (data) => console.log('پرداخت موفق:', data)
      });
    }
  };

  return (
    <button onClick={handlePay} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-xl shadow-lg">
      پرداخت غیرحضانتی PayVand
    </button>
  );
}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const [showTestModal, setShowTestModal] = useState(false);
  const [isTestPaid, setIsTestPaid] = useState(false);

  const handleTestCheckout = () => {
    setIsTestPaid(false);
    setShowTestModal(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold">
              <Store size={14} />
              <span>ویژه وبسایت‌ها، فروشگاه‌ها و کسب‌وکارهای آنلاین</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground font-sans tracking-tight">
              درگاه و افزونه پرداخت غیرحضانتی پی‌وند (PayVand Pay)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-sans">
              بدون نیاز به شرکت‌های واسط، احراز هویت شرکتی یا کارمزدهای سنگین؛ فروشگاه خود را با یک خط کد به شبکه پرداخت ۱۵ زنجیره وب۳ مجهز کنید و مبالغ را مستقیم روی کیف‌پول شخصی تحویل بگیرید.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2">
            <button
              onClick={handleTestCheckout}
              className="px-4 py-2.5 rounded-xl bg-accent text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/20 hover:opacity-90 transition-all font-sans cursor-pointer"
            >
              <Zap size={14} />
              <span>تست زنده درگاه مشتری</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Key Advantages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-bold text-sm text-foreground font-sans">۱۰۰٪ تسویه مستقیم (غیرحضانتی)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            پول مشتری هرگز در سرورهای واسط نمی‌ماند و در همان لحظه تراکنش مستقیم وارد ولت شخصی شما می‌شود.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <Zap size={18} />
          </div>
          <h3 className="font-bold text-sm text-foreground font-sans">سپر ضد تحریم و بدون فیلتر</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            ترافیک تراکنش‌ها از طریق نودهای امن Edge کلادفلر پی‌وند عبور کرده و مسدودسازی IP ایران بی‌اثر است.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Sparkles size={18} />
          </div>
          <h3 className="font-bold text-sm text-foreground font-sans">نصب فوری در ۲ دقیقه</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            سازگار با وردپرس، ووکامرس، شاپایفای، ربات‌های تلگرام و وبسایت‌های اختصاصی (React, Vue, HTML).
          </p>
        </div>
      </div>

      {/* Live Builder & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Form Configurator (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border/50 font-sans">
            <Code size={16} className="text-accent" />
            <span>تنظیمات فاکتور و درگاه</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">نام فروشگاه یا وبسایت شما</label>
              <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-sans focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">آدرس کیف‌پول تسویه (مقصد واریزی‌ها)</label>
              <input 
                type="text" 
                value={merchantWallet} 
                onChange={(e) => setMerchantWallet(e.target.value)}
                placeholder="آدرس ولت تون، سولانا، اتریوم یا زی‌کش"
                className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-mono text-[11px] focus:outline-none focus:border-accent dir-ltr"
              />
              <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                تتر یا هر ارزی که مشتری بپردازد، مستقیم به این آدرس واریز می‌شود.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted-foreground mb-1.5 font-medium">مبلغ نمونه فاکتور</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-mono focus:outline-none focus:border-accent dir-ltr"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5 font-medium">ارز دریافتی</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs focus:outline-none focus:border-accent"
                >
                  <option value="USDT (TON)">تتر شبکه تون (USDT)</option>
                  <option value="TON">تون‌کوین (TON)</option>
                  <option value="USDT (TRC20)">تتر ترون (TRC20)</option>
                  <option value="USDC (Solana)">یو‌اس‌دی‌سی سولانا</option>
                  <option value="LUSD">ال‌یو‌اس‌دی ضد فریز</option>
                  <option value="ZEC">زی‌کش محرمانه (ZEC)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestCheckout}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-accent font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode size={14} />
                <span>نمایش پنجره درگاه برای مشتری</span>
              </button>
            </div>
          </div>
        </div>

        {/* Code & Integration Tabs (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'html' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                اسکریپت HTML
              </button>
              <button
                onClick={() => setActiveTab('react')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'react' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                کامپوننت React
              </button>
              <button
                onClick={() => setActiveTab('woocommerce')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'woocommerce' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ووکامرس / وردپرس
              </button>
            </div>

            <button
              onClick={() => handleCopy(activeTab === 'html' ? htmlSnippet : (activeTab === 'react' ? reactSnippet : 'افزونه درگاه PayVand برای ووکامرس به زودی در مخزن وردپرس منتشر خواهد شد.'))}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-[11px] font-semibold flex items-center gap-1 transition-all"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCode ? 'کپی شد' : 'کپی کد'}</span>
            </button>
          </div>

          {/* Snippet Display */}
          {activeTab === 'html' && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-sans">
                این کد را در هر کجای وبسایت یا پنل فروشگاهی خود قرار دهید؛ دکمه پرداخت به صورت خودکار فعال می‌شود:
              </p>
              <pre className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed dir-ltr max-h-56">
                {htmlSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-sans">
                برای وبسایت‌های مدرن بر پایه Next.js، Vite یا Create React App:
              </p>
              <pre className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed dir-ltr max-h-56">
                {reactSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'woocommerce' && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 size={16} className="text-accent" />
                <span>اتصال آسان به فروشگاه‌سازهای ایرانی و ووکامرس</span>
              </div>
              <p className="text-muted-foreground">
                برای فعال‌سازی در ووکامرس، کافی است آدرس وب‌هوک و ولت مقصد خود را در بخش تسویه حساب قرار دهید. سیستم PayVand پس از پرداخت مشتری، وضعیت سفارش را در کمتر از ۱۰ ثانیه به «تکمیل شده» تغییر می‌دهد.
              </p>
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-[11px] text-accent/90 dir-ltr">
                Webhook URL: https://javadnode.top/api/merchant/webhook
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between text-xs text-accent">
            <span>بدون کسر درصد کارمزد از فروشگاه (کارمزد ۰٪ برای فروشندگان)</span>
            <span className="font-bold">تسویه آنی روی زنجیره</span>
          </div>

        </div>

      </div>

      {/* Customer Checkout Modal Test Simulation */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141E] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in space-y-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="PayVand" className="w-5 h-5 object-contain" />
                <span className="font-bold text-xs text-foreground font-sans">درگاه پرداخت پی‌وند (PayVand Pay)</span>
              </div>
              <button 
                onClick={() => setShowTestModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
                <div className="text-[11px] text-muted-foreground font-sans">{storeName}</div>
                <div className="text-2xl font-black text-emerald-400 font-mono dir-ltr">{amount} {currency}</div>
                <div className="text-[10px] text-muted-foreground/70 font-sans">تسویه آنی و مستقیم به کیف‌پول فروشنده</div>
              </div>

              <div className="bg-white p-3 rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(merchantWallet)}`} 
                  alt="Payment QR" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-center text-muted-foreground truncate dir-ltr">
                {merchantWallet}
              </div>

              {isTestPaid ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-emerald-400 font-bold text-xs font-sans flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>تراکنش تایید شد! سفارش ثبت گردید</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">TXID: 0x9f8c...42d1 (Confirmed)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTestPaid(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs font-sans cursor-pointer hover:opacity-90 transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>شبیه‌سازی پرداخت و تایید آن‌چین</span>
                </button>
              )}
            </div>

            <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-muted-foreground font-sans">
              <span>سپر ضد تحریم PayVand</span>
              <span className="text-emerald-400 font-bold">۱۰۰٪ غیرحضانتی</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}