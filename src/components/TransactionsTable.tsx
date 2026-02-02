import { useState } from 'react';
import { Transaction, TransactionType } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, FileText, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TransactionForm } from './TransactionForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface TransactionsTableProps {
  transactions: Transaction[];
  currentGoldBalance: number;
  onAddBuy: (data: { date: string; price: number; quantity: number; notes: string }) => void;
  onAddSell: (data: { date: string; price: number; quantity: number; notes: string }) => void;
  onUpdateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDeleteTransaction: (id: string) => void;
}

const formatMYR = (value: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const TransactionsTable = ({
  transactions,
  currentGoldBalance,
  onAddBuy,
  onAddSell,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsTableProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('buy');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const handleAddBuy = () => {
    setEditingTransaction(null);
    setFormType('buy');
    setFormOpen(true);
  };

  const handleAddSell = () => {
    setEditingTransaction(null);
    setFormType('sell');
    setFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleFormSubmit = (data: { date: string; price: number; quantity: number; notes: string }) => {
    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, data);
    } else if (formType === 'buy') {
      onAddBuy(data);
    } else {
      onAddSell(data);
    }
    setEditingTransaction(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  return (
    <>
      <Card className="border animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gold/10">
                <FileText className="h-4 w-4 text-gold" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
                <p className="text-xs text-muted-foreground">{transactions.length} transactions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddBuy}
                variant="outline"
                className="border-success/50 text-success hover:bg-success/10"
              >
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Buy Gold
              </Button>
              <Button
                onClick={handleAddSell}
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                disabled={currentGoldBalance <= 0}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Sell Gold
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead className="text-right">Price (RM/g)</TableHead>
                    <TableHead className="text-right">Qty (g)</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                    <TableHead className="w-[150px]">Notes</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => {
                    const totalValue = tx.price * tx.quantity;
                    const isBuy = tx.type === 'buy';

                    return (
                      <TableRow
                        key={tx.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          {format(parseISO(tx.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              isBuy
                                ? "border-success/50 text-success bg-success/10"
                                : "border-destructive/50 text-destructive bg-destructive/10"
                            )}
                          >
                            {isBuy ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {isBuy ? 'BUY' : 'SELL'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {tx.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {tx.quantity.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMYR(totalValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.type === 'sell' && tx.profitLoss !== undefined ? (
                            <span
                              className={cn(
                                "font-mono font-medium px-2 py-1 rounded-md text-sm",
                                tx.profitLoss >= 0 ? 'bg-profit text-success' : 'bg-loss text-destructive'
                              )}
                            >
                              {tx.profitLoss >= 0 ? '+' : ''}{formatMYR(tx.profitLoss)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">
                          {tx.notes || '—'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(tx)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(tx)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {transactions.map((tx, index) => {
              const totalValue = tx.price * tx.quantity;
              const isBuy = tx.type === 'buy';

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-lg border bg-card animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            isBuy
                              ? "border-success/50 text-success bg-success/10"
                              : "border-destructive/50 text-destructive bg-destructive/10"
                          )}
                        >
                          {isBuy ? 'BUY' : 'SELL'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(tx.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm font-mono">{tx.quantity.toFixed(4)}g @ {formatMYR(tx.price)}/g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {tx.type === 'sell' && tx.profitLoss !== undefined && (
                        <span
                          className={cn(
                            "font-mono font-medium px-2 py-1 rounded-md text-sm",
                            tx.profitLoss >= 0 ? 'bg-profit text-success' : 'bg-loss text-destructive'
                          )}
                        >
                          {tx.profitLoss >= 0 ? '+' : ''}{formatMYR(tx.profitLoss)}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tx)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(tx)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-mono">{formatMYR(totalValue)}</p>
                    </div>
                    {tx.type === 'sell' && tx.averageCostAtSale !== undefined && (
                      <div>
                        <p className="text-muted-foreground">Avg Cost</p>
                        <p className="font-mono">{formatMYR(tx.averageCostAtSale)}/g</p>
                      </div>
                    )}
                  </div>
                  {tx.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{tx.notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          {transactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-medium mb-1">No transactions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by buying some gold
              </p>
              <Button
                onClick={handleAddBuy}
                className="gold-gradient text-gold-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buy Gold
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        transaction={editingTransaction}
        transactionType={formType}
        currentGoldBalance={currentGoldBalance}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This may affect your gold balance and P/L calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
