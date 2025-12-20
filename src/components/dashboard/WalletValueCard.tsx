import { useState, useMemo } from 'react';

interface WalletValueCardProps {
  totalValue: number;
  changePercent: number;
  realizedPL: number;
  unrealizedPL: number;
  projectedGrowth: number;
  netChange: number;
  className?: string;
}

const generateChartData = (points: number = 50) => {
  const data = [];
  let price = 39000;
  
  for (let i = 0; i < points; i++) {
    const wave = Math.sin(i * 0.12) * 1200;
    const trend = i * 40;
    const noise = (Math.random() - 0.5) * 200;
    price = 38000 + wave + trend + noise;
    
    data.push({
      price,
      volume: 25 + Math.random() * 65,
    });
  }
  return data;
};

const timeFilters = ['1h', '8h', '1d', '1w', '1m', '6m', '1y'] as const;
type TimeFilter = typeof timeFilters[number];

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
  const chartData = useMemo(() => generateChartData(50), []);

  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const peakIndex = prices.indexOf(maxPrice);

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

  // SVG dimensions - full width edge-to-edge
  const svgWidth = 1000;
  const svgHeight = 280;
  const margin = { top: 40, right: 0, bottom: 0, left: 0 }; // Zero side margins for edge-to-edge
  const plotW = svgWidth;
  const plotH = svgHeight - margin.top - margin.bottom;

  // Calculate positions - full width
  const getX = (i: number) => (i / (chartData.length - 1)) * plotW;
  const getY = (p: number) => margin.top + plotH - ((p - minPrice) / priceRange) * plotH;

  // Generate line path
  const linePath = chartData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.price).toFixed(1)}`
  ).join(' ');

  // Area path - full width
  const areaPath = `${linePath} L ${svgWidth} ${margin.top + plotH} L 0 ${margin.top + plotH} Z`;

  // Peak position  
  const peakX = getX(peakIndex);
  const peakY = getY(maxPrice);

  // Bar dimensions
  const barW = (plotW / chartData.length) * 0.65;

  return (
    <div className={`wvc ${className}`}>
      {/* Header */}
      <div className="wvc-head">
        <div className="wvc-info">
          <div className="wvc-title">Wallet Value</div>
          <div className="wvc-amount-line">
            <span className="wvc-amount">{formatCurrency(totalValue)}</span>
            <span className="wvc-pct">
              <span className="wvc-pct-icon">◐</span>
              {changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="wvc-controls">
          <div className="wvc-actions">
            <button className="wvc-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button className="wvc-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button className="wvc-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
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

      {/* Chart Container - Full Width Edge-to-Edge */}
      <div className="wvc-chart-wrap">
        <svg 
          className="wvc-svg" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(160, 70%, 50%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(160, 70%, 50%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Volume Bars - full width */}
          {chartData.map((d, i) => {
            const x = (i / chartData.length) * plotW;
            const h = (d.volume / 100) * plotH * 0.5;
            const y = margin.top + plotH - h;
            
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill="currentColor"
                className="wvc-vol-bar"
              />
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="url(#chartAreaGrad)" />

          {/* Line */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="hsl(160, 70%, 50%)" 
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak Circle */}
          <circle
            cx={peakX}
            cy={peakY}
            r="6"
            fill="hsl(160, 70%, 50%)"
            stroke="hsl(var(--card))"
            strokeWidth="3"
          />
        </svg>

        {/* Peak Label */}
        <div 
          className="wvc-peak-tooltip"
          style={{
            left: `${(peakX / svgWidth) * 100}%`,
            top: `${((peakY - 10) / svgHeight) * 100}%`,
          }}
        >
          +$1,859.48
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="wvc-bottom">
        <div className="wvc-stat-card">
          <div className="wvc-stat-name">Realized PL</div>
          <div className={`wvc-stat-num ${realizedPL >= 0 ? 'green' : 'red'}`}>
            {formatCurrency(realizedPL, true)}
          </div>
          <div className="wvc-stat-meta">◐ +27% Today</div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-name">Unrealized PL</div>
          <div className={`wvc-stat-num ${unrealizedPL >= 0 ? 'green' : 'red'}`}>
            {formatCurrency(unrealizedPL, true)}
          </div>
          <div className="wvc-stat-meta">◐ -11.8% Today</div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-name">Projected Growth</div>
          <div className={`wvc-stat-num ${projectedGrowth >= 0 ? 'green' : 'red'}`}>
            {formatCurrency(projectedGrowth, true)}
          </div>
          <div className="wvc-stat-meta">◐ +3.2% Today</div>
        </div>
        <div className="wvc-stat-card">
          <div className="wvc-stat-name">Net Change</div>
          <div className={`wvc-stat-num ${netChange >= 0 ? 'green' : 'red'}`}>
            {formatCurrency(netChange, true)}
          </div>
          <div className="wvc-stat-meta">◐ -11.8% Today</div>
        </div>
      </div>
    </div>
  );
}

export default WalletValueCard;
