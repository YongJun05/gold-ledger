import { useTrades } from '@/hooks/useTrades';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SummaryCards } from '@/components/SummaryCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { Button } from '@/components/ui/button';
import { Download, Coins, Upload, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

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
    exportToJSON,
    importFromJSON,
  } = useTrades();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWarning, setShowWarning] = useState(true);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importFromJSON(file);
    
    if (result.success) {
      toast({
        title: 'Success!',
        description: `${result.count} transactions restored from backup`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Save className="h-4 w-4 mr-2" />
                  Backup
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {transactions.length > 0 && (
                  <>
                    <DropdownMenuItem onClick={exportToJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup (.json)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Data Loss Warning */}
        {showWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important: Data Stored Locally</AlertTitle>
            <AlertDescription className="flex items-start justify-between gap-4">
              <span>
                Your data is stored only in your browser. If you clear browser data or use a different device, all transactions will be lost. 
                <strong className="block mt-1">Please download backups regularly, and download JSON FILES for restoration</strong>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWarning(false)}
                className="shrink-0 h-auto p-1 hover:bg-transparent"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

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

        {/* Mobile Backup Menu */}
        <div className="sm:hidden space-y-2">
          {transactions.length > 0 && (
            <Button variant="outline" onClick={exportToJSON} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Backup
            </Button>
          )}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Restore Backup
          </Button>
        </div>
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
