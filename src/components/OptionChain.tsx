
import React, { useState } from 'react';
import { OptionContract } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, Calendar } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ExpiryDate {
  date: string;
  daysToExpiry: number;
}

const MOCK_EXPIRIES: ExpiryDate[] = [
  { date: format(addDays(new Date(), 4), 'MMM dd yyyy'), daysToExpiry: 4 },
  { date: format(addDays(new Date(), 11), 'MMM dd yyyy'), daysToExpiry: 11 },
  { date: format(addDays(new Date(), 18), 'MMM dd yyyy'), daysToExpiry: 18 },
  { date: format(addDays(new Date(), 25), 'MMM dd yyyy'), daysToExpiry: 25 },
  { date: format(addDays(new Date(), 39), 'MMM dd yyyy'), daysToExpiry: 39 },
  { date: format(addDays(new Date(), 67), 'MMM dd yyyy'), daysToExpiry: 67 },
  { date: format(addDays(new Date(), 95), 'MMM dd yyyy'), daysToExpiry: 95 },
];

interface OptionChainProps {
  chain: OptionContract[];
  selectedId?: string;
  onSelect: (contract: OptionContract) => void;
  currentPrice?: number;
  isSellMode: boolean;
  onModeChange: (isSell: boolean) => void;
}

export const OptionChain: React.FC<OptionChainProps> = ({ 
  chain, 
  selectedId, 
  onSelect, 
  currentPrice,
  isSellMode,
  onModeChange
}) => {
  const [view, setView] = useState<'DATES' | 'CHAIN'>('DATES');
  const [selectedDate, setSelectedDate] = useState<ExpiryDate | null>(null);

  const calls = chain.filter(c => c.type === 'CALL');
  const puts = chain.filter(c => c.type === 'PUT');

  const handleDateSelect = (expiry: ExpiryDate) => {
    setSelectedDate(expiry);
    setView('CHAIN');
  };

  const handleBack = () => {
    setView('DATES');
    setSelectedDate(null);
  };

  if (view === 'DATES') {
    return (
      <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="bg-neutral-900/50 border-b border-neutral-800 py-3 px-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <Calendar size={12} />
            Expiration Dates
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {MOCK_EXPIRIES.map((expiry) => (
            <button
              key={expiry.date}
              onClick={() => handleDateSelect(expiry)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-neutral-900/30 border border-neutral-800/50 hover:border-emerald-500/50 hover:bg-neutral-900/50 transition-all group"
            >
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                  {expiry.date}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Weekly Expiration
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-neutral-400">
                  {expiry.daysToExpiry} days
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-neutral-900/50 border-b border-neutral-800 py-2 px-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Selected Expiry</span>
            <span className="text-xs font-bold text-emerald-400">{selectedDate?.date}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900/80 px-2 py-1 rounded-md border border-neutral-800">
          <span className={cn(
            "text-[9px] font-mono uppercase tracking-tighter transition-colors",
            isSellMode ? "text-neutral-500" : "text-emerald-400 font-bold"
          )}>
            Buy (Long)
          </span>
          <button
            onClick={() => onModeChange(!isSellMode)}
            className={cn(
              "relative inline-flex h-4 w-8 items-center rounded-full transition-all focus:outline-none",
              isSellMode ? "bg-amber-600" : "bg-neutral-700"
            )}
          >
            <span
              className={cn(
                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                isSellMode ? "translate-x-4" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn(
            "text-[9px] font-mono uppercase tracking-tighter transition-colors",
            isSellMode ? "text-amber-400 font-bold" : "text-neutral-500"
          )}>
            Sell (Covered/Secure)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-11 text-[10px] font-mono text-neutral-500 uppercase tracking-tighter border-b border-neutral-800 bg-neutral-900/30 py-2 px-2">
        <div className="col-span-1">Bid</div>
        <div className="col-span-1">Ask</div>
        <div className="col-span-1">Delta</div>
        <div className="col-span-2 text-center">Calls</div>
        <div className="col-span-1 text-center font-bold text-neutral-300">Strike</div>
        <div className="col-span-2 text-center">Puts</div>
        <div className="col-span-1 text-right">Delta</div>
        <div className="col-span-1 text-right">Bid</div>
        <div className="col-span-1 text-right">Ask</div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {calls.map((call, idx) => {
          const put = puts.find(p => p.strike === call.strike);
          if (!put) return null;

          const prevCall = idx > 0 ? calls[idx - 1] : null;
          const showStrikeLine = currentPrice && (
            (idx === 0 && currentPrice < call.strike) ||
            (prevCall && currentPrice >= prevCall.strike && currentPrice < call.strike)
          );

          return (
            <React.Fragment key={call.strike}>
              {showStrikeLine && (
                <div className="relative h-6 flex items-center justify-center my-1">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-emerald-500"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                      Price: ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-11 border-b border-neutral-900 hover:bg-neutral-900/30 transition-colors group">
                {/* Call Side */}
                <button 
                  onClick={() => onSelect(call)}
                  className={cn(
                    "col-span-5 grid grid-cols-5 py-2 px-2 text-[11px] font-mono transition-colors",
                    selectedId === call.id 
                      ? (isSellMode ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400") 
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <div className="col-span-1">{call.bid.toFixed(2)}</div>
                  <div className="col-span-1">{call.ask.toFixed(2)}</div>
                  <div className="col-span-1">{call.delta.toFixed(2)}</div>
                  <div className="col-span-2 text-right opacity-50 group-hover:opacity-100">
                    {isSellMode ? 'SELL' : 'CALL'}
                  </div>
                </button>

                {/* Strike */}
                <div className="col-span-1 flex items-center justify-center bg-neutral-900/20 text-[11px] font-bold text-neutral-300 border-x border-neutral-800">
                  {call.strike}
                </div>

                {/* Put Side */}
                <button 
                  onClick={() => onSelect(put)}
                  className={cn(
                    "col-span-5 grid grid-cols-5 py-2 px-2 text-[11px] font-mono transition-colors",
                    selectedId === put.id 
                      ? (isSellMode ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400") 
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <div className="col-span-2 text-left opacity-50 group-hover:opacity-100">
                    {isSellMode ? 'SELL' : 'PUT'}
                  </div>
                  <div className="col-span-1 text-right">{put.delta.toFixed(2)}</div>
                  <div className="col-span-1 text-right">{put.bid.toFixed(2)}</div>
                  <div className="col-span-1 text-right">{put.ask.toFixed(2)}</div>
                </button>
              </div>
              {idx === calls.length - 1 && currentPrice && currentPrice >= call.strike && (
                <div className="relative h-6 flex items-center justify-center my-1">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-emerald-500"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                      Price: ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
