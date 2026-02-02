import { TrendingUp, TrendingDown, Wallet, BarChart3, Target, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TradeSummary } from '@/types/trade';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  summary: TradeSummary;
}

const formatMYR = (value: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const winRate = summary.winCount + summary.lossCount > 0
    ? ((summary.winCount / (summary.winCount + summary.lossCount)) * 100).toFixed(1)
    : '0';

  const cards = [
    {
      title: 'Total Profit/Loss',
      value: formatMYR(summary.totalProfit),
      icon: summary.totalProfit >= 0 ? TrendingUp : TrendingDown,
      variant: summary.totalProfit >= 0 ? 'success' : 'destructive',
    },
    {
      title: 'Total Invested',
      value: formatMYR(summary.totalInvested),
      icon: Wallet,
      variant: 'default',
    },
    {
      title: 'Win Rate',
      value: `${winRate}%`,
      subtitle: `${summary.winCount}W / ${summary.lossCount}L`,
      icon: Target,
      variant: 'default',
    },
    {
      title: 'Open Positions',
      value: summary.openPositions.toString(),
      icon: Clock,
      variant: 'muted',
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
                    card.variant === 'destructive' && 'text-destructive'
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
                  card.variant === 'default' && 'bg-gold/10',
                  card.variant === 'muted' && 'bg-muted'
                )}
              >
                <card.icon
                  className={cn(
                    "h-4 w-4 lg:h-5 lg:w-5",
                    card.variant === 'success' && 'text-success',
                    card.variant === 'destructive' && 'text-destructive',
                    card.variant === 'default' && 'text-gold',
                    card.variant === 'muted' && 'text-muted-foreground'
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
