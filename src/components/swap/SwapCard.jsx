import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowDownUp, 
  Settings2, 
  ChevronDown, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  EthereumIcon, 
  SolanaIcon, 
  TonIcon, 
  TronIcon, 
  UsdtIcon,
  BnbIcon,
  ArbitrumIcon,
  PolygonIcon,
  TokenLogo
} from '../Icons';
import TokenSelectorModal from './TokenSelectorModal';
import { TOKENS } from '../../data/tokens';
import { getSwapQuote, executeSwap } from '../../services/swapService';
import { useWallet } from '../../context/WalletContext';
import { formatToman } from '../../utils/format';

export default function SwapCard({ onOpenWalletModal, onOpenChainSelector }) {
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
  }, [activeChain]);

  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState(null);

  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState(null);
  const [swapError, setSwapError] = useState(null);

  const fromBalance = getTokenBalance(fromToken?.symbol);
  const toBalance = getTokenBalance(toToken?.symbol);

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

  const renderTokenBadgeIcon = (token) => {
    if (!token) return null;
    return <TokenLogo symbol={token.symbol} size={18} />;
  };

  const getButtonText = () => {
    if (isSwapping) return 'در حال ارسال تراکنش…';
    if (!isConnected) return 'اتصال کیف پول برای سواپ';
    if (!fromAmount || numFromAmount <= 0) return 'مقدار را وارد کنید';
    if (isInsufficientBalance) return `موجودی ناکافی (${fromBalance} ${fromToken?.symbol})`;
    return `سواپ ${fromToken?.symbol} → ${toToken?.symbol}`;
  };

  const isButtonDisabled = isSwapping || (isConnected && (!fromAmount || numFromAmount <= 0 || isInsufficientBalance));

  return (
    <div className="w-full">
      
      {/* Minimal Swap Card */}
      <div className="card card-hover p-4 sm:p-5">
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-fg">سواپ ارز دیجیتال</h2>
            <button
              type="button"
              onClick={onOpenChainSelector}
              className="px-2 py-0.5 rounded-full bg-muted border border-border text-xs text-accent font-semibold hover:border-accent/40 flex items-center gap-1 transition-colors"
              title="تغییر شبکه"
            >
              <span>{activeChainConfig?.name || activeChain.toUpperCase()}</span>
              <ChevronDown size={12} />
            </button>
            {isDemo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                آزمایشی
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-all ${
              showSettings 
                ? 'bg-accentSoft border-accent/30 text-accent' 
                : 'bg-muted border-border text-fgSubtle hover:text-fg'
            }`}
            title="تنظیمات تلرانس (Slippage)"
            aria-label="Slippage settings"
          >
            <Settings2 size={14} />
          </button>
        </div>

        {/* Slippage Settings Drawer */}
        {showSettings && (
          <div className="settings-drawer mb-3 space-y-2">
            <div className="flex items-center justify-between text-fgMuted">
              <span className="font-semibold text-xs">تلرانس قیمت (Slippage):</span>
              <span className="text-accent font-mono font-bold">{slippage}%</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['0.1', '0.5', '1.0'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSlippage(val)}
                  className={`py-1 rounded-md text-xs font-bold transition-all ${
                    slippage === val 
                      ? 'bg-accent text-bg font-extrabold' 
                      : 'bg-muted border border-border text-fgSubtle hover:bg-border hover:text-fg'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <input
                type="text"
                placeholder="سفارشی"
                value={['0.1', '0.5', '1.0'].includes(slippage) ? '' : slippage}
                onChange={(e) => setSlippage(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full text-center py-1 rounded-md bg-muted border border-border text-xs text-fg placeholder-fgSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-bold"
              />
            </div>
          </div>
        )}

        {/* FROM Input */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border focus-within:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-fgSubtle mb-1">
            <span>پرداخت می‌کنید</span>
            <div className="flex items-center gap-1.5">
              <span>موجودی:</span>
              <span className="font-mono text-fg" dir="ltr">{fromBalance}</span>
              {isConnected && numFromBalance > 0 && (
                <button 
                  type="button" 
                  onClick={handleSetMax}
                  className="font-semibold text-accent hover:underline px-1 rounded text-[10px]"
                >
                  حداکثر
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full bg-transparent text-2xl font-bold text-fg placeholder-fgSubtle focus:outline-none font-mono"
              aria-label="مقدار ارسال"
            />

            <button
              type="button"
              onClick={() => setSelectorTarget('from')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border hover:border-accent/40 transition-all shrink-0"
            >
              {renderTokenBadgeIcon(fromToken)}
              <span className="font-bold text-xs text-fg">{fromToken?.symbol || 'انتخاب'}</span>
              <ChevronDown size={12} className="text-fgSubtle" />
            </button>
          </div>

          <div className="mt-1 text-xs text-fgSubtle">
            ≈ {quote ? `$${quote.fromValueUSD} (${formatToman(Math.round(Number(quote.fromValueUSD) * 66000))})` : '$0.00'}
          </div>
        </div>

        {/* Invert Button */}
        <div className="relative my-[-6px] z-10 flex justify-center">
          <button
            type="button"
            onClick={handleInvert}
            className="w-7 h-7 rounded-md bg-card border border-border hover:border-accent/40 text-fgSubtle hover:text-accent flex items-center justify-center transition-all active:scale-95"
            title="جابجایی مبدا و مقصد"
            aria-label="Swap tokens"
          >
            <ArrowDownUp size={12} />
          </button>
        </div>

        {/* TO Output */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border transition-colors">
          <div className="flex items-center justify-between text-xs text-fgSubtle mb-1">
            <span>دریافت می‌کنید</span>
            <div className="flex items-center gap-1.5">
              <span>موجودی:</span>
              <span className="font-mono text-fgMuted" dir="ltr">{toBalance}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              readOnly
              placeholder="0"
              value={quote ? quote.toAmount : ''}
              className="w-full bg-transparent text-2xl font-bold text-accent placeholder-fgSubtle focus:outline-none font-mono"
              aria-label="مقدار دریافت"
            />

            <button
              type="button"
              onClick={() => setSelectorTarget('to')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border hover:border-accent/40 transition-all shrink-0"
            >
              {renderTokenBadgeIcon(toToken)}
              <span className="font-bold text-xs text-fg">{toToken?.symbol || 'انتخاب'}</span>
              <ChevronDown size={12} className="text-fgSubtle" />
            </button>
          </div>

          <div className="mt-1 text-xs text-fgSubtle">
            ≈ {quote ? `$${quote.toValueUSD} (${formatToman(Math.round(Number(quote.toValueUSD) * 66000))})` : '$0.00'}
          </div>
        </div>

        {/* Rate & Route Info */}
        {quote && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-1 text-fgSubtle">
            <div className="flex justify-between items-center">
              <span>نرخ لحظه‌ای:</span>
              <span className="font-mono text-fg" dir="ltr">1 {fromToken?.symbol} = {quote.rate} {toToken?.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>مسیر:</span>
              <span className="text-accent font-semibold">{quote.protocol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>حداقل دریافتی:</span>
              <span className="font-mono text-fgMuted" dir="ltr">{quote.minReceived} {toToken?.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>کارمزد شبکه:</span>
              <span className="font-mono text-fgMuted" dir="ltr">{quote.gasFee.fee} ({quote.gasFee.usd})</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={handlePerformSwap}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
              !isConnected
                ? 'btn-primary'
                : isInsufficientBalance
                ? 'bg-muted/50 text-fgSubtle cursor-not-allowed border border-border/50'
                : !fromAmount || numFromAmount <= 0
                ? 'bg-muted/50 text-fgSubtle cursor-not-allowed border border-border/50'
                : 'btn-primary'
            }`}
          >
            {isSwapping ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>در حال ارسال…</span>
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
        getTokenBalance={getTokenBalance}
      />

      {/* Swap Success Modal */}
      {swapResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-5 text-center space-y-3 shadow-lg animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-accentSoft border border-accent/30 flex items-center justify-center mx-auto text-accent">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-fg">
                {swapResult.isSimulation ? 'مسیر سواپ تأیید شد' : 'تراکنش روی بلاکچین ثبت شد'}
              </h3>
              <p className="text-xs text-fgSubtle mt-0.5">
                {swapResult.isSimulation 
                  ? 'نرخ و مسیر بهینه مسیریابی گردید.' 
                  : 'دارایی با موفقیت به آدرس کیف‌پول شما منتقل گردید.'}
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg border border-border text-xs space-y-1 text-right font-mono" dir="ltr">
              <div className="text-fgSubtle flex justify-between">
                <span className="font-sans">سواپ:</span>
                <span className="text-fg font-bold">{swapResult.fromAmount} {swapResult.fromToken} → {swapResult.toAmount} {swapResult.toToken}</span>
              </div>
              <div className="text-fgSubtle flex justify-between">
                <span className="font-sans">{swapResult.isSimulation ? 'شناسه:' : 'هش:'}</span>
                <span className="text-accent truncate max-w-[160px]">{swapResult.txHash}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={swapResult.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-muted hover:bg-border border border-border text-xs font-bold text-fgMuted flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>اکسپلورر</span>
                <ExternalLink size={10} />
              </a>
              <button
                type="button"
                onClick={() => {
                  setSwapResult(null);
                  setFromAmount('');
                }}
                className="flex-1 py-2 px-3 rounded-lg btn-primary text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}