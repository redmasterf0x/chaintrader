
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TradingChart } from './TradingChart';
import { OptionChain } from './OptionChain';
import { TradePanel } from './TradePanel';
import { SymbolSearch } from './SymbolSearch';
import { HighVolumeButton } from './HighVolumeButton';
import { 
  generateStockData, 
  generateOptionChain, 
  generateOptionData 
} from '../utils/market';
import { StockInfo, OptionContract, TimeFrame, PriceData } from '../types';
import { Search, LayoutDashboard, History, Settings, Bell, User } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [symbol, setSymbol] = useState('SPY');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [selectedOption, setSelectedOption] = useState<OptionContract | undefined>();
  const [stockData, setStockData] = useState<PriceData[]>([]);
  const [dailyStockData, setDailyStockData] = useState<PriceData[]>([]);
  const [optionData, setOptionData] = useState<PriceData[]>([]);
  const [optionChain, setOptionChain] = useState<OptionContract[]>([]);
  const [pendingOption, setPendingOption] = useState<{ type: 'CALL' | 'PUT', strike: number } | null>(null);
  const [isSellMode, setIsSellMode] = useState(false);

  const stockInfo: StockInfo = useMemo(() => {
    // Only use dailyStockData for the Buy Box to keep it stable
    if (dailyStockData.length === 0) return { symbol, name: '', price: 0, change: 0, changePercent: 0 };
    
    const first = dailyStockData[0].price;
    const last = dailyStockData[dailyStockData.length - 1].price;
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    return {
      symbol,
      name: symbol === 'SPY' ? 'SPDR S&P 500 ETF Trust' : symbol === 'TSLA' ? 'Tesla, Inc.' : 'Apple Inc.',
      price: last,
      change,
      changePercent
    };
  }, [symbol, dailyStockData]);

  useEffect(() => {
    // Generate daily data once per symbol to keep the Buy Box stable
    const dailyData = generateStockData(symbol, '1D');
    setDailyStockData(dailyData);
  }, [symbol]);

  useEffect(() => {
    const data = generateStockData(symbol, timeframe);
    setStockData(data);

    const newChain = generateOptionChain(data[data.length - 1].price);
    setOptionChain(newChain);

    // If we have a pending option selection from the High Volume list
    if (pendingOption) {
      const contract = newChain.find(c => c.type === pendingOption.type && c.strike === pendingOption.strike);
      if (contract) {
        setSelectedOption(contract);
      } else {
        // If exact strike not found, find closest
        const closest = newChain.reduce((prev, curr) => 
          Math.abs(curr.strike - pendingOption.strike) < Math.abs(prev.strike - pendingOption.strike) ? curr : prev
        );
        setSelectedOption(closest);
      }
      setPendingOption(null);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    if (selectedOption && stockData.length > 0) {
      const isLargeTimeframe = ['1M', '3M', '6M', '1Y'].includes(timeframe);
      
      if (isLargeTimeframe) {
        // Generate 1D data for the option chart even if stock is on a large timeframe
        const oneDayStockData = generateStockData(symbol, '1D');
        setOptionData(generateOptionData(selectedOption, oneDayStockData, '1D'));
      } else {
        setOptionData(generateOptionData(selectedOption, stockData, timeframe));
      }
    } else {
      setOptionData([]);
    }
  }, [selectedOption, stockData, timeframe, symbol]);

  const handleTimeframeChange = (tf: TimeFrame) => {
    setTimeframe(tf);
  };

  const handleHighVolumeSelect = (newSymbol: string, type: 'CALL' | 'PUT', strike: number) => {
    setSymbol(newSymbol);
    setPendingOption({ type, strike });
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 flex flex-col items-center py-6 border-r border-neutral-800 bg-neutral-950">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-10">
          <LayoutDashboard className="text-black" size={24} />
        </div>
        <div className="flex flex-col gap-8 text-neutral-500">
          <button className="hover:text-emerald-400 transition-colors"><Search size={20} /></button>
          <button className="text-emerald-400"><LayoutDashboard size={20} /></button>
          <button className="hover:text-emerald-400 transition-colors"><History size={20} /></button>
          <button className="hover:text-emerald-400 transition-colors"><Bell size={20} /></button>
          <button className="mt-auto hover:text-emerald-400 transition-colors"><Settings size={20} /></button>
          <button className="hover:text-emerald-400 transition-colors mb-4"><User size={20} /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <SymbolSearch value={symbol} onChange={setSymbol} />
            <HighVolumeButton onSelect={handleHighVolumeSelect} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Market Status</p>
              <p className="text-xs font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                OPEN
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-neutral-950">
          <div className="grid grid-cols-12 gap-6 h-full min-h-[800px]">
            {/* Left Column: Panel & Chain */}
            <div className="col-span-4 flex flex-col gap-6">
              <div className="flex-1">
                <TradePanel 
                  stock={stockInfo} 
                  selectedOption={selectedOption} 
                  isSellMode={isSellMode}
                />
              </div>
              <div className="h-[450px]">
                <OptionChain 
                  chain={optionChain} 
                  selectedId={selectedOption?.id}
                  onSelect={setSelectedOption} 
                  currentPrice={stockInfo.price}
                  isSellMode={isSellMode}
                  onModeChange={setIsSellMode}
                />
              </div>
            </div>

            {/* Right Column: Charts */}
            <div className="col-span-8 flex flex-col gap-6">
              <TradingChart 
                data={stockData} 
                title={`${symbol} Underlying`} 
                height={selectedOption ? 280 : 400}
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
              
              <AnimatePresence mode="wait">
                {selectedOption ? (
                  <motion.div
                    key={selectedOption.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TradingChart 
                      data={optionData} 
                      title={`${selectedOption.type} $${selectedOption.strike} - ${selectedOption.expiry} (${['1M', '3M', '6M', '1Y'].includes(timeframe) ? '1D View' : timeframe})`} 
                      color="#8b5cf6" 
                      height={280}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-neutral-600 bg-neutral-900/10 min-h-[280px]"
                  >
                    <LayoutDashboard size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-mono">Select an option from the chain to view its chart</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
