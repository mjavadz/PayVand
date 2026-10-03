import React, { useState, useMemo } from 'react';
import { X, Search, Check, AlertCircle, Sparkles } from 'lucide-react';
import { TokenLogo } from '../Icons';
import { getTokenPrice } from '../../services/priceService';
import { formatToman } from '../../utils/format';

export default function TokenSelectorModal({ 
  isOpen, 
  onClose, 
  tokens = [], 
  selectedToken, 
  onSelectToken,
  chainName = '',
  getTokenBalance
}) {
  const [search, setSearch] = useState('');

  // Common/popular tokens on this chain for quick 1-click selection
  const quickTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    // Prioritize native, then USDT, USDC, WBTC
    const popularSymbols = ['ETH', 'SOL', 'TON', 'TRX', 'BNB', 'AVAX', 'POL', 'SUI', 'APT', 'USDT', 'USDC', 'WBTC'];
    const sorted = [...tokens].sort((a, b) => {
      const idxA = popularSymbols.indexOf(a.symbol.toUpperCase());
      const idxB = popularSymbols.indexOf(b.symbol.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return sorted.slice(0, 5);
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(t => 
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.address && t.address.toLowerCase().includes(q))
    );
  }, [tokens, search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#12141a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">انتخاب توکن</h3>
            {chainName && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-muted-foreground font-semibold">
                {chainName}
              </span>
            )}
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/[0.06] space-y-3">
          <div className="relative">
            <Search size={16} className="absolute right-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="جستجو با نماد یا نام توکن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-9 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/60 focus:bg-white/[0.07] transition-all font-sans"
              autoFocus
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Select Popular Tokens (No horizontal scroll: flex-wrap) */}
          {quickTokens.length > 0 && !search && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quickTokens.map(tok => {
                const isSelected = selectedToken?.symbol === tok.symbol;
                return (
                  <button
                    key={tok.symbol}
                    type="button"
                    onClick={() => {
                      onSelectToken(tok);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-accent/20 border border-accent/50 text-accent shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-foreground'
                    }`}
                  >
                    <TokenLogo symbol={tok.symbol} size={18} />
                    <span>{tok.symbol}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tokens List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 divide-y divide-white/[0.02]">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const isSelected = selectedToken?.symbol === token.symbol;
              const livePrice = getTokenPrice(token.symbol) || token.priceUSD || 1;
              const userBalance = getTokenBalance ? getTokenBalance(token.symbol) : '0.00';

              return (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    onSelectToken(token);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-right group ${
                    isSelected 
                      ? 'bg-accent/10 border border-accent/30' 
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {/* Right side (RTL): Token Logo & Symbol/Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <TokenLogo symbol={token.symbol} size={30} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-foreground">
                          {token.symbol}
                        </span>
                        {token.isNative && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/15 text-accent font-semibold border border-accent/20">
                            کوین اصلی
                          </span>
                        )}
                        {token.censorshipResistant && !token.isNative && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
                            ضد فریز
                          </span>
                        )}
                        {token.freezable && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400/90 font-medium border border-amber-500/20">
                            تابع فریز
                          </span>
                        )}
                        {isSelected && (
                          <span className="flex items-center text-accent text-xs">
                            <Check size={14} className="stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block truncate mt-0.5">
                        {token.name}
                      </span>
                    </div>
                  </div>

                  {/* Left side (RTL): User Balance & Live USD Price */}
                  <div className="text-left shrink-0 pl-1">
                    <div className="text-sm font-mono font-bold text-foreground" dir="ltr">
                      {userBalance}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block mt-0.5" dir="ltr">
                      ${livePrice < 0.01 
                        ? livePrice.toFixed(6) 
                        : livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      }
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <AlertCircle size={24} className="mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-sm">توکنی یافت نشد</p>
              <p className="text-muted-foreground/70 text-[11px]">نماد یا آدرس قرارداد را بررسی کنید</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-muted-foreground">
          <span>روتر سواپ چندزنجیره‌ای پیوند (Peyvand)</span>
          <span className="font-mono text-accent/80 font-medium">نقدینگی استخر خودکار</span>
        </div>

      </div>
    </div>
  );
}
