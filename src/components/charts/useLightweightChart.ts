import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  SeriesType,
} from 'lightweight-charts';

export interface ChartTheme {
  isDark: boolean;
  background: string;
  textColor: string;
  gridColor: string;
  borderColor: string;
  crosshairColor: string;
  // Series colors
  lineColor: string;
  areaTopColor: string;
  areaBottomColor: string;
  upColor: string;
  downColor: string;
  volumeColor: string;
}

// Get theme colors from CSS variables
export function getChartTheme(isDark: boolean): ChartTheme {
  if (isDark) {
    return {
      isDark: true,
      background: 'transparent',
      textColor: 'hsl(240, 4%, 52%)', // --muted-foreground
      gridColor: 'hsl(240, 4%, 12%)', // --border-subtle
      borderColor: 'hsl(240, 4%, 16%)', // --border
      crosshairColor: 'hsl(240, 4%, 55%)', // --data-neutral
      lineColor: '#4dd4ac', // --primary mint green
      areaTopColor: 'rgba(77, 212, 172, 0.4)',
      areaBottomColor: 'rgba(77, 212, 172, 0.0)',
      upColor: '#4dd4ac', // --data-positive
      downColor: '#f87171', // --data-negative
      volumeColor: 'rgba(77, 212, 172, 0.2)', // --chart-accent at 20%
    };
  } else {
    return {
      isDark: false,
      background: 'transparent',
      textColor: 'hsl(215, 16%, 47%)', // light --muted-foreground
      gridColor: 'hsl(214, 20%, 94%)', // light --border-subtle
      borderColor: 'hsl(214, 32%, 91%)', // light --border
      crosshairColor: 'hsl(215, 16%, 47%)', // light --data-neutral
      lineColor: 'hsl(158, 64%, 42%)', // light --primary
      areaTopColor: 'rgba(56, 161, 105, 0.3)',
      areaBottomColor: 'rgba(56, 161, 105, 0.0)',
      upColor: 'hsl(158, 64%, 42%)', // light --data-positive
      downColor: 'hsl(0, 84%, 60%)', // light --data-negative
      volumeColor: 'rgba(56, 161, 105, 0.15)',
    };
  }
}

export interface UseLightweightChartOptions {
  autoSize?: boolean;
  height?: number;
  showGrid?: boolean;
  showTimeScale?: boolean;
  showPriceScale?: boolean;
  crosshairMode?: 'normal' | 'magnet' | 'hidden';
  rightPriceScaleWidth?: number;
  timeScaleVisible?: boolean;
  handleScroll?: boolean;
  handleScale?: boolean;
}

const defaultOptions: UseLightweightChartOptions = {
  autoSize: true,
  showGrid: true,
  showTimeScale: true,
  showPriceScale: true,
  crosshairMode: 'normal',
  timeScaleVisible: true,
  handleScroll: true,
  handleScale: true,
};

export function useLightweightChart(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseLightweightChartOptions = {}
) {
  const chartRef = useRef<IChartApi | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mergedOptions = { ...defaultOptions, ...options };

  // Detect theme from document
  const isDark = typeof document !== 'undefined' 
    ? !document.documentElement.classList.contains('light')
    : true;

  const theme = getChartTheme(isDark);

  const getCrosshairMode = useCallback(() => {
    switch (mergedOptions.crosshairMode) {
      case 'magnet':
        return CrosshairMode.Magnet;
      case 'hidden':
        return CrosshairMode.Hidden;
      default:
        return CrosshairMode.Normal;
    }
  }, [mergedOptions.crosshairMode]);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme.background },
        textColor: theme.textColor,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: {
          color: mergedOptions.showGrid ? theme.gridColor : 'transparent',
          style: LineStyle.Solid,
        },
        horzLines: {
          color: mergedOptions.showGrid ? theme.gridColor : 'transparent',
          style: LineStyle.Solid,
        },
      },
      crosshair: {
        mode: getCrosshairMode(),
        vertLine: {
          color: theme.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: theme.borderColor,
        },
        horzLine: {
          color: theme.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: theme.borderColor,
        },
      },
      rightPriceScale: {
        visible: mergedOptions.showPriceScale,
        borderColor: theme.borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        entireTextOnly: true,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: mergedOptions.showTimeScale && mergedOptions.timeScaleVisible,
        borderColor: theme.borderColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: mergedOptions.handleScroll,
      handleScale: mergedOptions.handleScale,
      autoSize: mergedOptions.autoSize,
    });

    // Set explicit height if provided
    if (mergedOptions.height && !mergedOptions.autoSize) {
      chart.applyOptions({ height: mergedOptions.height });
    }

    chartRef.current = chart;
    setIsReady(true);

    // Handle resize
    const resizeHandler = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      chart.remove();
      chartRef.current = null;
      setIsReady(false);
    };
  }, [containerRef, theme, mergedOptions, getCrosshairMode]);

  // Update theme when it changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: theme.background },
        textColor: theme.textColor,
      },
      grid: {
        vertLines: {
          color: mergedOptions.showGrid ? theme.gridColor : 'transparent',
        },
        horzLines: {
          color: mergedOptions.showGrid ? theme.gridColor : 'transparent',
        },
      },
      crosshair: {
        vertLine: {
          color: theme.crosshairColor,
          labelBackgroundColor: theme.borderColor,
        },
        horzLine: {
          color: theme.crosshairColor,
          labelBackgroundColor: theme.borderColor,
        },
      },
      rightPriceScale: {
        borderColor: theme.borderColor,
      },
      timeScale: {
        borderColor: theme.borderColor,
      },
    });
  }, [theme, mergedOptions.showGrid]);

  return {
    chart: chartRef.current,
    isReady,
    theme,
  };
}

// Helper to convert timestamp to chart time format
export function toChartTime(timestamp: number | Date): number {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return Math.floor(date.getTime() / 1000) as number;
}

// Generate mock OHLC data for development
export function generateMockOHLC(
  days: number = 30,
  startPrice: number = 1.0,
  volatility: number = 0.02
) {
  const data = [];
  let price = startPrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const time = toChartTime(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      time,
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      value: parseFloat(close.toFixed(4)), // For area/line charts
    });
    
    price = close;
  }

  return data;
}

// Generate mock area/line data
export function generateMockLineData(
  points: number = 50,
  startValue: number = 100,
  trend: 'up' | 'down' | 'flat' = 'up',
  seed?: string | number
) {
  const data = [];
  let value = startValue;
  const now = Date.now();
  const interval = (24 * 60 * 60 * 1000) / (points / 30); // Spread across ~30 days

  // Seeded random for consistency
  const baseSeed = typeof seed === 'string'
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : (seed ?? 42);

  const seededRandom = (i: number) => {
    const x = Math.sin(baseSeed + i * 7.13) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < points; i++) {
    const time = toChartTime(new Date(now - (points - i) * interval));
    const random = seededRandom(i);
    const volatility = 0.015;
    const change = (random - 0.5) * volatility * value;
    const bias = trend === 'up' ? 0.002 : trend === 'down' ? -0.002 : 0;
    
    value = Math.max(startValue * 0.7, value + change + bias * value);
    
    data.push({
      time,
      value: parseFloat(value.toFixed(4)),
    });
  }

  return data;
}

