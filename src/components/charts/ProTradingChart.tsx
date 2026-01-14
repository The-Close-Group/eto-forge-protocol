import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  UTCTimestamp,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  LineStyle,
  PriceScaleMode,
} from 'lightweight-charts';

// ============================================================================
// TYPES
// ============================================================================

export interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LineData {
  time: UTCTimestamp;
  value: number;
}

type ChartType = 'candle' | 'line' | 'area';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
type Indicator = 'sma20' | 'sma50' | 'ema12' | 'ema26' | 'bollinger' | 'volume' | 'rsi' | 'macd';

interface ProTradingChartProps {
  symbol?: string;
  data: CandleData[];
  height?: number;
  className?: string;
  onTimeFrameChange?: (tf: TimeFrame) => void;
  showToolbar?: boolean;
  showIndicators?: boolean;
  showVolume?: boolean;
  theme?: 'dark' | 'light';
}

// ============================================================================
// INDICATOR CALCULATIONS
// ============================================================================

function calculateSMA(data: CandleData[], period: number): LineData[] {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateEMA(data: CandleData[], period: number): LineData[] {
  const result: LineData[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  result.push({ time: data[period - 1].time, value: ema });
  
  // Calculate EMA for rest
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

function calculateBollingerBands(data: CandleData[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(data, period);
  const upper: LineData[] = [];
  const lower: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1]?.value || 0;
    const squaredDiffs = slice.map(d => Math.pow(d.close - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);
    
    upper.push({ time: data[i].time, value: mean + stdDev * std });
    lower.push({ time: data[i].time, value: mean - stdDev * std });
  }
  
  return { upper, middle: sma, lower };
}

function calculateRSI(data: CandleData[], period: number = 14): LineData[] {
  const result: LineData[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
    
    if (i >= period) {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push({ time: data[i].time, value: rsi });
    }
  }
  return result;
}

function calculateMACD(data: CandleData[]) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const macdLine: LineData[] = [];
  const signalLine: LineData[] = [];
  const histogram: Array<{ time: UTCTimestamp; value: number; color: string }> = [];
  
  // MACD line = EMA12 - EMA26
  const offset = 26 - 12;
  for (let i = 0; i < ema26.length; i++) {
    const macd = ema12[i + offset].value - ema26[i].value;
    macdLine.push({ time: ema26[i].time, value: macd });
  }
  
  // Signal line = 9-period EMA of MACD
  if (macdLine.length >= 9) {
    const multiplier = 2 / 10;
    let signal = macdLine.slice(0, 9).reduce((a, b) => a + b.value, 0) / 9;
    signalLine.push({ time: macdLine[8].time, value: signal });
    
    for (let i = 9; i < macdLine.length; i++) {
      signal = (macdLine[i].value - signal) * multiplier + signal;
      signalLine.push({ time: macdLine[i].time, value: signal });
      
      const histValue = macdLine[i].value - signal;
      histogram.push({
        time: macdLine[i].time,
        value: histValue,
        color: histValue >= 0 ? 'rgba(77, 212, 172, 0.6)' : 'rgba(248, 113, 113, 0.6)',
      });
    }
  }
  
  return { macdLine, signalLine, histogram };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProTradingChart({
  symbol = 'MAANG',
  data,
  height = 500,
  className = '',
  onTimeFrameChange,
  showToolbar = true,
  showIndicators = true,
  showVolume = true,
  theme = 'dark',
}: ProTradingChartProps) {
  // State
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set(['volume', 'sma20']));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [legendData, setLegendData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  } | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<any>>>(new Map());
  
  // Theme colors
  const colors = useMemo(() => ({
    background: theme === 'dark' ? 'transparent' : 'transparent',
    text: theme === 'dark' ? 'hsl(240, 4%, 55%)' : 'hsl(215, 16%, 47%)',
    grid: theme === 'dark' ? 'hsl(240, 4%, 14%)' : 'hsl(214, 20%, 94%)',
    border: theme === 'dark' ? 'hsl(240, 4%, 18%)' : 'hsl(214, 32%, 91%)',
    upColor: '#4dd4ac',
    downColor: '#f87171',
    wickUp: '#4dd4ac',
    wickDown: '#f87171',
    accent: '#CDFF00',
    sma20: '#f59e0b',
    sma50: '#8b5cf6',
    ema12: '#06b6d4',
    ema26: '#ec4899',
    bollingerUpper: 'rgba(139, 92, 246, 0.5)',
    bollingerLower: 'rgba(139, 92, 246, 0.5)',
    bollingerFill: 'rgba(139, 92, 246, 0.1)',
    volume: theme === 'dark' ? 'rgba(205, 255, 0, 0.15)' : 'rgba(77, 212, 172, 0.2)',
    rsiLine: '#f59e0b',
    macdLine: '#06b6d4',
    signalLine: '#f97316',
  }), [theme]);

  // Handle timeframe change
  const handleTimeFrameChange = useCallback((tf: TimeFrame) => {
    setTimeFrame(tf);
    onTimeFrameChange?.(tf);
  }, [onTimeFrameChange]);

  // Toggle indicator
  const toggleIndicator = useCallback((indicator: Indicator) => {
    setActiveIndicators(prev => {
      const next = new Set(prev);
      if (next.has(indicator)) {
        next.delete(indicator);
      } else {
        next.add(indicator);
      }
      return next;
    });
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      indicatorSeriesRefs.current.clear();
    }

    const chartHeight = isFullscreen ? window.innerHeight - 100 : height;
    
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.grid, style: LineStyle.Dotted },
        horzLines: { color: colors.grid, style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: `${colors.accent}80`,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: colors.border,
        },
        horzLine: {
          color: `${colors.accent}80`,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: colors.border,
        },
      },
      rightPriceScale: {
        visible: true,
        borderColor: colors.border,
        scaleMargins: { top: 0.1, bottom: 0.25 },
        mode: PriceScaleMode.Normal,
        autoScale: true,
      },
      timeScale: {
        visible: true,
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12,
        minBarSpacing: 4,
        fixLeftEdge: false,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: {
        vertTouchDrag: true,
        horzTouchDrag: true,
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      localization: {
        priceFormatter: (price: number) => '$' + price.toFixed(2),
      },
    });

    chartRef.current = chart;

    // Add volume series first (in background)
    if (activeIndicators.has('volume')) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: colors.volume,
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
        visible: false,
      });

      const volumeData = data.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? 'rgba(77, 212, 172, 0.3)' : 'rgba(248, 113, 113, 0.3)',
      }));
      
      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
      indicatorSeriesRefs.current.set('volume', volumeSeries);
    }

    // Add main series based on chart type
    if (chartType === 'candle') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        borderVisible: false,
        wickUpColor: colors.wickUp,
        wickDownColor: colors.wickDown,
        priceLineVisible: true,
        priceLineColor: colors.accent,
        lastValueVisible: true,
      });
      
      candleSeries.setData(data);
      mainSeriesRef.current = candleSeries;
      
      // Add price line at current price
      const lastPrice = data[data.length - 1]?.close;
      if (lastPrice) {
        candleSeries.createPriceLine({
          price: lastPrice,
          color: colors.accent,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'Current',
        });
      }
    } else if (chartType === 'line') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: colors.accent,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: colors.accent,
        crosshairMarkerBackgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        priceLineVisible: true,
        lastValueVisible: true,
      });
      
      const lineData = data.map(d => ({ time: d.time, value: d.close }));
      lineSeries.setData(lineData);
      mainSeriesRef.current = lineSeries;
    } else if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: colors.accent,
        topColor: `${colors.accent}40`,
        bottomColor: `${colors.accent}00`,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      
      const areaData = data.map(d => ({ time: d.time, value: d.close }));
      areaSeries.setData(areaData);
      mainSeriesRef.current = areaSeries;
    }

    // Add SMA indicators
    if (activeIndicators.has('sma20')) {
      const sma20Data = calculateSMA(data, 20);
      const sma20Series = chart.addSeries(LineSeries, {
        color: colors.sma20,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      sma20Series.setData(sma20Data);
      indicatorSeriesRefs.current.set('sma20', sma20Series);
    }

    if (activeIndicators.has('sma50')) {
      const sma50Data = calculateSMA(data, 50);
      const sma50Series = chart.addSeries(LineSeries, {
        color: colors.sma50,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      sma50Series.setData(sma50Data);
      indicatorSeriesRefs.current.set('sma50', sma50Series);
    }

    // Add EMA indicators
    if (activeIndicators.has('ema12')) {
      const ema12Data = calculateEMA(data, 12);
      const ema12Series = chart.addSeries(LineSeries, {
        color: colors.ema12,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      ema12Series.setData(ema12Data);
      indicatorSeriesRefs.current.set('ema12', ema12Series);
    }

    if (activeIndicators.has('ema26')) {
      const ema26Data = calculateEMA(data, 26);
      const ema26Series = chart.addSeries(LineSeries, {
        color: colors.ema26,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      ema26Series.setData(ema26Data);
      indicatorSeriesRefs.current.set('ema26', ema26Series);
    }

    // Add Bollinger Bands
    if (activeIndicators.has('bollinger')) {
      const bb = calculateBollingerBands(data, 20, 2);
      
      const bbUpperSeries = chart.addSeries(LineSeries, {
        color: colors.bollingerUpper,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      bbUpperSeries.setData(bb.upper);
      indicatorSeriesRefs.current.set('bbUpper', bbUpperSeries);
      
      const bbLowerSeries = chart.addSeries(LineSeries, {
        color: colors.bollingerLower,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      bbLowerSeries.setData(bb.lower);
      indicatorSeriesRefs.current.set('bbLower', bbLowerSeries);
    }

    // Subscribe to crosshair for legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        setLegendData(null);
        return;
      }

      const candleData = data.find(d => d.time === param.time);
      if (candleData) {
        const prevCandle = data[data.indexOf(candleData) - 1];
        const change = prevCandle ? candleData.close - prevCandle.close : 0;
        const changePercent = prevCandle ? (change / prevCandle.close) * 100 : 0;
        
        const date = new Date((param.time as number) * 1000);
        setLegendData({
          time: date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: candleData.volume || 0,
          change,
          changePercent,
        });
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        const newHeight = isFullscreen ? window.innerHeight - 100 : height;
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: newHeight,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      indicatorSeriesRefs.current.clear();
    };
  }, [data, chartType, activeIndicators, colors, height, isFullscreen, theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const timeFrames: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const indicators: { key: Indicator; label: string; color: string }[] = [
    { key: 'volume', label: 'Vol', color: colors.accent },
    { key: 'sma20', label: 'SMA 20', color: colors.sma20 },
    { key: 'sma50', label: 'SMA 50', color: colors.sma50 },
    { key: 'ema12', label: 'EMA 12', color: colors.ema12 },
    { key: 'ema26', label: 'EMA 26', color: colors.ema26 },
    { key: 'bollinger', label: 'BB', color: colors.sma50 },
  ];

  return (
    <div 
      className={`pro-trading-chart ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'} ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Left: Symbol & Chart Type */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">{symbol}</span>
            
            <div className="flex gap-1 p-0.5 rounded-md bg-muted/50">
              {(['candle', 'line', 'area'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    chartType === type 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Timeframes */}
          <div className="flex gap-1">
            {timeFrames.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeFrameChange(tf)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  timeFrame === tf 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => chartRef.current?.timeScale().fitContent()}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50"
              title="Fit to screen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50"
              title="Fullscreen (Ctrl+F)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                )}
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Indicators Bar */}
      {showIndicators && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30 bg-card/30">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Indicators:</span>
          {indicators.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleIndicator(key)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all ${
                activeIndicators.has(key)
                  ? 'border-current'
                  : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
              style={{ color: activeIndicators.has(key) ? color : undefined }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Legend Overlay */}
      {legendData && (
        <div className="absolute top-12 left-3 z-10 flex gap-4 text-[11px] font-mono bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border/50">
          <span className="text-muted-foreground">{legendData.time}</span>
          <span><span className="text-muted-foreground">O:</span> <span className="text-foreground">${legendData.open.toFixed(2)}</span></span>
          <span><span className="text-muted-foreground">H:</span> <span className="text-data-positive">${legendData.high.toFixed(2)}</span></span>
          <span><span className="text-muted-foreground">L:</span> <span className="text-data-negative">${legendData.low.toFixed(2)}</span></span>
          <span><span className="text-muted-foreground">C:</span> <span className="text-foreground">${legendData.close.toFixed(2)}</span></span>
          <span className={legendData.change >= 0 ? 'text-data-positive' : 'text-data-negative'}>
            {legendData.change >= 0 ? '+' : ''}{legendData.change.toFixed(2)} ({legendData.changePercent.toFixed(2)}%)
          </span>
          {legendData.volume > 0 && (
            <span><span className="text-muted-foreground">Vol:</span> <span className="text-foreground">{(legendData.volume / 1000).toFixed(1)}K</span></span>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full"
        style={{ height: showToolbar ? (isFullscreen ? 'calc(100vh - 80px)' : height - 80) : height }}
      />

      {/* Active Indicators Legend */}
      <div className="absolute bottom-2 left-3 z-10 flex gap-3 text-[10px]">
        {activeIndicators.has('sma20') && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colors.sma20 }} />
            <span style={{ color: colors.sma20 }}>SMA 20</span>
          </span>
        )}
        {activeIndicators.has('sma50') && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colors.sma50 }} />
            <span style={{ color: colors.sma50 }}>SMA 50</span>
          </span>
        )}
        {activeIndicators.has('ema12') && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colors.ema12 }} />
            <span style={{ color: colors.ema12 }}>EMA 12</span>
          </span>
        )}
        {activeIndicators.has('ema26') && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colors.ema26 }} />
            <span style={{ color: colors.ema26 }}>EMA 26</span>
          </span>
        )}
        {activeIndicators.has('bollinger') && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colors.sma50 }} />
            <span style={{ color: colors.sma50 }}>Bollinger</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default ProTradingChart;

