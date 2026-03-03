
export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface PriceData {
  time: string;
  price: number;
  volume: number;
}

export interface OptionContract {
  id: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiry: string;
  bid: number;
  ask: number;
  last: number;
  change: number;
  impliedVol: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  openInterest: number;
}

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Strategy {
  name: string;
  description: string;
  type: 'COVERED_CALL' | 'SECURED_PUT' | 'BUY_CALL' | 'BUY_PUT' | 'SELL_CALL' | 'SELL_PUT';
}
