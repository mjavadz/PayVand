import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowDownUp, 
  Settings2, 
  ChevronDown, 
  CheckCircle2, 
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Fuel,
  ShieldAlert
} from 'lucide-react';
import { TokenLogo, ChainLogo, StarsIcon } from '../Icons';
import TokenSelectorModal from './TokenSelectorModal';
import StarsDesk from '../stars/StarsDesk';
import { TOKENS } from '../../data/tokens';
import { getSwapQuote, executeSwap } from '../../services/swapService';
import { getIranTetherRate } from '../../services/priceService';
import { useWallet } from '../../context/WalletContext';
import { formatToman } from '../../utils/format';

export default function SwapCard({ onOpenWalletModal, onOpenChainSelector, onSwitchToShieldTab }) {
  const { 
    activeChain, 
    activeChainConfig,
    isConnected, 
    isDemo,
    walletAddress, 
    getTokenBalance,
    refetchBalances 
  } = useWallet();

  const currentChainTokens = useMemo(() => {
    return TOKENS[activeChain] || [];
  }, [activeChain]);

  const [fromToken, setFromToken] = useState(currentChainTokens[0] || null);
  const [toToken, setToToken] = useState(currentChainTokens[1] || null);

  useEffect(() => {
    const list = TOKENS[activeChain] || [];
    setFromToken(list[0] || null);
    setToToken(list[1] || null);
    if (activeChain !== 'ton') {
      setViewMode('swap');
    }
  }, [activeChain]);

  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState(null);
  const [viewMode, setViewMode] = useState('swap'); // 'swap' | 'stars'

  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState(null);
  const [swapError, setSwapError] = useState(null);

  const fromBalance = getTokenBalance(fromToken?.symbol);
  const toBalance = getTokenBalance(toToken?.symbol);
  const tetherRate = getIranTetherRate() || 66000;

  const quote = useMemo(() => {
    return getSwapQuote({
      chain: activeChain,
      fromToken,
      toToken,
      fromAmount,
      slippage: Number(slippage) || 0.5
    });
  }, [activeChain, fromToken, toToken, fromAmount, slippage]);

  const numFromAmount = Number(fromAmount);
  const numFromBalance = Number(fromBalance);
  const isInsufficientBalance = isConnected && numFromAmount > 0 && numFromAmount > numFromBalance;

  const handleInvert = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    if (quote?.toAmount) {
      setFromAmount(String(quote.toAmount));
    }
  };

  const handleSetMax = () => {
    if (numFromBalance > 0) {
      setFromAmount(String(numFromBalance));
    }
  };

  const handlePerformSwap = async () => {
    if (!isConnected) {
      onOpenWalletModal();
      return;
    }
    if (!quote || isInsufficientBalance) return;

    setIsSwapping(true);
    setSwapError(null);
    setSwapResult(null);

    try {
      const res = await executeSwap({
        chain: activeChain,
        fromToken,
        toToken,
        quote,
        userAddress: walletAddress,
        isDemo
      });
      setSwapResult(res);
      if (refetchBalances) refetchBalances();
    } catch (err) {
      setSwapError(err.message || 'خطا در اجرای سواپ');
    } finally {
      setIsSwapping(false);
    }
  };

  const getButtonText = () => {
    if (isSwapping) return 'در حال ارسال تراکنش…';
    if (!isConnected) return 'اتصال کیف پول برای تبدیل';
    if (!fromAmount || numFromAmount <= 0) return 'مقدار را وارد کنید';
    if (isInsufficientBalance) return `موجودی ناکافی (${fromBalance} ${fromToken?.symbol})`;
    return `تبدیل ${fromToken?.symbol} به ${toToken?.symbol}`;
  };

  const isButtonDisabled = isSwapping || (isConnected && (!fromAmount || numFromAmount <= 0 || isInsufficientBalance));

  return (
    <div className={`w-full ${viewMode === 'stars' ? 'max-w-2xl' : 'max-w-[460px]'} mx-auto animate-fade-in space-y-3`}>
      
      {/* Telegram Ecosystem Switcher: ONLY shown when TON network is active */}
      {activeChain === 'ton' && (
        <div className="flex items-center p-1 bg-sky-500/[0.08] border border-sky-500/25 rounded-2xl max-w-fit mx-auto shadow-sm animate-fade-in">
          <button
            type="button"
            onClick={() => setViewMode('swap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'swap'
                ? 'bg-card text-foreground border border-white/[0.1] shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            تبدیل توکن‌های TON (GRAM)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stars')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'stars'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <StarsIcon size={14} />
            <span>میز استارز تلگرام (Stars)</span>
          </button>
        </div>
      )}

      {viewMode === 'stars' ? (
        <StarsDesk onBackToSwap={() => setViewMode('swap')} />
      ) : (
        <>
          {/* Uniswap / Sushi Minimalist Container */}
          <div className="bg-card/95 border border-white/[0.08] rounded-[28px] p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl space-y-2.5">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">تبدیل (SWAP)</h2>
                
                {/* Active Chain Selector Pill */}
                <button
                  type="button"
                  onClick={onOpenChainSelector}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-foreground font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="تغییر شبکه مبادله"
                >
                  <ChainLogo chainId={activeChain} size={15} />
                  <span>{activeChainConfig?.name || activeChain.toUpperCase()}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>

                {isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    دمو
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-xl border transition-all ${
                    showSettings 
                      ? 'bg-accent/15 border-accent/40 text-accent' 
                      : 'bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
                  }`}
                  title="تنظیمات تلرانس و اسلیپیج"
                  aria-label="Slippage settings"
                >
                  <Settings2 size={15} />
                </button>
              </div>
            </div>

            {/* Telegram Ecosystem Banner when TON is active */}
            {activeChain === 'ton' && (
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-sky-500/10 border border-sky-500/25 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2 text-sky-300 font-medium">
                  <StarsIcon size={15} />
                  <span>پشتیبانی از TON، توکن‌های GRAM و استارز رسمی تلگرام</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('stars')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <span>ورود به میز استارز</span>
                  <span>←</span>
                </button>
              </div>
            )}

        {/* Slippage Settings Drawer */}
        {showSettings && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 animate-scale-in">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>تلرانس لغزش نرخ (Slippage):</span>
              <span className="text-accent font-mono font-bold">{slippage}%</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['0.1', '0.5', '1.0'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSlippage(val)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    slippage === val 
                      ? 'bg-accent text-background font-extrabold' 
                      : 'bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <input
                type="text"
                placeholder="دلخواه"
                value={['0.1', '0.5', '1.0'].includes(slippage) ? '' : slippage}
                onChange={(e) => setSlippage(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full text-center py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent font-mono"
              />
            </div>
          </div>
        )}

        {/* PAY INPUT CONTAINER (Uniswap "You Pay" Card) */}
        <div className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.04] focus-within:bg-white/[0.04] border border-white/[0.06] focus-within:border-accent/40 transition-all space-y-2">
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">پرداخت می‌کنید</span>
            <span className="font-mono" dir="ltr">
              ≈ {quote ? `$${quote.fromValueUSD}` : '$0.00'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full bg-transparent text-3xl sm:text-4xl font-bold font-mono text-foreground placeholder:text-zinc-600 focus:outline-none"
              aria-label="مقدار پرداخت"
            />

            {/* Token Selector Pill */}
            <button
              type="button"
              onClick={() => setSelectorTarget('from')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] transition-all shadow-sm shrink-0 group"
            >
              <TokenLogo symbol={fromToken?.symbol} size={22} />
              <span className="font-bold text-sm text-foreground">{fromToken?.symbol || 'انتخاب'}</span>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <span>موجودی:</span>
              <span className="font-mono text-foreground font-semibold" dir="ltr">{fromBalance}</span>
            </div>
            
            {isConnected && numFromBalance > 0 && (
              <button 
                type="button" 
                onClick={handleSetMax}
                className="font-bold text-accent hover:text-emerald-300 text-xs px-2 py-0.5 rounded-md hover:bg-accent/10 transition-colors"
              >
                حداکثر (MAX)
              </button>
            )}
          </div>
        </div>

        {/* FLOATING INVERT / SWITCH BUTTON (Signature Uniswap style) */}
        <div className="relative -my-3 z-10 flex justify-center">
          <button
            type="button"
            onClick={handleInvert}
            className="w-10 h-10 rounded-2xl bg-card border-4 border-background hover:border-accent/40 text-muted-foreground hover:text-accent hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
            title="جابجایی مبدا و مقصد"
            aria-label="Swap direction"
          >
            <ArrowDownUp size={15} />
          </button>
        </div>

        {/* RECEIVE OUTPUT CONTAINER (Uniswap "You Receive" Card) */}
        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] transition-all space-y-2">
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">دریافت می‌کنید</span>
            <div className="flex items-center gap-1 text-xs font-mono" dir="ltr">
              <span>≈ {quote ? `$${quote.toValueUSD}` : '$0.00'}</span>
              {quote && Number(quote.toValueUSD) > 0 && (
                <span className="text-[11px] text-accent/80 font-sans">
                  ({formatToman(Math.round(Number(quote.toValueUSD) * tetherRate))})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              readOnly
              placeholder="0"
              value={quote ? quote.toAmount : ''}
              className="w-full bg-transparent text-3xl sm:text-4xl font-bold font-mono text-accent placeholder:text-zinc-600 focus:outline-none"
              aria-label="مقدار دریافتی"
            />

            {/* Destination Token Selector Pill */}
            <button
              type="button"
              onClick={() => setSelectorTarget('to')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] transition-all shadow-sm shrink-0 group"
            >
              <TokenLogo symbol={toToken?.symbol} size={22} />
              <span className="font-bold text-sm text-foreground">{toToken?.symbol || 'انتخاب'}</span>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <span>موجودی:</span>
              <span className="font-mono text-foreground font-semibold" dir="ltr">{toBalance}</span>
            </div>
            
            {quote && (
              <span className="text-[11px] text-muted-foreground/80 font-mono" dir="ltr">
                1 {fromToken?.symbol} ≈ {quote.rate} {toToken?.symbol}
              </span>
            )}
          </div>
        </div>

        {/* Live Route & Gas Details Accordion */}
        {quote && (
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1.5 text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>مسیر هوشمند دیفای:</span>
              <span className="text-accent font-semibold">{quote.protocol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>حداقل دریافتی پس از اسلیپیج:</span>
              <span className="font-mono text-foreground" dir="ltr">{quote.minReceived} {toToken?.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Fuel size={12} className="text-muted-foreground" />
                <span>کارمزد گس شبکه:</span>
              </span>
              <span className="font-mono text-foreground" dir="ltr">{quote.gasFee.fee} ({quote.gasFee.usd})</span>
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {swapError && (
          <div className="p-3 rounded-2xl bg-destructiveSoft border border-destructive/30 flex items-center gap-2 text-xs text-red-300 animate-fade-in">
            <AlertCircle size={15} className="text-destructive shrink-0" />
            <span>{swapError}</span>
          </div>
        )}

        {/* Anti-Freeze Security Notice for USDT */}
        {(fromToken?.symbol === 'USDT' || toToken?.symbol === 'USDT') && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldAlert size={14} />
                <span>هشدارهای امنیتی تتر (USDT)</span>
              </span>
              {onSwitchToShieldTab && (
                <button
                  type="button"
                  onClick={onSwitchToShieldTab}
                  className="text-[10px] text-accent hover:underline font-semibold"
                >
                  راهنمای قطع ردپای آن‌چین ←
                </button>
              )}
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed font-normal">
              تتر به دلیل متمرکز بودن دارای تابع مسدودسازی (فریز) است. برای نگهداری امن، سواپ به ارزهای بومی ({activeChain.toUpperCase()}) یا استیبل‌کوین‌های غیرمتمرکز (DAI / LUSD) پیشنهاد می‌شود.
            </p>
          </div>
        )}

        {/* PRIMARY ACTION CTA BUTTON */}
        <div className="pt-1">
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={handlePerformSwap}
            className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-150 flex items-center justify-center gap-2 shadow-lg ${
              !isConnected
                ? 'bg-accent hover:bg-emerald-400 text-background font-extrabold shadow-accent/20 active:scale-[0.99]'
                : isInsufficientBalance || (!fromAmount || numFromAmount <= 0)
                ? 'bg-white/[0.04] text-muted-foreground border border-white/[0.06] cursor-not-allowed'
                : 'bg-accent hover:bg-emerald-400 text-background font-extrabold shadow-accent/20 active:scale-[0.99]'
            }`}
          >
            {isSwapping ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>در حال ارسال تراکنش…</span>
              </>
            ) : (
              <span>{getButtonText()}</span>
            )}
          </button>
        </div>

      </div>

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={!!selectorTarget}
        onClose={() => setSelectorTarget(null)}
        tokens={currentChainTokens}
        selectedToken={selectorTarget === 'from' ? fromToken : toToken}
        onSelectToken={(t) => {
          if (selectorTarget === 'from') {
            if (t.symbol === toToken?.symbol) setToToken(fromToken);
            setFromToken(t);
          } else {
            if (t.symbol === fromToken?.symbol) setFromToken(toToken);
            setToToken(t);
          }
        }}
        chainName={activeChain.toUpperCase()}
        activeChain={activeChain}
        onOpenStarsDesk={() => {
          setSelectorTarget(null);
          setViewMode('stars');
        }}
        getTokenBalance={getTokenBalance}
      />

      {/* Swap Success Modal */}
      {swapResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 text-center space-y-3.5 shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-accentSoft border border-accent/30 flex items-center justify-center mx-auto text-accent">
              <CheckCircle2 size={26} />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">
                {swapResult.isSimulation ? 'مسیر سواپ تأیید شد' : 'تراکنش روی بلاکچین ثبت شد'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {swapResult.isSimulation 
                  ? 'این تراکنش در محیط نمایشی شبیه‌سازی گردید.' 
                  : 'دارایی با موفقیت به کیف‌پول شما واریز گردید.'}
              </p>
            </div>

            {swapResult.txHash && (
              <div className="p-2.5 rounded-xl bg-muted border border-border text-xs font-mono break-all text-muted-foreground">
                کد رهگیری: <span className="text-foreground">{swapResult.txHash}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSwapResult(null)}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-emerald-600 text-background font-bold text-xs transition-all shadow-sm"
            >
              بستن
            </button>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
}
