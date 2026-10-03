import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SwapCard from './components/swap/SwapCard';
import StarsDesk from './components/stars/StarsDesk';
import OrderTracker from './components/orders/OrderTracker';
import IranToolkit from './components/iran/IranToolkit';
import PayVandWallet from './components/wallet/PayVandWallet';
import PayVandCheckout from './components/merchant/PayVandCheckout';
import WalletModal from './components/WalletModal';
import ChainSelectorModal from './components/ChainSelectorModal';
import { useWallet } from './context/WalletContext';
import { Clock, ShieldCheck, CreditCard, ArrowDownUp, HelpCircle, Wallet, Store } from 'lucide-react';
import { StarsIcon, IranFlagIcon } from './components/Icons';

// VibeFarsi RTL Components & Backgrounds
import { GridBackground } from '@/components/backgrounds/grid';
import { TextShimmer } from '@/components/animations/text-shimmer';
import { Stat } from '@/components/ui/stat';
import { Accordion } from '@/components/ui/accordion';
import InteractiveBanner from './components/ui/InteractiveBanner';

export default function App() {
  React.useEffect(() => {
    document.title = 'پی‌وند (PayVand) | پروتکل مبادله غیرحضانتی چندزنجیره‌ای و تلگرام';
  }, []);

  const { 
    activeChain, 
    setActiveChain, 
    walletAddress, 
    isConnected,
    isDemo 
  } = useWallet();

  const [activeTab, setActiveTab] = useState('swap');
  const [iranSubTab, setIranSubTab] = useState('cashout');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);

  // VibeFarsi FAQ Accordion items
  const faqItems = [
    {
      id: 'faq-1',
      title: 'صرافی غیرحضانتی (Non-Custodial) به چه معناست؟',
      content: 'در پروتکل پی‌وند (PayVand) دارایی‌های شما هرگز در کیف‌پول پلتفرم امانت گرفته نمی‌شود. تمام تراکنش‌ها به صورت همتا‌به‌همتا (P2P) و مستقیم از کیف‌پول شخصی شما روی استخرهای نقدینگی برتر (STON.fi, Jupiter, Uniswap, SunSwap) امضا و تسویه می‌گردند.'
    },
    {
      id: 'faq-2',
      title: 'میز اختصاصی استارز تلگرام (Telegram Stars) چگونه کار می‌کند؟',
      content: 'شما می‌توانید بدون نیاز به کارت‌های بین‌المللی مسترکارت یا ویزا، با پرداخت ارزهای دیجیتال (TON, USDT, SOL, TRX) یا معادل تومانی، استارز رسمی تلگرام را با بهترین نرخ لحظه‌ای خریداری یا نقد کرده و در کمتر از چند دقیقه تحویل بگیرید.'
    },
    {
      id: 'faq-3',
      title: 'آیا برای مبادله ارزها یا خرید استارز به احراز هویت (KYC) نیاز است؟',
      content: 'خیر. پی‌وند (PayVand) بر پایه آزادی مالی وب۳ طراحی شده و برای مبادله غیرحضانتی هیچ‌گونه ثبت‌نام اجباری، بارگذاری مدارک هویتی یا ثبت ایمیل نیاز نیست.'
    },
    {
      id: 'faq-4',
      title: 'کارمزد تراکنش‌ها در کدام شبکه اقتصادی‌تر است؟',
      content: 'شبکه‌های تون (TON)، سولانا (Solana) و لایه‌های دوم اتریوم (Arbitrum, Base, Polygon) سریع‌ترین سرعت تایید (کمتر از چند ثانیه) و کمترین کارمزد گس (کمتر از چند سنت) را برای مبادلات فراهم می‌کنند.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-background relative overflow-x-hidden">
      
      {/* VibeFarsi Technical Grid Background */}
      <GridBackground size={48} className="opacity-20 pointer-events-none" />

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeChain={activeChain}
        walletAddress={walletAddress}
        isDemo={isDemo}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenChainSelector={() => setIsChainModalOpen(true)}
      />

      {/* Main Content Area (Focused centered DEX layout like Uniswap) */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 relative z-10 space-y-6">
        
        {/* Interactive Mouse-Following Spotlight Banner */}
        <InteractiveBanner />

        {/* Tab 1: Multi-Chain Crypto Swap (Uniswap-style minimal centerpiece) */}
        {activeTab === 'swap' && (
          <div className="animate-fade-in">
            <SwapCard 
              onOpenWalletModal={() => setIsWalletModalOpen(true)} 
              onOpenChainSelector={() => setIsChainModalOpen(true)}
              onSwitchToShieldTab={() => {
                setIranSubTab('anti_sanction');
                setActiveTab('iran');
              }}
            />
          </div>
        )}

        {/* Tab 2: Non-Custodial PayVand Multi-Chain Wallet */}
        {activeTab === 'wallet' && (
          <div className="animate-fade-in">
            <PayVandWallet onNavigateToSwap={() => setActiveTab('swap')} />
          </div>
        )}

        {/* Tab 3: PayVand Merchant Checkout & Plugins */}
        {activeTab === 'checkout' && (
          <div className="animate-fade-in">
            <PayVandCheckout />
          </div>
        )}

        {/* Tab 4: Direct Telegram Stars OTC Desk */}
        {activeTab === 'stars' && (
          <div className="animate-fade-in">
            <StarsDesk />
          </div>
        )}

        {/* Tab 5: Iran Web3 Toolkit */}
        {activeTab === 'iran' && (
          <div className="animate-fade-in">
            <IranToolkit initialSubTab={iranSubTab} />
          </div>
        )}

        {/* Tab 6: Order Tracker */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <OrderTracker />
          </div>
        )}

        {/* Live DEX Metrics (Placed neatly below swap card for social proof) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <Stat
            size="sm"
            label="حجم معاملات ۲۴ ساعته"
            value="۱٬۴۵۰٬۰۰۰"
            unit="$"
            delta={14}
            deltaLabel="رشد روزانه"
          />
          <Stat
            size="sm"
            label="سرعت میانگین تسویه"
            value="۲٫۴"
            unit="ثانیه"
            delta={-8}
            deltaLabel="بهبود شبکه"
          />
          <Stat
            size="sm"
            label="نرخ استارز تلگرام"
            value="۱٬۳۴۰"
            unit="تومان"
            delta={3}
            deltaLabel="لحظه‌ای"
          />
          <Stat
            size="sm"
            title="شبکه‌های متصل"
            value="۱۵"
            unit="زنجیره"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <HelpCircle className="w-4 h-4 text-accent" />
            <h2 className="text-xs font-bold text-muted-foreground font-sans">
              راهنما و پرسش‌های متداول پروتکل پی‌وند (PayVand)
            </h2>
          </div>
          <Accordion items={faqItems} multiple defaultOpen={[]} />
        </div>

      </main>

      {/* Footer (Minimalist Uniswap-grade footer) */}
      <Footer onSwitchTab={(tab) => setActiveTab(tab)} />

      {/* Mobile Floating Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border px-2 py-1.5 flex items-center justify-around font-sans">
        <button
          type="button"
          onClick={() => setActiveTab('swap')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
            activeTab === 'swap' ? 'text-accent font-semibold' : 'text-muted-foreground'
          }`}
        >
          <ArrowDownUp size={16} />
          <span className="text-[10px]">سواپ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
            activeTab === 'wallet' ? 'text-accent font-semibold' : 'text-muted-foreground'
          }`}
        >
          <Wallet size={16} />
          <span className="text-[10px]">کیف‌پول</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkout')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
            activeTab === 'checkout' ? 'text-accent font-semibold' : 'text-muted-foreground'
          }`}
        >
          <Store size={16} />
          <span className="text-[10px]">درگاه</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('iran')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
            activeTab === 'iran' ? 'text-accent font-semibold' : 'text-muted-foreground'
          }`}
        >
          <IranFlagIcon size={20} />
          <span className="text-[10px]">ایران</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
            activeTab === 'orders' ? 'text-sky-400 font-semibold' : 'text-muted-foreground'
          }`}
        >
          <Clock size={16} />
          <span className="text-[10px]">سفارشات</span>
        </button>
      </div>

      {/* Multi-Chain Wallet Connect Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Complete Network / Chain Switcher Modal */}
      <ChainSelectorModal
        isOpen={isChainModalOpen}
        onClose={() => setIsChainModalOpen(false)}
        activeChain={activeChain}
        onSelectChain={(chain) => setActiveChain(chain)}
      />

    </div>
  );
}
