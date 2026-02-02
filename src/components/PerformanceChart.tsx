import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartDataPoint, TimeFilter } from '@/types/trade';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface PerformanceChartProps {
  data: ChartDataPoint[];
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const timeFilters: TimeFilter[] = ['1D', '1W', '1M', '1Y', 'ALL'];

const formatMYR = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `RM${(value / 1000).toFixed(1)}K`;
  }
  return `RM${value.toFixed(0)}`;
};

export const PerformanceChart = ({ data, timeFilter, onTimeFilterChange }: PerformanceChartProps) => {
  const hasData = data.length > 0;
  const latestValue = hasData ? data[data.length - 1].cumulativeProfit : 0;
  const isPositive = latestValue >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">
            {format(parseISO(label), 'MMM dd, yyyy')}
          </p>
          <p className={cn(
            "text-sm font-semibold",
            payload[0].value >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {formatMYR(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gold/10">
              <TrendingUp className="h-4 w-4 text-gold" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Performance</CardTitle>
              <p className="text-xs text-muted-foreground">Cumulative profit/loss</p>
            </div>
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeFilterChange(filter)}
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-all",
                  timeFilter === filter && "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {hasData ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatMYR}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
                  fill={isPositive ? "url(#profitGradient)" : "url(#lossGradient)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No closed trades yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add trades with sell prices to see performance</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
