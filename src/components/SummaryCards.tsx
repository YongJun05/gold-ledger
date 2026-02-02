import { TrendingUp, TrendingDown, Wallet, Scale, Coins, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GoldSummary } from '@/types/trade';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  summary: GoldSummary;
}

const formatMYR = (value: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const cards = [
    {
      title: 'Gold Balance',
      value: `${summary.currentBalance.toFixed(4)}g`,
      icon: Scale,
      variant: 'gold',
    },
    {
      title: 'Average Buy Price',
      value: summary.averageBuyPrice > 0 ? formatMYR(summary.averageBuyPrice) + '/g' : '—',
      icon: Coins,
      variant: 'default',
    },
    {
      title: 'Total Invested',
      value: formatMYR(summary.totalInvested),
      subtitle: `${summary.totalBuyTransactions} buy${summary.totalBuyTransactions !== 1 ? 's' : ''}`,
      icon: Wallet,
      variant: 'default',
    },
    {
      title: 'Realized P/L',
      value: formatMYR(summary.totalRealizedProfitLoss),
      subtitle: `${summary.totalSellTransactions} sell${summary.totalSellTransactions !== 1 ? 's' : ''}`,
      icon: summary.totalRealizedProfitLoss >= 0 ? TrendingUp : TrendingDown,
      variant: summary.totalRealizedProfitLoss >= 0 ? 'success' : 'destructive',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={cn(
            "card-shine border transition-all duration-200 hover:shadow-md",
            "animate-fade-in",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                  {card.title}
                </p>
                <p
                  className={cn(
                    "text-lg lg:text-2xl font-bold tracking-tight",
                    card.variant === 'success' && 'text-success',
                    card.variant === 'destructive' && 'text-destructive',
                    card.variant === 'gold' && 'text-gold'
                  )}
                >
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                )}
              </div>
              <div
                className={cn(
                  "p-2 rounded-lg",
                  card.variant === 'success' && 'bg-success/10',
                  card.variant === 'destructive' && 'bg-destructive/10',
                  card.variant === 'gold' && 'bg-gold/10',
                  card.variant === 'default' && 'bg-muted'
                )}
              >
                <card.icon
                  className={cn(
                    "h-4 w-4 lg:h-5 lg:w-5",
                    card.variant === 'success' && 'text-success',
                    card.variant === 'destructive' && 'text-destructive',
                    card.variant === 'gold' && 'text-gold',
                    card.variant === 'default' && 'text-muted-foreground'
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
