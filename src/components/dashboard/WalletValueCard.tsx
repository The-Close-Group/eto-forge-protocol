import { useState, useRef, useEffect } from 'react';
import { useStockPrices, MAANG_STOCKS, StockSymbol } from '@/hooks/useStockPrices';
import { ProTradingChart } from '@/components/charts';
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';

interface WalletValueCardProps {
  totalValue: number;
  changePercent: number;
  realizedPL: number;
  unrealizedPL: number;
  projectedGrowth: number;
  netChange: number;
  className?: string;
}

type ChartMode = 'simple' | 'pro';

export function WalletValueCard({
  totalValue,
  changePercent,
  realizedPL,
  unrealizedPL,
  projectedGrowth,
  netChange,
  className = '',
}: WalletValueCardProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('pro');
  const simpleChartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  
  // Use live MAANG stock prices from Yahoo Finance
  const {
    portfolioValue,
    portfolioChangePercent,
    chartData,
    candleData,
    yahooCandleData,
    stocks,
    isLoading,
    lastUpdated,
  } = useStockPrices(totalValue);

  // Detect theme
  const isDark = typeof document !== 'undefined'
    ? !document.documentElement.classList.contains('light')
    : true;

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

  // Simple area chart for "Simple" mode
  useEffect(() => {
    if (chartMode !== 'simple' || !simpleChartRef.current || !chartData.length) return;

    // Clean up previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
    }

    const accentColor = '#CDFF00';
    const gridColor = isDark ? 'hsl(240, 4%, 12%)' : 'hsl(214, 20%, 94%)';
    const borderColor = isDark ? 'hsl(240, 4%, 16%)' : 'hsl(214, 32%, 91%)';
    const textColor = isDark ? 'hsl(240, 4%, 52%)' : 'hsl(215, 16%, 47%)';

    const chart = createChart(simpleChartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor, style: 1 },
        horzLines: { color: gridColor, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: `${accentColor}80`, width: 1, style: 2, labelBackgroundColor: borderColor },
        horzLine: { color: `${accentColor}80`, width: 1, style: 2, labelBackgroundColor: borderColor },
      },
      rightPriceScale: { visible: true, borderColor, scaleMargins: { top: 0.1, bottom: 0.2 } },
      timeScale: { visible: true, borderColor, timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });

    chartInstanceRef.current = chart;

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(205, 255, 0, 0.15)',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 }, visible: false });

    // Area series
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: accentColor,
      topColor: 'rgba(205, 255, 0, 0.35)',
      bottomColor: 'rgba(205, 255, 0, 0.0)',
      lineWidth: 3,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: accentColor,
      crosshairMarkerBackgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      lastValueVisible: true,
    });

    const areaData = chartData.map(d => ({ time: d.time, value: d.value }));
    const volumeData = chartData.map(d => ({ time: d.time, value: d.volume * 100, color: 'rgba(205, 255, 0, 0.2)' }));

    areaSeries.setData(areaData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (simpleChartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: simpleChartRef.current.clientWidth,
          height: simpleChartRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(simpleChartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, [chartMode, chartData, isDark]);

  // Use Yahoo Finance live candles if available, otherwise fall back to generated candles
  // Always show generated candles while Yahoo data is loading
  const tradingChartData = candleData && candleData.length > 0 ? candleData : [];
  const hasLiveData = yahooCandleData && yahooCandleData.length > 0;

  return (
    <div className={`wvc ${className}`}>
      {/* Header */}
      <div className="wvc-head">
        <div className="wvc-info">
          <div className="wvc-title flex items-center gap-2">
            <span className="flex items-center gap-2">
              Wallet Value
              {isLoading && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground font-normal ml-2">
                Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="wvc-amount-line">
            <span className="wvc-amount">{formatCurrency(portfolioValue)}</span>
            <span className={`wvc-pct ${portfolioChangePercent >= 0 ? '' : 'negative'}`}>
              <span className="wvc-pct-icon">◐</span>
              {portfolioChangePercent >= 0 ? '+' : ''}{portfolioChangePercent.toFixed(1)}%
            </span>
          </div>
          {/* MAANG Stock Pills */}
          {stocks && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {(Object.keys(MAANG_STOCKS) as StockSymbol[]).map((symbol) => {
                const quote = stocks[symbol];
                const info = MAANG_STOCKS[symbol];
                const isPositive = quote?.changePercent >= 0;
                return (
                  <span
                    key={symbol}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
                    style={{ 
                      backgroundColor: `${info.color}15`,
                      color: info.color,
                      border: `1px solid ${info.color}30`
                    }}
                    title={`${info.name}: $${quote?.price?.toFixed(2) || '---'} (${isPositive ? '+' : ''}${quote?.changePercent?.toFixed(2) || '0'}%)`}
                  >
                    {symbol}
                    <span className={isPositive ? 'text-data-positive' : 'text-data-negative'}>
                      {isPositive ? '↑' : '↓'}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Chart Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-muted/50 border border-border/50">
            <button
              onClick={() => setChartMode('simple')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                chartMode === 'simple'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setChartMode('pro')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                chartMode === 'pro'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pro
            </button>
          </div>
          {hasLiveData && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">
              LIVE
            </span>
          )}
          {!hasLiveData && !isLoading && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
              SIMULATED
            </span>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="wvc-chart-wrap">
        {chartMode === 'simple' ? (
          // Simple Area Chart
          <div 
            ref={simpleChartRef} 
            className="w-full"
            style={{ height: 480 }}
          />
        ) : (
          // Pro Trading Chart with Candlesticks - Full height professional view
          <ProTradingChart
            symbol="MAANG Portfolio"
            data={hasLiveData ? yahooCandleData : tradingChartData}
            height={560}
            theme={isDark ? 'dark' : 'light'}
            showToolbar={true}
            showIndicators={true}
            showVolume={true}
          />
        )}
      </div>

      {/* Minimal Stats Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-card/30">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Realized</span>
            <span className={realizedPL >= 0 ? 'text-data-positive font-medium' : 'text-data-negative font-medium'}>
            {formatCurrency(realizedPL, true)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Unrealized</span>
            <span className={unrealizedPL >= 0 ? 'text-data-positive font-medium' : 'text-data-negative font-medium'}>
            {formatCurrency(unrealizedPL, true)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Net Change</span>
            <span className={netChange >= 0 ? 'text-data-positive font-medium' : 'text-data-negative font-medium'}>
              {formatCurrency(netChange, true)}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Data from Yahoo Finance • 20% each: META, AAPL, AMZN, NVDA, GOOG
        </div>
      </div>
    </div>
  );
}

export default WalletValueCard;
