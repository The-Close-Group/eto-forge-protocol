import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Grid3X3, Settings2, Plus, Sparkles, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';

interface WalletValueCardProps {
  totalValue: number;
  changePercent: number;
  realizedPL: number;
  unrealizedPL: number;
  projectedGrowth: number;
  netChange: number;
  className?: string;
}

// Generate chart data matching the Execution page format
const generateChartData = (days: number = 180, basePrice: number = 40000, volatility: number = 0.015) => {
  const data = [];
  let price = basePrice * 0.92;
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 100;
  
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.42) * volatility * price;
    price = Math.max(price + change, basePrice * 0.8);
    data.push({
      time: new Date(now - (100 - i) * interval).toLocaleString(),
      timestamp: now - (100 - i) * interval,
      price: price,
    });
  }
  return data;
};

const timeFilters = ['1h', '8h', '1d', '1w', '1m', '6m', '1y'] as const;
type TimeFilter = typeof timeFilters[number];

// Map time filters to days
const timeFilterToDays: Record<TimeFilter, number> = {
  '1h': 0.04,
  '8h': 0.33,
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '6m': 180,
  '1y': 365,
};

export function WalletValueCard({
  totalValue,
  changePercent,
  realizedPL,
  unrealizedPL,
  projectedGrowth,
  netChange,
  className = '',
}: WalletValueCardProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('6m');
  
  // Generate chart data based on selected time filter
  const chartData = useMemo(() => 
    generateChartData(timeFilterToDays[activeFilter], totalValue),
    [activeFilter, totalValue]
  );

  const formatCurrency = (value: number, showSign = false) => {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
    if (showSign) return value >= 0 ? `+${formatted}` : `-${formatted}`;
    return formatted;
  };

  // Primary green color for the chart
  const chartColor = '#10b981';

  return (
    <div className={`wvc ${className}`}>
      {/* Header */}
      <div className="wvc-head">
        <div className="wvc-info">
          <div className="wvc-title-line">
            <span className="wvc-title">Portfolio Value</span>
            <span className="wvc-live-badge">
              <span className="wvc-live-dot" />
              Live
            </span>
          </div>
          <div className="wvc-amount-line">
            <span className="wvc-amount">{formatCurrency(totalValue)}</span>
            <span className={`wvc-pct ${changePercent >= 0 ? 'positive' : 'negative'}`}>
              {changePercent >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="wvc-controls">
          <div className="wvc-actions">
            <button className="wvc-action-btn" title="Add funds">
              <Plus className="w-[18px] h-[18px]" />
            </button>
            <button className="wvc-action-btn" title="Analytics">
              <BarChart3 className="w-[18px] h-[18px]" />
            </button>
            <button className="wvc-action-btn" title="Grid view">
              <Grid3X3 className="w-[18px] h-[18px]" />
            </button>
            <button className="wvc-action-btn" title="Settings">
              <Settings2 className="w-[18px] h-[18px]" />
            </button>
          </div>
          <div className="wvc-time-btns">
            {timeFilters.map((f) => (
              <button
                key={f}
                className={`wvc-time-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container - Using Recharts like Execution page */}
      <div className="wvc-chart-wrap">
        <div className="h-64 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (activeFilter === '1h' || activeFilter === '8h') {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  if (activeFilter === '1d') {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                domain={['dataMin - 500', 'dataMax + 500']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                orientation="right"
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = Number(payload[0].value);
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="wvc-bottom">
        <div className="wvc-stat-card">
          <div className="wvc-stat-icon-wrap positive">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="wvc-stat-content">
            <div className="wvc-stat-name">Realized P&L</div>
            <div className={`wvc-stat-num ${realizedPL >= 0 ? 'green' : 'red'}`}>
              {formatCurrency(realizedPL, true)}
            </div>
          </div>
          <div className="wvc-stat-trend positive">
            <ArrowUpRight className="w-3 h-3" />
            +27%
          </div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-icon-wrap negative">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="wvc-stat-content">
            <div className="wvc-stat-name">Unrealized P&L</div>
            <div className={`wvc-stat-num ${unrealizedPL >= 0 ? 'green' : 'red'}`}>
              {formatCurrency(unrealizedPL, true)}
            </div>
          </div>
          <div className="wvc-stat-trend negative">
            <ArrowDownRight className="w-3 h-3" />
            -11.8%
          </div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-icon-wrap positive">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="wvc-stat-content">
            <div className="wvc-stat-name">Projected Growth</div>
            <div className={`wvc-stat-num ${projectedGrowth >= 0 ? 'green' : 'red'}`}>
              {formatCurrency(projectedGrowth, true)}
            </div>
          </div>
          <div className="wvc-stat-trend positive">
            <ArrowUpRight className="w-3 h-3" />
            +3.2%
          </div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-icon-wrap neutral">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="wvc-stat-content">
            <div className="wvc-stat-name">Net Change</div>
            <div className={`wvc-stat-num ${netChange >= 0 ? 'green' : 'red'}`}>
              {formatCurrency(netChange, true)}
            </div>
          </div>
          <div className={`wvc-stat-trend ${netChange >= 0 ? 'positive' : 'negative'}`}>
            {netChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {netChange >= 0 ? '+' : ''}{(netChange / totalValue * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletValueCard;
