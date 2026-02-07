import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, GoldSummary, TimeFilter, ChartDataPoint } from '@/types/trade';
import { subDays, subWeeks, subMonths, subYears, parseISO, isAfter, startOfDay } from 'date-fns';

const STORAGE_KEY = 'gold-transactions';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const useTrades = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1M');

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // If same date, sort by createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [transactions]);

  // Calculate summary using chronological order for accurate average cost
  const summary = useMemo((): GoldSummary => {
    // Process in chronological order for accurate tracking
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let currentBalance = 0;
    let totalCost = 0; // Total cost of current holdings
    let totalRealizedProfitLoss = 0;
    let totalBuyTransactions = 0;
    let totalSellTransactions = 0;
    let totalMoneySpentOnBuys = 0; // Total money spent on all buy transactions

    chronological.forEach((tx) => {
      if (tx.type === 'buy') {
        const buyAmount = tx.price * tx.quantity;
        totalCost += buyAmount;
        totalMoneySpentOnBuys += buyAmount; // Track all money spent on buys
        currentBalance += tx.quantity;
        totalBuyTransactions++;
      } else if (tx.type === 'sell') {
        // Use stored P&L if available, otherwise calculate
        if (tx.profitLoss !== undefined) {
          totalRealizedProfitLoss += tx.profitLoss;
        }
        // Reduce holdings at average cost
        if (currentBalance > 0) {
          const avgCost = totalCost / currentBalance;
          const costReduction = avgCost * tx.quantity;
          totalCost = Math.max(0, totalCost - costReduction);
        }
        currentBalance = Math.max(0, currentBalance - tx.quantity);
        totalSellTransactions++;
      }
    });

    const averageBuyPrice = currentBalance > 0 ? totalCost / currentBalance : 0;

    return {
      currentBalance,
      averageBuyPrice,
      totalInvested: totalMoneySpentOnBuys,
      totalRealizedProfitLoss,
      totalBuyTransactions,
      totalSellTransactions,
    };
  }, [transactions]);

  // Calculate current gold balance (for validation)
  const currentGoldBalance = useMemo(() => {
    return summary.currentBalance;
  }, [summary]);

  // Calculate average cost at any point (for sell transactions)
  const calculateAverageCost = useCallback((): number => {
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let balance = 0;
    let totalCost = 0;

    chronological.forEach((tx) => {
      if (tx.type === 'buy') {
        totalCost += tx.price * tx.quantity;
        balance += tx.quantity;
      } else if (tx.type === 'sell') {
        if (balance > 0) {
          const avgCost = totalCost / balance;
          totalCost -= avgCost * tx.quantity;
        }
        balance = Math.max(0, balance - tx.quantity);
      }
    });

    return balance > 0 ? totalCost / balance : 0;
  }, [transactions]);

  const addBuyTransaction = useCallback((data: { date: string; price: number; quantity: number; notes: string }) => {
    const newTransaction: Transaction = {
      id: generateId(),
      date: data.date,
      type: 'buy',
      price: data.price,
      quantity: data.quantity,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, []);

  const addSellTransaction = useCallback((data: { date: string; price: number; quantity: number; notes: string }) => {
    // Calculate P/L at time of sale using average cost
    const avgCost = calculateAverageCost();
    const profitLoss = (data.price - avgCost) * data.quantity;

    const newTransaction: Transaction = {
      id: generateId(),
      date: data.date,
      type: 'sell',
      price: data.price,
      quantity: data.quantity,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      averageCostAtSale: avgCost,
      profitLoss,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, [calculateAverageCost]);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  // Filter transactions by time
  const filteredTransactions = useMemo(() => {
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
        return sortedTransactions;
    }

    return sortedTransactions.filter((tx) =>
      isAfter(parseISO(tx.date), startOfDay(cutoffDate))
    );
  }, [sortedTransactions, timeFilter]);

  // Chart data - gold balance and cumulative P/L over time
  const chartData = useMemo((): ChartDataPoint[] => {
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter by time
    const now = new Date();
    let cutoffDate: Date | null = null;

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
        cutoffDate = null;
    }

    let goldBalance = 0;
    let cumulativeProfitLoss = 0;
    const dataPoints: ChartDataPoint[] = [];

    chronological.forEach((tx) => {
      if (tx.type === 'buy') {
        goldBalance += tx.quantity;
      } else if (tx.type === 'sell') {
        goldBalance = Math.max(0, goldBalance - tx.quantity);
        if (tx.profitLoss !== undefined) {
          cumulativeProfitLoss += tx.profitLoss;
        }
      }

      // Only include data points within the time filter
      if (cutoffDate === null || isAfter(parseISO(tx.date), startOfDay(cutoffDate))) {
        dataPoints.push({
          date: tx.date,
          goldBalance,
          cumulativeProfitLoss,
        });
      }
    });

    return dataPoints;
  }, [transactions, timeFilter]);

  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Type', 'Price (RM/g)', 'Quantity (g)', 'Total Value (RM)', 'P/L (RM)', 'Notes'];
    const rows = sortedTransactions.map((tx) => {
      const totalValue = tx.price * tx.quantity;
      const profitLoss = tx.type === 'sell' && tx.profitLoss !== undefined ? tx.profitLoss.toFixed(2) : '';
      return [
        tx.date,
        tx.type.toUpperCase(),
        tx.price.toFixed(2),
        tx.quantity.toFixed(4),
        totalValue.toFixed(2),
        profitLoss,
        `"${tx.notes.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedTransactions]);

  const exportToJSON = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      transactions: sortedTransactions,
      summary,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedTransactions, summary]);

  const importFromJSON = useCallback((file: File) => {
    return new Promise<{ success: boolean; message: string; count?: number }>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (!data.transactions || !Array.isArray(data.transactions)) {
            resolve({ success: false, message: 'Invalid backup file format' });
            return;
          }

          setTransactions(data.transactions);
          resolve({ 
            success: true, 
            message: 'Backup restored successfully!',
            count: data.transactions.length 
          });
        } catch (error) {
          resolve({ success: false, message: 'Failed to parse backup file' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file' });
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    transactions: sortedTransactions,
    filteredTransactions,
    summary,
    chartData,
    timeFilter,
    setTimeFilter,
    currentGoldBalance,
    addBuyTransaction,
    addSellTransaction,
    updateTransaction,
    deleteTransaction,
    exportToCSV,
    exportToJSON,
    importFromJSON,
  };
};
