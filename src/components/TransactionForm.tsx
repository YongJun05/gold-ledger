import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, TransactionType } from '@/types/trade';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  transactionType: TransactionType;
  currentGoldBalance: number;
  onSubmit: (data: { date: string; price: number; quantity: number; notes: string }) => void;
}

export const TransactionForm = ({
  open,
  onOpenChange,
  transaction,
  transactionType,
  currentGoldBalance,
  onSubmit,
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    price: '',
    quantity: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [sellAll, setSellAll] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        price: transaction.price.toString(),
        quantity: transaction.quantity.toString(),
        notes: transaction.notes,
      });
      setSellAll(false);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        price: '',
        quantity: '',
        notes: '',
      });
      setSellAll(false);
    }
    setError(null);
  }, [transaction, open]);

  useEffect(() => {
    if (transactionType === 'sell' && sellAll && !transaction) {
      setFormData(prev => ({
        ...prev,
        quantity: currentGoldBalance.toString(),
      }));
    }
  }, [sellAll, currentGoldBalance, transactionType, transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(formData.price);
    const quantity = parseFloat(formData.quantity);

    if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      setError('Please enter valid price and quantity');
      return;
    }

    // Validate sell quantity doesn't exceed balance
    if (transactionType === 'sell' && quantity > currentGoldBalance) {
      setError(`Cannot sell more than current balance (${currentGoldBalance.toFixed(4)}g)`);
      return;
    }

    onSubmit({
      date: formData.date,
      price,
      quantity,
      notes: formData.notes.trim(),
    });

    onOpenChange(false);
  };

  const isValid = formData.date && formData.price && formData.quantity &&
    parseFloat(formData.price) > 0 && parseFloat(formData.quantity) > 0;

  const isBuy = transactionType === 'buy';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className={cn(
              "p-2 rounded-lg",
              isBuy ? "bg-success/10" : "bg-destructive/10"
            )}>
              {isBuy ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            {transaction ? 'Edit' : 'New'} {isBuy ? 'Buy' : 'Sell'} Transaction
          </DialogTitle>
          <DialogDescription>
            {isBuy
              ? 'Record a gold purchase transaction'
              : `Sell from your balance of ${currentGoldBalance.toFixed(4)}g`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">{isBuy ? 'Buy' : 'Sell'} Price (RM/g)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity (grams)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.0001"
                  min="0"
                  max={transactionType === 'sell' ? currentGoldBalance : undefined}
                  placeholder="0.0000"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value });
                    if (transactionType === 'sell') setSellAll(false);
                  }}
                  className="h-10"
                  disabled={transactionType === 'sell' && sellAll && !transaction}
                />
              </div>
            </div>

            {transactionType === 'sell' && !transaction && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="sell-all" className="cursor-pointer font-medium">
                    Sell All Gold
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Available: <span className="font-mono font-medium">{currentGoldBalance.toFixed(4)}g</span>
                  </span>
                </div>
                <Switch
                  id="sell-all"
                  checked={sellAll}
                  onCheckedChange={setSellAll}
                />
              </div>
            )}

            {transactionType === 'sell' && transaction && (
              <div className="text-xs text-muted-foreground">
                Available balance: <span className="font-mono font-medium">{currentGoldBalance.toFixed(4)}g</span>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this transaction..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className={cn(
                isBuy
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {transaction ? 'Save Changes' : `${isBuy ? 'Buy' : 'Sell'} Gold`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
