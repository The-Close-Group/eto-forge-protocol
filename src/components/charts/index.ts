// TradingView Lightweight Charts components
export { default as TVAreaChart } from './TVAreaChart';
export type { TVAreaChartData, TVAreaChartProps } from './TVAreaChart';

export { default as TVSparkline, generateSparklineNumbers } from './TVSparkline';
export type { TVSparklineData, TVSparklineProps } from './TVSparkline';

export { ProTradingChart } from './ProTradingChart';
export type { CandleData as ProCandleData, LineData as ProLineData } from './ProTradingChart';

// Re-export generateSparklineData as alias for generateSparklineNumbers (backwards compat)
export { generateSparklineNumbers as generateSparklineData } from './TVSparkline';

export {
  useLightweightChart,
  getChartTheme,
  generateMockLineData,
  generateMockOHLC,
  toChartTime,
} from './useLightweightChart';
export type { ChartTheme, UseLightweightChartOptions } from './useLightweightChart';

// Legacy components (kept for backwards compatibility)
export { default as PerformanceChart } from './PerformanceChart';
export { OracleDMMChart } from './OracleDMMChart'; // named export
export { default as OracleFreshnessChart } from './OracleFreshnessChart';
export { default as PegStabilityChart } from './PegStabilityChart';
export { default as ReservesDonut } from './ReservesDonut';
export { default as ServiceUptimeRadials } from './ServiceUptimeRadials';

