
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PriceData, TimeFrame } from '../types';

interface ChartProps {
  data: PriceData[];
  title: string;
  color?: string;
  height?: number;
  timeframe?: TimeFrame;
  onTimeframeChange?: (tf: TimeFrame) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-2 rounded shadow-xl text-xs">
        <p className="text-neutral-400 mb-1">{label}</p>
        <p className="font-mono text-white">
          Price: <span className="text-emerald-400">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const TradingChart: React.FC<ChartProps> = ({ 
  data, 
  title, 
  color = '#10b981',
  height = 300,
  timeframe,
  onTimeframeChange
}) => {
  const timeframes: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  const firstPrice = data.length > 0 ? data[0].price : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const change = lastPrice - firstPrice;
  const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

  return (
    <div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{title}</h3>
          {data.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-mono font-bold">${lastPrice.toFixed(2)}</span>
              <span className={`text-xs font-mono ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                <span className="ml-1 text-[10px] text-neutral-600 uppercase tracking-tighter">
                  {timeframe || 'Period'}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {onTimeframeChange && (
            <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
              {timeframes.map(tf => (
                <button 
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${timeframe === tf ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
            <span className="text-[10px] font-mono text-neutral-400">Live</span>
          </div>
        </div>
      </div>
      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right"
              tick={{ fontSize: 10, fill: '#525252' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${title})`}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
