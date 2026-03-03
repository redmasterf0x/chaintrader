
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SymbolOption {
  symbol: string;
  name: string;
  type: string;
}

const POPULAR_SYMBOLS: SymbolOption[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Stock' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'Stock' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'ETF' },
];

interface SymbolSearchProps {
  value: string;
  onChange: (symbol: string) => void;
}

export const SymbolSearch: React.FC<SymbolSearchProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSymbols = POPULAR_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 cursor-pointer hover:border-emerald-500/50 transition-all w-64"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="text-neutral-500" size={16} />
        <span className="flex-1 font-mono text-sm">{value}</span>
        <ChevronDown className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={14} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-neutral-800">
            <input 
              autoFocus
              type="text"
              placeholder="Filter symbols..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map((s) => (
                <button
                  key={s.symbol}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition-colors text-left group"
                  onClick={() => {
                    onChange(s.symbol);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-emerald-400 group-hover:text-emerald-300">{s.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-mono">{s.type}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate w-48">{s.name}</div>
                  </div>
                  <div className="text-[10px] text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-neutral-600 text-xs font-mono">
                No symbols found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
