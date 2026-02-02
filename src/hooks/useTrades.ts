import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trade, TradeSummary, TimeFilter, ChartDataPoint } from '@/types/trade';
import { subDays, subWeeks, subMonths, subYears, parseISO, isAfter, startOfDay } from 'date-fns';

const STORAGE_KEY = 'gold-trades';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const loadTrades = (): Trade[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTrades = (trades: Trade[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1M');

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const addTrade = useCallback((trade: Omit<Trade, 'id' | 'createdAt'>) => {
    const newTrade: Trade = {
      ...trade,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Omit<Trade, 'id' | 'createdAt'>>) => {
    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === id ? { ...trade, ...updates } : trade
      )
    );
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
  }, []);

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [trades]);

  const filteredTrades = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeFilter) {
      case '1D':
        cutoffDate = subDays(now, 1);
        break;
      case '1W':
        cutoffDate = subWeeks(now, 1);
        break;
      case '1M':
        cutoffDate = subMonths(now, 1);
        break;
      case '1Y':
        cutoffDate = subYears(now, 1);
        break;
      case 'ALL':
      default:
        return sortedTrades;
    }

    return sortedTrades.filter((trade) =>
      isAfter(parseISO(trade.date), startOfDay(cutoffDate))
    );
  }, [sortedTrades, timeFilter]);

  const summary = useMemo((): TradeSummary => {
    let totalProfit = 0;
    let totalInvested = 0;
    let totalSold = 0;
    let winCount = 0;
    let lossCount = 0;
    let openPositions = 0;

    sortedTrades.forEach((trade) => {
      const buyValue = trade.buyPrice * trade.quantity;
      totalInvested += buyValue;

      if (trade.sellPrice !== null) {
        const sellValue = trade.sellPrice * trade.quantity;
        const profit = sellValue - buyValue;
        totalSold += sellValue;
        totalProfit += profit;

        if (profit > 0) {
          winCount++;
        } else if (profit < 0) {
          lossCount++;
        }
      } else {
        openPositions++;
      }
    });

    return {
      totalProfit,
      totalInvested,
      totalSold,
      winCount,
      lossCount,
      openPositions,
    };
  }, [sortedTrades]);

  const chartData = useMemo((): ChartDataPoint[] => {
    const closedTrades = filteredTrades
      .filter((trade) => trade.sellPrice !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulative = 0;
    return closedTrades.map((trade) => {
      const profitLoss = (trade.sellPrice! - trade.buyPrice) * trade.quantity;
      cumulative += profitLoss;
      return {
        date: trade.date,
        profitLoss,
        cumulativeProfit: cumulative,
        buyPrice: trade.buyPrice,
      };
    });
  }, [filteredTrades]);

  const calculateProfitLoss = useCallback((trade: Trade): number | null => {
    if (trade.sellPrice === null) return null;
    return (trade.sellPrice - trade.buyPrice) * trade.quantity;
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Buy Price (RM)', 'Sell Price (RM)', 'Quantity (g)', 'Total Buy (RM)', 'Total Sell (RM)', 'Profit/Loss (RM)', 'Notes'];
    const rows = sortedTrades.map((trade) => {
      const totalBuy = trade.buyPrice * trade.quantity;
      const totalSell = trade.sellPrice !== null ? trade.sellPrice * trade.quantity : '';
      const profitLoss = trade.sellPrice !== null ? (trade.sellPrice - trade.buyPrice) * trade.quantity : '';
      return [
        trade.date,
        trade.buyPrice.toFixed(2),
        trade.sellPrice?.toFixed(2) ?? '',
        trade.quantity.toFixed(4),
        totalBuy.toFixed(2),
        totalSell !== '' ? totalSell.toFixed(2) : '',
        profitLoss !== '' ? profitLoss.toFixed(2) : '',
        `"${trade.notes.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedTrades]);

  return {
    trades: sortedTrades,
    filteredTrades,
    summary,
    chartData,
    timeFilter,
    setTimeFilter,
    addTrade,
    updateTrade,
    deleteTrade,
    calculateProfitLoss,
    exportToCSV,
  };
};
