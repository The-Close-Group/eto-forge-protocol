import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ISeriesApi, UTCTimestamp, AreaSeries } from 'lightweight-charts';
import { 
  useLightweightChart, 
  getChartTheme, 
  generateMockLineData,
  toChartTime 
} from './useLightweightChart';

export interface TVAreaChartData {
  time: UTCTimestamp | number;
  value: number;
}

export interface TVAreaChartProps {
  data?: TVAreaChartData[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTimeScale?: boolean;
  showPriceScale?: boolean;
  showCrosshair?: boolean;
  showTooltip?: boolean;
  lineWidth?: number;
  variant?: 'positive' | 'negative' | 'accent';
  formatValue?: (value: number) => string;
  formatTime?: (time: number) => string;
  onHover?: (data: TVAreaChartData | null) => void;
  // For demo/fallback
  generateDemo?: boolean;
  demoPoints?: number;
  demoTrend?: 'up' | 'down' | 'flat';
  demoSeed?: string | number;
}

export default function TVAreaChart({
  data,
  height = 200,
  className = '',
  showGrid = true,
  showTimeScale = true,
  showPriceScale = true,
  showCrosshair = true,
  showTooltip = true,
  lineWidth = 2,
  variant = 'positive',
  formatValue,
  formatTime,
  onHover,
  generateDemo = false,
  demoPoints = 50,
  demoTrend = 'up',
  demoSeed,
}: TVAreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    value: number;
    time: number;
    x: number;
    y: number;
  } | null>(null);

  // Detect theme
  const isDark = typeof document !== 'undefined'
    ? !document.documentElement.classList.contains('light')
    : true;

  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

  const { chart, isReady } = useLightweightChart(containerRef, {
    height,
    showGrid,
    showTimeScale,
    showPriceScale,
    crosshairMode: showCrosshair ? 'normal' : 'hidden',
    handleScroll: true,
    handleScale: true,
  });

  // Get colors based on variant
  const getSeriesColors = useMemo(() => {
    switch (variant) {
      case 'negative':
        return {
          lineColor: isDark ? '#f87171' : 'hsl(0, 84%, 60%)',
          topColor: isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(239, 68, 68, 0.3)',
          bottomColor: 'rgba(248, 113, 113, 0.0)',
        };
      case 'accent':
        return {
          lineColor: isDark ? '#CDFF00' : '#10B981',
          topColor: isDark ? 'rgba(205, 255, 0, 0.25)' : 'rgba(16, 185, 129, 0.25)',
          bottomColor: 'rgba(205, 255, 0, 0.0)',
        };
      case 'positive':
      default:
        return {
          lineColor: theme.lineColor,
          topColor: theme.areaTopColor,
          bottomColor: theme.areaBottomColor,
        };
    }
  }, [variant, isDark, theme]);

  // Generate or use provided data
  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data;
    }
    if (generateDemo) {
      return generateMockLineData(demoPoints, 100, demoTrend, demoSeed);
    }
    return [];
  }, [data, generateDemo, demoPoints, demoTrend, demoSeed]);

  // Create and update series
  useEffect(() => {
    if (!chart || !isReady) return;

    // Remove existing series if any
    if (seriesRef.current) {
      try {
        chart.removeSeries(seriesRef.current);
      } catch (e) {
        // Series might already be removed
      }
    }

    // Create new area series - v5 API
    const series = chart.addSeries(AreaSeries, {
      lineColor: getSeriesColors.lineColor,
      topColor: getSeriesColors.topColor,
      bottomColor: getSeriesColors.bottomColor,
      lineWidth: lineWidth as 1 | 2 | 3 | 4,
      crosshairMarkerVisible: showCrosshair,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: getSeriesColors.lineColor,
      crosshairMarkerBackgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    seriesRef.current = series;

    // Set data
    if (chartData.length > 0) {
      series.setData(chartData as any);
      chart.timeScale().fitContent();
    }

    // Subscribe to crosshair move for tooltip
    if (showTooltip) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
          setTooltipData(null);
          onHover?.(null);
          return;
        }

        const seriesData = param.seriesData.get(series);
        if (seriesData && 'value' in seriesData) {
          const newData = {
            value: seriesData.value as number,
            time: param.time as number,
            x: param.point.x,
            y: param.point.y,
          };
          setTooltipData(newData);
          onHover?.({ time: param.time as number, value: seriesData.value as number });
        }
      });
    }

    return () => {
      if (seriesRef.current && chart) {
        try {
          chart.removeSeries(seriesRef.current);
        } catch (e) {
          // Chart might be disposed
        }
      }
      seriesRef.current = null;
    };
  }, [chart, isReady, chartData, getSeriesColors, lineWidth, showCrosshair, showTooltip, isDark, onHover]);

  // Update series colors when theme changes
  useEffect(() => {
    if (!seriesRef.current) return;

    seriesRef.current.applyOptions({
      lineColor: getSeriesColors.lineColor,
      topColor: getSeriesColors.topColor,
      bottomColor: getSeriesColors.bottomColor,
      crosshairMarkerBorderColor: getSeriesColors.lineColor,
      crosshairMarkerBackgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    });
  }, [getSeriesColors, isDark]);

  // Format helpers
  const formatDisplayValue = (value: number): string => {
    if (formatValue) return formatValue(value);
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatDisplayTime = (time: number): string => {
    if (formatTime) return formatTime(time);
    return new Date(time * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Floating Tooltip */}
      {showTooltip && tooltipData && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-opacity duration-150"
          style={{
            left: Math.min(tooltipData.x + 12, (containerRef.current?.clientWidth || 0) - 100),
            top: Math.max(tooltipData.y - 40, 10),
            backgroundColor: isDark ? 'hsl(240, 5%, 12%)' : 'white',
            border: `1px solid ${isDark ? 'hsl(240, 4%, 20%)' : 'hsl(214, 32%, 91%)'}`,
            color: isDark ? 'hsl(0, 0%, 96%)' : 'hsl(222, 47%, 11%)',
          }}
        >
          <div className="font-semibold" style={{ color: getSeriesColors.lineColor }}>
            {formatDisplayValue(tooltipData.value)}
          </div>
          <div className="text-[10px] opacity-60 mt-0.5">
            {formatDisplayTime(tooltipData.time)}
          </div>
        </div>
      )}
    </div>
  );
}

