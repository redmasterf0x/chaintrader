
import React from 'react';
import { OptionContract, StockInfo } from '../types';
import { TrendingUp, TrendingDown, ShieldCheck, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TradePanelProps {
  stock: StockInfo;
  selectedOption?: OptionContract;
  isSellMode: boolean;
}

export const TradePanel: React.FC<TradePanelProps> = ({ stock, selectedOption, isSellMode }) => {
  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-mono">{stock.symbol}</h2>
          <p className="text-xs text-neutral-500">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Daily Price</p>
          <p className="text-xl font-mono">${stock.price.toFixed(2)}</p>
          <p className={`text-xs font-mono ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedOption?.type === 'PUT' ? (
          <div className={cn(
            "p-4 rounded-xl bg-neutral-900 border transition-all cursor-pointer group",
            isSellMode ? "border-amber-500/50 hover:bg-neutral-900/80" : "border-neutral-800 hover:border-emerald-500/50"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-widest font-bold",
                isSellMode ? "text-amber-500" : "text-neutral-500"
              )}>
                Underlying Cash Hold
              </span>
              {isSellMode ? <ShieldCheck size={14} className="text-amber-500" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-lg text-black shadow-lg",
                isSellMode ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
              )}>
                <TrendingDown size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {isSellMode ? "Deposit Liquid for Secured Put" : "Cash Reserved for Put"}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">Cash Collateral • 100 Shares</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-neutral-400">Req. Cash</p>
                <p className={cn(
                  "text-sm font-mono font-bold",
                  isSellMode ? "text-amber-400" : "text-emerald-400"
                )}>
                  ${(selectedOption.strike * 100).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Equity Execution</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
                <TrendingUp size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Buy Underlying Stock</p>
                <p className="text-[10px] text-neutral-500 font-mono">Market Order • 100 Shares</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-neutral-400">Est. Cost</p>
                <p className="text-sm font-mono font-bold">${(stock.price * 100).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {!selectedOption && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4 opacity-50">
              <ShieldCheck size={24} className="text-neutral-500" />
            </div>
            <p className="text-xs text-neutral-500 font-mono text-center leading-relaxed">
              Select a contract from the chain to enable options execution modules
            </p>
          </div>
        )}
      </div>

      {selectedOption && (
        <div className="mt-auto pt-6 border-t border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-neutral-500">
                {isSellMode ? 'Selling Contract' : 'Buying Contract'}
              </span>
              <span className={cn(
                "text-sm font-bold",
                isSellMode ? "text-amber-400" : "text-emerald-400"
              )}>
                {selectedOption.type} ${selectedOption.strike} - {selectedOption.expiry}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase font-mono">Premium</p>
              <p className="text-lg font-mono font-bold">${selectedOption.bid.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-900/50 p-2 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">Delta</p>
              <p className="text-sm font-mono">{selectedOption.delta.toFixed(3)}</p>
            </div>
            <div className="bg-neutral-900/50 p-2 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">IV</p>
              <p className="text-sm font-mono">{(selectedOption.impliedVol * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-neutral-900/50 p-2 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">Theta</p>
              <p className="text-sm font-mono">{selectedOption.theta.toFixed(3)}</p>
            </div>
            <div className="bg-neutral-900/50 p-2 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">Vega</p>
              <p className="text-sm font-mono">{selectedOption.vega.toFixed(3)}</p>
            </div>
          </div>

          <button className={cn(
            "w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]",
            isSellMode 
              ? "bg-amber-500 hover:bg-amber-400 text-black" 
              : "bg-emerald-500 hover:bg-emerald-400 text-black"
          )}>
            <Zap size={18} />
            {isSellMode ? `Sell ${selectedOption.type}` : `Buy ${selectedOption.type}`}
          </button>
        </div>
      )}
    </div>
  );
};
