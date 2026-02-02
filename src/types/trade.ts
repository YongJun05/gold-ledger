export type TransactionType = 'buy' | 'sell';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  price: number; // MYR per gram
  quantity: number; // grams
  notes: string;
  createdAt: string;
  // For sell transactions, store the average cost at time of sale for P&L calculation
  averageCostAtSale?: number;
  profitLoss?: number;
}

export interface GoldSummary {
  currentBalance: number; // grams
  averageBuyPrice: number; // MYR per gram
  totalInvested: number; // MYR (current value of holdings at cost)
  totalRealizedProfitLoss: number; // MYR
  totalBuyTransactions: number;
  totalSellTransactions: number;
}

export type TimeFilter = '1D' | '1W' | '1M' | '1Y' | 'ALL';

export interface ChartDataPoint {
  date: string;
  goldBalance: number;
  cumulativeProfitLoss: number;
}
