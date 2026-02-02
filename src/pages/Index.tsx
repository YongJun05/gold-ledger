import { useTrades } from '@/hooks/useTrades';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SummaryCards } from '@/components/SummaryCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { Button } from '@/components/ui/button';
import { Download, Coins } from 'lucide-react';

const Index = () => {
  const {
    transactions,
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
  } = useTrades();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gold-gradient shadow-gold">
              <Coins className="h-5 w-5 text-gold-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Gold Notebook</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">MYR Trading Journal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Charts and Table Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PerformanceChart
            data={chartData}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />
          <div className="lg:hidden">
            <TransactionsTable
              transactions={transactions}
              currentGoldBalance={currentGoldBalance}
              onAddBuy={addBuyTransaction}
              onAddSell={addSellTransaction}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
          <div className="hidden lg:block">
            {/* Empty space on desktop - table spans full width below */}
          </div>
        </div>

        {/* Transactions Table - Full Width on Desktop */}
        <div className="hidden lg:block">
          <TransactionsTable
            transactions={transactions}
            currentGoldBalance={currentGoldBalance}
            onAddBuy={addBuyTransaction}
            onAddSell={addSellTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        </div>

        {/* Mobile Export Button */}
        {transactions.length > 0 && (
          <div className="sm:hidden">
            <Button variant="outline" onClick={exportToCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Gold Trading Notebook • Manual Entry • No API Required</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
