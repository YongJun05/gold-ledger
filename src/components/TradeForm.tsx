import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trade } from '@/types/trade';
import { format } from 'date-fns';

interface TradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade?: Trade | null;
  onSubmit: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
}

export const TradeForm = ({ open, onOpenChange, trade, onSubmit }: TradeFormProps) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    if (trade) {
      setFormData({
        date: trade.date,
        buyPrice: trade.buyPrice.toString(),
        sellPrice: trade.sellPrice?.toString() ?? '',
        quantity: trade.quantity.toString(),
        notes: trade.notes,
      });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        buyPrice: '',
        sellPrice: '',
        quantity: '',
        notes: '',
      });
    }
  }, [trade, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const buyPrice = parseFloat(formData.buyPrice);
    const sellPrice = formData.sellPrice ? parseFloat(formData.sellPrice) : null;
    const quantity = parseFloat(formData.quantity);

    if (isNaN(buyPrice) || isNaN(quantity) || buyPrice <= 0 || quantity <= 0) {
      return;
    }

    if (formData.sellPrice && (isNaN(sellPrice!) || sellPrice! < 0)) {
      return;
    }

    onSubmit({
      date: formData.date,
      buyPrice,
      sellPrice,
      quantity,
      notes: formData.notes.trim(),
    });

    onOpenChange(false);
  };

  const isValid = formData.date && formData.buyPrice && formData.quantity &&
    parseFloat(formData.buyPrice) > 0 && parseFloat(formData.quantity) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {trade ? 'Edit Trade' : 'New Trade'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <Label htmlFor="buyPrice">Buy Price (RM/g)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellPrice">Sell Price (RM/g)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity (grams)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this trade..."
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
            <Button type="submit" disabled={!isValid} className="gold-gradient text-gold-foreground">
              {trade ? 'Save Changes' : 'Add Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
