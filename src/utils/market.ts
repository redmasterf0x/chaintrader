
import { addMinutes, format, subDays, startOfMinute, addDays, addMonths, addYears } from 'date-fns';
import { PriceData, OptionContract, TimeFrame } from '../types';

// Simple Black-Scholes approximation for mock data
function calculateOptionPrice(
  type: 'CALL' | 'PUT',
  S: number, // Stock price
  K: number, // Strike price
  T: number, // Time to expiry (years)
  r: number = 0.05, // Risk-free rate
  sigma: number = 0.3 // Volatility
): number {
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const normalCDF = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302745))));
    return x > 0 ? 1 - p : p;
  };

  if (type === 'CALL') {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}

// Simple pseudo-random generator seeded by string
function createRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = h * 1664525 + 1013904223 | 0;
    return (h >>> 0) / 4294967296;
  };
}

export function generateStockData(symbol: string, timeframe: TimeFrame, count: number = 100): PriceData[] {
  const rng = createRandom(symbol + timeframe);
  let price = symbol === 'SPY' ? 510 : symbol === 'TSLA' ? 175 : 150;
  
  // Adjust base price slightly based on symbol to make them different
  const symbolSeed = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  price += (symbolSeed % 20) - 10;

  const data: PriceData[] = [];
  const now = new Date();
  
  // Pre-generate the walk so it's stable
  const walk: number[] = [];
  let currentPrice = price;
  for (let i = 0; i <= count; i++) {
    const volatility = timeframe === '1D' ? 0.001 : 0.005;
    const change = (rng() - 0.5) * (currentPrice * volatility);
    currentPrice += change;
    walk.push(currentPrice);
  }

  for (let i = count; i >= 0; i--) {
    let timeStr: string;
    let date: Date;

    switch (timeframe) {
      case '1D':
        date = addMinutes(startOfMinute(now), -i * 5);
        timeStr = format(date, 'HH:mm');
        break;
      case '1W':
        date = addDays(now, -i);
        timeStr = format(date, 'MMM dd');
        break;
      case '1M':
        date = addDays(now, -i * 2);
        timeStr = format(date, 'MMM dd');
        break;
      case '3M':
        date = addDays(now, -i * 6);
        timeStr = format(date, 'MMM dd');
        break;
      case '6M':
        date = addDays(now, -i * 12);
        timeStr = format(date, 'MMM dd');
        break;
      case '1Y':
        date = addDays(now, -i * 24);
        timeStr = format(date, 'MMM dd');
        break;
      default:
        date = addMinutes(now, -i * 5);
        timeStr = format(date, 'HH:mm');
    }

    data.push({
      time: timeStr,
      price: parseFloat(walk[count - i].toFixed(2)),
      volume: Math.floor(rng() * 10000) + 5000
    });
  }
  return data;
}

export function generateOptionData(
  contract: OptionContract, 
  stockData: PriceData[], 
  timeframe: string
): PriceData[] {
  // Map stock prices to option prices using BS model
  return stockData.map(d => {
    const daysToExpiry = 7; // Mock fixed expiry for simplicity
    const T = daysToExpiry / 365;
    const optionPrice = calculateOptionPrice(
      contract.type,
      d.price,
      contract.strike,
      T,
      0.05,
      contract.impliedVol
    );
    
    return {
      time: d.time,
      price: parseFloat(optionPrice.toFixed(2)),
      volume: Math.floor(d.volume * 0.1)
    };
  });
}

export function generateOptionChain(stockPrice: number): OptionContract[] {
  const strikes = [];
  const startStrike = Math.floor(stockPrice / 5) * 5 - 15;
  for (let i = 0; i < 7; i++) {
    strikes.push(startStrike + i * 5);
  }

  const chain: OptionContract[] = [];
  strikes.forEach(strike => {
    ['CALL', 'PUT'].forEach(type => {
      const iv = 0.2 + Math.random() * 0.2;
      const price = calculateOptionPrice(type as 'CALL' | 'PUT', stockPrice, strike, 7/365, 0.05, iv);
      chain.push({
        id: `${type}-${strike}-${Math.random().toString(36).substr(2, 5)}`,
        type: type as 'CALL' | 'PUT',
        strike,
        expiry: 'Mar 15 2024',
        bid: parseFloat((price * 0.98).toFixed(2)),
        ask: parseFloat((price * 1.02).toFixed(2)),
        last: parseFloat(price.toFixed(2)),
        change: (Math.random() - 0.5) * 5,
        impliedVol: iv,
        delta: type === 'CALL' ? 0.5 : -0.5,
        gamma: 0.05,
        theta: -0.1,
        vega: 0.2,
        openInterest: Math.floor(Math.random() * 5000)
      });
    });
  });

  return chain;
}
