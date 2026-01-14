import React, { useRef, useEffect, useMemo } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  ColorType,
  CrosshairMode,
  UTCTimestamp,
  AreaSeries,
  LineSeries,
} from 'lightweight-charts';
import { getChartTheme, toChartTime } from './useLightweightChart';

export interface TVSparklineData {
  time: UTCTimestamp | number;
  value: number;
}

export interface TVSparklineProps {
  data?: number[] | TVSparklineData[];
  height?: number;
  className?: string;
  variant?: 'positive' | 'negative' | 'accent' | 'default';
  showArea?: boolean;
  lineWidth?: number;
  showEndValue?: boolean;
  endValue?: string;
  // For array of numbers, auto-generate time
  startTime?: Date | number;
  interval?: number; // in milliseconds, default 1 hour
}

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Cache for generated data
const sparklineCache = new Map<string, number[]>();

export function generateSparklineNumbers(
  length: number = 20,
  trend: 'up' | 'down' | 'flat' = 'up',
  seed?: string | number
): number[] {
  const cacheKey = `${length}-${trend}-${seed ?? 'default'}`;
  
  if (sparklineCache.has(cacheKey)) {
    return sparklineCache.get(cacheKey)!;
  }
  
  const data: number[] = [];
  let value = 50;
  
  const baseSeed = typeof seed === 'string'
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : (seed ?? 42);
  
  for (let i = 0; i < length; i++) {
    const random = seededRandom(baseSeed + i * 7.13);
    const volatility = trend === 'flat' ? 0.5 : 1.2;
    const change = (random - 0.5) * volatility;
    const bias = trend === 'up' ? 0.12 : trend === 'down' ? -0.12 : 0;
    value = Math.max(30, Math.min(70, value + change + bias));
    data.push(value);
  }
  
  sparklineCache.set(cacheKey, data);
  return data;
}

export default function TVSparkline({
  data,
  height = 48,
  className = '',
  variant = 'positive',
  showArea = true,
  lineWidth = 1.5,
  showEndValue = false,
  endValue,
  startTime,
  interval = 60 * 60 * 1000, // 1 hour default
}: TVSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | ISeriesApi<'Line'> | null>(null);

  // Detect theme
  const isDark = typeof document !== 'undefined'
    ? !document.documentElement.classList.contains('light')
    : true;

  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

  // Get colors based on variant
  const colors = useMemo(() => {
    switch (variant) {
      case 'negative':
        return {
          line: '#f87171',
          areaTop: 'rgba(248, 113, 113, 0.25)',
          areaBottom: 'rgba(248, 113, 113, 0.0)',
        };
      case 'accent':
        return {
          line: isDark ? '#CDFF00' : '#10B981',
          areaTop: isDark ? 'rgba(205, 255, 0, 0.22)' : 'rgba(16, 185, 129, 0.22)',
          areaBottom: 'rgba(205, 255, 0, 0.0)',
        };
      case 'default':
      case 'positive':
      default:
        return {
          line: '#4dd4ac',
          areaTop: 'rgba(77, 212, 172, 0.25)',
          areaBottom: 'rgba(77, 212, 172, 0.0)',
        };
    }
  }, [variant, isDark]);

  // Convert data to chart format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // If data is array of objects with time/value
    if (typeof data[0] === 'object' && 'time' in data[0]) {
      return data as TVSparklineData[];
    }

    // If data is array of numbers, generate times
    const numbers = data as number[];
    const baseTime = startTime 
      ? (startTime instanceof Date ? startTime.getTime() : startTime)
      : Date.now() - (numbers.length * interval);

    return numbers.map((value, i) => ({
      time: toChartTime(new Date(baseTime + i * interval)) as UTCTimestamp,
      value,
    }));
  }, [data, startTime, interval]);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
        fontFamily: "'DM Sans', sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Hidden,
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    // Create series - v5 API
    if (showArea) {
      const series = chart.addSeries(AreaSeries, {
        lineColor: colors.line,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom,
        lineWidth: lineWidth as 1 | 2 | 3 | 4,
        crosshairMarkerVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color: colors.line,
        lineWidth: lineWidth as 1 | 2 | 3 | 4,
        crosshairMarkerVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      seriesRef.current = series;
    }

    // Set data
    if (chartData.length > 0 && seriesRef.current) {
      seriesRef.current.setData(chartData as any);
      chart.timeScale().fitContent();
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, showArea, lineWidth]); // Only reinit on structural changes

  // Update data without reinitializing
  useEffect(() => {
    if (!seriesRef.current || chartData.length === 0) return;
    
    seriesRef.current.setData(chartData as any);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  // Update colors when theme/variant changes
  useEffect(() => {
    if (!seriesRef.current) return;

    if (showArea) {
      (seriesRef.current as ISeriesApi<'Area'>).applyOptions({
        lineColor: colors.line,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom,
      });
    } else {
      (seriesRef.current as ISeriesApi<'Line'>).applyOptions({
        color: colors.line,
      });
    }
  }, [colors, showArea]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      
      {showEndValue && endValue && (
        <span
          className="absolute top-0 right-0 text-[11px] font-medium"
          style={{ color: colors.line }}
        >
          {endValue}
        </span>
      )}
    </div>
  );
}

// Re-export the generate function for backwards compatibility
export { generateSparklineNumbers as generateSparklineData };

