import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, AreaSeries, Time } from 'lightweight-charts';
import { useProtocolStore, selectPrices, selectLatestBlock } from '@/stores/protocolStore';
import maangLogo from '@/assets/maang-logo.svg';

// Historical ranges are STATIC, Live is real-time
const RANGE_PRESETS = {
  'Live': { label: 'Live', seconds: 5 * 60 },
  '1H': { label: '1H', seconds: 60 * 60 },
  '4H': { label: '4H', seconds: 4 * 60 * 60 },
  '1D': { label: '1D', seconds: 24 * 60 * 60 },
  '1W': { label: '1W', seconds: 7 * 24 * 60 * 60 },
  '1M': { label: '1M', seconds: 30 * 24 * 60 * 60 },
} as const;

type RangeKey = keyof typeof RANGE_PRESETS;

interface ChartDataPoint {
  time: number;
  value: number;
}

interface MAANGPriceChartProps {
  className?: string;
}

export function MAANGPriceChart({ className = '' }: MAANGPriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  
  // Live mode refs
  const lastTimeRef = useRef<number | null>(null);
  const dataRef = useRef<ChartDataPoint[]>([]);
  const initialPriceRef = useRef<number | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  
  // Get live data from store
  const prices = useProtocolStore(selectPrices);
  const latestBlock = useProtocolStore(selectLatestBlock);
  
  const [selectedRange, setSelectedRange] = useState<RangeKey>('1D');
  const [tooltipData, setTooltipData] = useState<{ price: string; time: string; x: number; y: number } | null>(null);
  const [displayPrice, setDisplayPrice] = useState<number>(328.0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  const isLiveMode = selectedRange === 'Live';
  const currentPrice = prices.dmmPrice > 0 ? prices.dmmPrice : 328.0;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.5)',
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(52, 211, 153, 0.3)',
          width: 1,
          style: 2,
          labelBackgroundColor: 'rgba(52, 211, 153, 0.9)',
        },
        horzLine: {
          color: 'rgba(52, 211, 153, 0.3)',
          width: 1,
          style: 2,
          labelBackgroundColor: 'rgba(52, 211, 153, 0.9)',
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: isLiveMode,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: 'rgb(52, 211, 153)',
      topColor: 'rgba(52, 211, 153, 0.4)',
      bottomColor: 'rgba(52, 211, 153, 0.0)',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point || !seriesRef.current) {
        setTooltipData(null);
        return;
      }
      const price = param.seriesData.get(seriesRef.current);
      if (price && 'value' in price) {
        const time = param.time as number;
        const date = new Date(time * 1000);
        setTooltipData({
          price: `$${price.value.toFixed(2)}`,
          time: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: isLiveMode ? '2-digit' : undefined,
          }),
          x: param.point.x,
          y: param.point.y,
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isLiveMode]);

  // Generate STATIC historical data
  const generateStaticHistoricalData = useCallback((basePrice: number, range: RangeKey): ChartDataPoint[] => {
    const preset = RANGE_PRESETS[range];
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - preset.seconds;
    
    const pointCounts: Record<RangeKey, number> = {
      'Live': 30,
      '1H': 60,
      '4H': 48,
      '1D': 96,
      '1W': 168,
      '1M': 120,
    };
    
    const numPoints = pointCounts[range];
    const intervalSeconds = preset.seconds / numPoints;
    
    const data: ChartDataPoint[] = [];
    let price = basePrice * (0.92 + Math.random() * 0.05);
    
    for (let i = 0; i < numPoints; i++) {
      const time = Math.floor(startTime + (i * intervalSeconds));
      const targetBias = (basePrice - price) * 0.015;
      const volatility = basePrice * 0.003;
      const change = targetBias + (Math.random() - 0.5) * volatility;
      price = Math.max(price + change, basePrice * 0.85);
      
      data.push({ time, value: Number(price.toFixed(2)) });
    }
    
    if (data.length > 0) {
      data[data.length - 1].value = basePrice;
      data[data.length - 1].time = now;
    }
    
    return data;
  }, []);

  // HISTORICAL MODE: Load static data ONCE per range change
  useEffect(() => {
    if (!seriesRef.current || isLiveMode) return;

    const basePrice = prices.dmmPrice > 0 ? prices.dmmPrice : 328.0;
    const historicalData = generateStaticHistoricalData(basePrice, selectedRange);

    seriesRef.current.setData(
      historicalData.map(d => ({ time: d.time as Time, value: d.value }))
    );
    chartRef.current?.timeScale().fitContent();

    const firstPrice = historicalData[0]?.value || basePrice;
    const lastPrice = historicalData[historicalData.length - 1]?.value || basePrice;
    setDisplayPrice(lastPrice);
    setPriceChange(lastPrice - firstPrice);
    setPriceChangePercent(firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0);
    
  }, [selectedRange, isLiveMode, generateStaticHistoricalData]);

  // LIVE MODE: Update on EVERY price change
  useEffect(() => {
    if (!seriesRef.current || !isLiveMode) return;
    if (currentPrice <= 0) return;
    
    // Skip if price hasn't changed
    if (lastPriceRef.current !== null && Math.abs(currentPrice - lastPriceRef.current) < 0.001) {
      return;
    }
    lastPriceRef.current = currentPrice;
    
    const now = Math.floor(Date.now() / 1000);
    
    // Ensure strictly increasing time
    const nextTime = lastTimeRef.current !== null 
      ? Math.max(now, lastTimeRef.current + 1)
      : now;
    
    const newPoint: ChartDataPoint = { time: nextTime, value: currentPrice };

    if (dataRef.current.length === 0) {
      // First point - initialize
      initialPriceRef.current = currentPrice;
      dataRef.current = [newPoint];
      seriesRef.current.setData([{ time: nextTime as Time, value: currentPrice }]);
    } else {
      // Update existing
      seriesRef.current.update({ time: nextTime as Time, value: currentPrice });
      dataRef.current.push(newPoint);
      
      // Keep only last 5 minutes
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
      dataRef.current = dataRef.current.filter(p => p.time >= fiveMinutesAgo);
    }
    
    lastTimeRef.current = nextTime;
    setDisplayPrice(currentPrice);

    if (initialPriceRef.current !== null && initialPriceRef.current > 0) {
      const change = currentPrice - initialPriceRef.current;
      setPriceChange(change);
      setPriceChangePercent((change / initialPriceRef.current) * 100);
    }

    chartRef.current?.timeScale().scrollToRealTime();
    
  }, [currentPrice, isLiveMode]);

  // Reset on range switch
  const handleRangeChange = useCallback((range: RangeKey) => {
    initialPriceRef.current = null;
    lastTimeRef.current = null;
    lastPriceRef.current = null;
    dataRef.current = [];
    setPriceChange(0);
    setPriceChangePercent(0);
    setSelectedRange(range);
  }, []);

  const isPositive = priceChange >= 0;

  return (
    <div className={`relative ${className}`}>
      {/* Legend */}
      <div className="absolute top-0 left-0 z-10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center p-2.5">
            <img src={maangLogo} alt="MAANG" className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">MAANG</span>
              {isLiveMode && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 ml-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-white font-mono mt-1">
              {displayPrice.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Range Switcher */}
      <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
        {(Object.keys(RANGE_PRESETS) as RangeKey[]).map((range) => (
          <button
            key={range}
            onClick={() => handleRangeChange(range)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedRange === range
                ? range === 'Live'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/10 text-white border border-white/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            {range === 'Live' && <span className="mr-1">●</span>}
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="absolute z-20 pointer-events-none bg-background/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl"
          style={{
            left: Math.min(tooltipData.x + 12, (chartContainerRef.current?.clientWidth || 0) - 120),
            top: tooltipData.y - 60,
          }}
        >
          <div className="text-lg font-bold text-white font-mono">{tooltipData.price}</div>
          <div className="text-xs text-muted-foreground">{tooltipData.time}</div>
        </div>
      )}
    </div>
  );
}

export default MAANGPriceChart;
