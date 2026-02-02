import { useState } from 'react';
import { Trade } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, FileText, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TradeForm } from './TradeForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TradesTableProps {
  trades: Trade[];
  onAddTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  onUpdateTrade: (id: string, trade: Partial<Omit<Trade, 'id' | 'createdAt'>>) => void;
  onDeleteTrade: (id: string) => void;
  calculateProfitLoss: (trade: Trade) => number | null;
}

const formatMYR = (value: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const TradesTable = ({
  trades,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  calculateProfitLoss,
}: TradesTableProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormOpen(true);
  };

  const handleDelete = (trade: Trade) => {
    setTradeToDelete(trade);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tradeToDelete) {
      onDeleteTrade(tradeToDelete.id);
      setTradeToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleFormSubmit = (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    if (editingTrade) {
      onUpdateTrade(editingTrade.id, trade);
    } else {
      onAddTrade(trade);
    }
    setEditingTrade(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingTrade(null);
    }
  };

  return (
    <>
      <Card className="border animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gold/10">
                <FileText className="h-4 w-4 text-gold" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Trading Records</CardTitle>
                <p className="text-xs text-muted-foreground">{trades.length} total trades</p>
              </div>
            </div>
            <Button
              onClick={() => setFormOpen(true)}
              className="gold-gradient text-gold-foreground shadow-gold hover:shadow-gold-lg transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {trades.length > 0 ? (
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="text-right">Buy (RM/g)</TableHead>
                    <TableHead className="text-right">Sell (RM/g)</TableHead>
                    <TableHead className="text-right">Qty (g)</TableHead>
                    <TableHead className="text-right">Total Buy</TableHead>
                    <TableHead className="text-right">Total Sell</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                    <TableHead className="w-[150px]">Notes</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade, index) => {
                    const profitLoss = calculateProfitLoss(trade);
                    const totalBuy = trade.buyPrice * trade.quantity;
                    const totalSell = trade.sellPrice !== null ? trade.sellPrice * trade.quantity : null;
                    const isOpen = trade.sellPrice === null;

                    return (
                      <TableRow
                        key={trade.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          {format(parseISO(trade.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.buyPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.sellPrice?.toFixed(2) ?? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Open
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.quantity.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMYR(totalBuy)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {totalSell !== null ? formatMYR(totalSell) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {profitLoss !== null ? (
                            <span
                              className={cn(
                                "font-mono font-medium px-2 py-1 rounded-md text-sm",
                                profitLoss >= 0 ? 'bg-profit text-success' : 'bg-loss text-destructive'
                              )}
                            >
                              {profitLoss >= 0 ? '+' : ''}{formatMYR(profitLoss)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">
                          {trade.notes || '—'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(trade)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(trade)}
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
            {trades.map((trade, index) => {
              const profitLoss = calculateProfitLoss(trade);
              const totalBuy = trade.buyPrice * trade.quantity;
              const isOpen = trade.sellPrice === null;

              return (
                <div
                  key={trade.id}
                  className="p-4 rounded-lg border bg-card animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{format(parseISO(trade.date), 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{trade.quantity.toFixed(4)}g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {profitLoss !== null ? (
                        <span
                          className={cn(
                            "font-mono font-medium px-2 py-1 rounded-md text-sm",
                            profitLoss >= 0 ? 'bg-profit text-success' : 'bg-loss text-destructive'
                          )}
                        >
                          {profitLoss >= 0 ? '+' : ''}{formatMYR(profitLoss)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3" />
                          Open
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(trade)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(trade)}
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
                      <p className="text-muted-foreground">Buy</p>
                      <p className="font-mono">{formatMYR(trade.buyPrice)}/g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sell</p>
                      <p className="font-mono">{trade.sellPrice !== null ? `${formatMYR(trade.sellPrice)}/g` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Buy</p>
                      <p className="font-mono">{formatMYR(totalBuy)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Sell</p>
                      <p className="font-mono">{trade.sellPrice !== null ? formatMYR(trade.sellPrice * trade.quantity) : '—'}</p>
                    </div>
                  </div>
                  {trade.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{trade.notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          {trades.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-medium mb-1">No trades yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first gold trade
              </p>
              <Button
                onClick={() => setFormOpen(true)}
                className="gold-gradient text-gold-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Trade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TradeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        trade={editingTrade}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
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
