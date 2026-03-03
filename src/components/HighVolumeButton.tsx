
import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, ChevronDown, Activity } from 'lucide-react';
import { OptionContract } from '../types';

interface HighVolumeOption {
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiry: string;
  volume: string;
  change: number;
}

const HIGH_VOLUME_DATA: HighVolumeOption[] = [
  { symbol: 'TSLA', type: 'CALL', strike: 180, expiry: 'Mar 15 2024', volume: '142.5K', change: 12.4 },
  { symbol: 'NVDA', type: 'CALL', strike: 850, expiry: 'Mar 15 2024', volume: '98.2K', change: -5.2 },
  { symbol: 'SPY', type: 'PUT', strike: 505, expiry: 'Mar 15 2024', volume: '85.1K', change: 2.1 },
  { symbol: 'AAPL', type: 'CALL', strike: 175, expiry: 'Mar 15 2024', volume: '76.4K', change: 0.8 },
  { symbol: 'AMD', type: 'CALL', strike: 210, expiry: 'Mar 15 2024', volume: '65.9K', change: 15.3 },
  { symbol: 'QQQ', type: 'CALL', strike: 445, expiry: 'Mar 15 2024', volume: '54.2K', change: -1.4 },
  { symbol: 'META', type: 'CALL', strike: 500, expiry: 'Mar 15 2024', volume: '48.7K', change: 4.6 },
  { symbol: 'AMZN', type: 'CALL', strike: 180, expiry: 'Mar 15 2024', volume: '42.1K', change: -2.3 },
  { symbol: 'MSFT', type: 'CALL', strike: 420, expiry: 'Mar 15 2024', volume: '38.5K', change: 1.2 },
  { symbol: 'NFLX', type: 'PUT', strike: 600, expiry: 'Mar 15 2024', volume: '31.2K', change: 8.9 },
];

interface HighVolumeButtonProps {
  onSelect: (symbol: string, optionType: 'CALL' | 'PUT', strike: number) => void;
}

export const HighVolumeButton: React.FC<HighVolumeButtonProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-mono font-bold"
      >
        <Activity size={14} />
        High Option Volume
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-950/50">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <BarChart3 size={12} />
              Top 10 by Volume
            </h4>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {HIGH_VOLUME_DATA.map((opt, idx) => (
              <button
                key={`${opt.symbol}-${opt.type}-${opt.strike}-${idx}`}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition-colors text-left border-b border-neutral-800/50 last:border-0 group"
                onClick={() => {
                  onSelect(opt.symbol, opt.type, opt.strike);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white">{opt.symbol}</span>
                    <span className={`text-[9px] px-1 rounded font-mono ${opt.type === 'CALL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {opt.type} ${opt.strike}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">{opt.expiry}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-neutral-300">{opt.volume}</div>
                  <div className={`text-[10px] font-mono ${opt.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {opt.change >= 0 ? '+' : ''}{opt.change}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
