export interface Trade {
  id: string;
  date: string;
  buyPrice: number;
  sellPrice: number | null;
  quantity: number;
  notes: string;
  createdAt: string;
}

export interface TradeSummary {
  totalProfit: number;
  totalInvested: number;
  totalSold: number;
  winCount: number;
  lossCount: number;
  openPositions: number;
}

export type TimeFilter = '1D' | '1W' | '1M' | '1Y' | 'ALL';

export interface ChartDataPoint {
  date: string;
  profitLoss: number;
  cumulativeProfit: number;
  buyPrice: number;
}
