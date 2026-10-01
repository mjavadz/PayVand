import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { 
  TonIcon, 
  SolanaIcon, 
  EthereumIcon, 
  TronIcon,
  BnbIcon,
  ArbitrumIcon,
  PolygonIcon,
  BaseIcon,
  OptimismIcon,
  AvalancheIcon,
  ZkSyncIcon,
  SuiIcon,
  AptosIcon,
  LineaIcon,
  BlastIcon,
  ZcashIcon
} from './Icons';
import { SUPPORTED_CHAINS } from '../data/tokens';

export default function NetworkDropdown({ activeChain, onSelectChain }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const getChainIcon = (id, size = 18) => {
    switch (id) {
      case 'ton': return <TonIcon size={size} />;
      case 'solana': return <SolanaIcon size={size} />;
      case 'ethereum': return <EthereumIcon size={size} />;
      case 'tron': return <TronIcon size={size} />;
      case 'bsc': return <BnbIcon size={size} />;
      case 'arbitrum': return <ArbitrumIcon size={size} />;
      case 'polygon': return <PolygonIcon size={size} />;
      case 'base': return <BaseIcon size={size} />;
      case 'optimism': return <OptimismIcon size={size} />;
      case 'avalanche': return <AvalancheIcon size={size} />;
      case 'zksync': return <ZkSyncIcon size={size} />;
      case 'sui': return <SuiIcon size={size} />;
      case 'aptos': return <AptosIcon size={size} />;
      case 'linea': return <LineaIcon size={size} />;
      case 'blast': return <BlastIcon size={size} />;
      case 'zcash': return <ZcashIcon size={size} />;
      default: return <EthereumIcon size={size} />;
    }
  };

  const activeChainObj = SUPPORTED_CHAINS.find(c => c.id === activeChain) || SUPPORTED_CHAINS[0];

  const filteredChains = SUPPORTED_CHAINS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.mainDex?.toLowerCase().includes(search.toLowerCase()) ||
    c.nativeSymbol.toLowerCase().includes(search.toLowerCase())
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-right w-full max-w-sm mx-auto" ref={dropdownRef}>
      
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-accent/40 transition-all text-xs font-semibold text-fg shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="shrink-0">{getChainIcon(activeChainObj.id, 18)}</div>
          <span className="truncate">{activeChainObj.name}</span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 hidden sm:inline">
            {activeChainObj.mainDex}
          </span>
        </div>

        <ChevronDown 
          size={16} 
          className={`text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2 space-y-1.5 animate-fade-in">
          
          {/* Search box for 15+ chains */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی شبکه (یونی‌سواپ، بیس، سولانا...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-card border border-border text-xs text-fg placeholder-fgSubtle focus:outline-none focus:border-accent font-sans"
              autoFocus
            />
            <Search size={14} className="absolute right-2.5 top-2 text-zinc-500" />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-white/[0.04] pt-1">
            {filteredChains.length > 0 ? (
              filteredChains.map((ch) => {
                const isSelected = ch.id === activeChain;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      onSelectChain(ch.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all pt-1.5 ${
                      isSelected 
                        ? 'bg-accentSoft text-accent font-bold' 
                        : 'text-fgMuted hover:text-fg hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="shrink-0">{getChainIcon(ch.id, 18)}</div>
                      <div className="text-right truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{ch.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-emerald-400 font-mono">دکس اصلی: {ch.mainDex}</span>
                          <span className="text-[10px] text-zinc-500 hidden sm:inline">• {ch.badge}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-emerald-400 shrink-0 mr-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-zinc-500">
                شبکه‌ای با این مشخصات یافت نشد.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
