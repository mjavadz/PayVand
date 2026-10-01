import React, { useState, useMemo } from 'react';
import { X, Search, Check, Layers, Zap, Shield, Cpu } from 'lucide-react';
import { ChainLogo } from './Icons';
import { CHAINS, CHAIN_CATEGORIES, isEVMChain } from '../config/chains';

export default function ChainSelectorModal({ isOpen, onClose, activeChain, onSelectChain }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const chainList = useMemo(() => Object.values(CHAINS), []);

  const filteredChains = useMemo(() => {
    return chainList.filter(c => {
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'evm' ? isEVMChain(c) : c.category === selectedCategory);
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.nativeSymbol.toLowerCase().includes(q) ||
        c.mainDex.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [chainList, selectedCategory, search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#12141a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-foreground">انتخاب شبکه مبادله</h3>
            <p className="text-xs text-muted-foreground mt-0.5">پوشش ۱۶ بلاکچین دیفای و توکن‌های محرمانه (Privacy Coins) با روتینگ خودکار</p>
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

        {/* Search Bar & Wrap Category Pills (No horizontal scrolling) */}
        <div className="p-4 border-b border-white/[0.06] space-y-3">
          <div className="relative">
            <Search size={16} className="absolute right-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی نام شبکه، نماد یا دکس (بیس، آربیتروم، یونی‌سواپ...)"
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

          {/* Category Filter Pills - Flex-wrap to eliminate horizontal scrolling */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {CHAIN_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent/20 text-accent border border-accent/40 shadow-sm'
                    : 'bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chain List - Vertical only (overflow-x-hidden) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 divide-y divide-white/[0.02]">
          {filteredChains.length > 0 ? (
            filteredChains.map((chain) => {
              const isSelected = chain.id === activeChain;
              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => {
                    onSelectChain(chain.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-right group ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/30'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ChainLogo chainId={chain.id} size={24} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {chain.name}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground border border-white/[0.08]">
                          {chain.nativeSymbol}
                        </span>
                        {isSelected && (
                          <span className="flex items-center text-accent text-xs">
                            <Check size={14} className="stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{chain.mainDex}</span>
                        <span>•</span>
                        <span className="text-[11px] text-accent/80 font-mono" dir="ltr">{chain.defaultGas}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    {isSelected ? (
                      <span className="text-xs text-accent font-bold px-2 py-1 rounded-lg bg-accent/15 border border-accent/20">
                        فعال
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
                        انتخاب ➔
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-muted-foreground">
              شبکه‌ای با این مشخصات یافت نشد.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-muted-foreground">
          <span>روتر غیرحضانتی هوشمند JSWAP</span>
          <span className="text-accent font-mono font-medium">۱۶ شبکه وب۳</span>
        </div>
      </div>
    </div>
  );
}
