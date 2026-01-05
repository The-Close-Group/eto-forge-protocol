import { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

export interface PerformanceMetrics {
  // Returns
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  
  // Risk Metrics
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  // Trading Metrics
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  totalTrades: number;
  
  // Time Period Metrics
  bestDay: number;
  worstDay: number;
  bestMonth: number;
  worstMonth: number;
  
  // Portfolio Metrics
  diversificationRatio: number;
  concentration: number;
  turnover: number;
}

export interface ChartData {
  date: string;
  portfolioValue: number;
  cumulativeReturn: number;
  dailyReturn: number;
  drawdown: number;
}

export interface BenchmarkComparison {
  name: string;
  return: number;
  volatility: number;
  sharpe: number;
  correlation: number;
}

export function usePerformanceMetrics(timeframe: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M') {
  const { assets, totalValue, totalInvested, totalProfitLoss, totalRealizedPnL } = usePortfolio();
  const [isLoading, setIsLoading] = useState(true);

  // Generate realistic portfolio performance data
  const chartData = useMemo(() => {
    const days = timeframe === '1M' ? 30 : 
                 timeframe === '3M' ? 90 : 
                 timeframe === '6M' ? 180 : 
                 timeframe === '1Y' ? 365 : 90;

    const data: ChartData[] = [];
    const startValue = totalInvested || 10000;
    let currentValue = startValue;
    let peak = startValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic daily returns with some volatility clustering
      const baseVolatility = 0.02; // 2% base daily volatility
      const trend = Math.sin(i / days * Math.PI) * 0.001; // Slight trend component
      const dailyReturn = trend + (Math.random() - 0.5) * baseVolatility * 2;
      
      currentValue = Math.max(currentValue * (1 + dailyReturn), startValue * 0.3); // Don't go below 30%
      peak = Math.max(peak, currentValue);
      
      const drawdown = peak > 0 ? ((peak - currentValue) / peak) * 100 : 0;
      const cumulativeReturn = startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0;

      data.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: currentValue,
        cumulativeReturn,
        dailyReturn: dailyReturn * 100,
        drawdown: drawdown,
      });
    }

    return data;
  }, [timeframe, totalInvested]);

  // Calculate performance metrics
  const metrics = useMemo((): PerformanceMetrics => {
    if (chartData.length === 0) {
      return getEmptyMetrics();
    }

    const returns = chartData.slice(1).map((d, i) => {
      const previousValue = chartData[i].portfolioValue;
      return previousValue > 0 ? (d.portfolioValue - previousValue) / previousValue : 0;
    });

    const values = chartData.map(d => d.portfolioValue);
    const startValue = values[0];
    const endValue = values[values.length - 1];

    // Basic return metrics
    const totalReturn = endValue - startValue;
    const totalReturnPercent = startValue > 0 ? (totalReturn / startValue) * 100 : 0;
    const annualizedReturn = chartData.length > 0 ? 
      (Math.pow(endValue / startValue, 365 / chartData.length) - 1) * 100 : 0;

    // Risk metrics
    const volatility = calculateVolatility(returns) * Math.sqrt(365) * 100; // Annualized
    const riskFreeRate = 2; // 2% annual risk-free rate
    const excessReturn = annualizedReturn - riskFreeRate;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    // Sortino ratio (downside deviation)
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVolatility = downsideReturns.length > 0 ? 
      calculateVolatility(downsideReturns) * Math.sqrt(365) * 100 : 0;
    const sortinoRatio = downsideVolatility > 0 ? excessReturn / downsideVolatility : 0;

    // Drawdown metrics
    const drawdowns = calculateDrawdowns(values);
    const maxDrawdown = Math.max(...drawdowns.map(d => d.drawdown));
    const maxDrawdownPercent = Math.max(...drawdowns.map(d => d.drawdownPercent));

    // Trading metrics (simplified)
    const profitableDays = returns.filter(r => r > 0);
    const losingDays = returns.filter(r => r < 0);
    const winRate = returns.length > 0 ? (profitableDays.length / returns.length) * 100 : 0;

    const totalProfits = profitableDays.reduce((sum, r) => sum + r, 0);
    const totalLosses = Math.abs(losingDays.reduce((sum, r) => sum + r, 0));
    const profitFactor = totalLosses > 0 ? totalProfits / totalLosses : 0;

    const averageWin = profitableDays.length > 0 ? 
      (totalProfits / profitableDays.length) * 100 : 0;
    const averageLoss = losingDays.length > 0 ? 
      (totalLosses / losingDays.length) * 100 : 0;

    // Best/worst periods
    const bestDay = Math.max(...returns) * 100;
    const worstDay = Math.min(...returns) * 100;

    // Monthly returns for best/worst month calculation
    const monthlyReturns = calculateMonthlyReturns(chartData);
    const bestMonth = monthlyReturns.length > 0 ? Math.max(...monthlyReturns) : 0;
    const worstMonth = monthlyReturns.length > 0 ? Math.min(...monthlyReturns) : 0;

    // Portfolio metrics
    const diversificationRatio = calculateDiversificationRatio(assets);
    const concentration = calculateConcentration(assets, totalValue);
    const turnover = 25; // Simplified turnover estimate

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      maxDrawdownPercent,
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      totalTrades: returns.length,
      bestDay,
      worstDay,
      bestMonth,
      worstMonth,
      diversificationRatio,
      concentration,
      turnover,
    };
  }, [chartData, assets, totalValue]);

  // Benchmark comparisons
  const benchmarkComparisons = useMemo((): BenchmarkComparison[] => {
    return [
      {
        name: 'S&P 500',
        return: 12.5, // Annual return %
        volatility: 16.2,
        sharpe: 0.77,
        correlation: 0.65,
      },
      {
        name: 'Bitcoin',
        return: 45.2,
        volatility: 85.6,
        sharpe: 0.53,
        correlation: 0.82,
      },
      {
        name: 'Ethereum',
        return: 67.8,
        volatility: 95.4,
        sharpe: 0.71,
        correlation: 0.89,
      },
      {
        name: 'Total Crypto Market',
        return: 38.5,
        volatility: 78.3,
        sharpe: 0.49,
        correlation: 0.91,
      },
    ];
  }, []);

  // Risk-adjusted metrics
  const riskAdjustedMetrics = useMemo(() => {
    const { sharpeRatio, sortinoRatio, maxDrawdownPercent, volatility } = metrics;
    
    return {
      informationRatio: sharpeRatio * 0.85, // Simplified calculation
      calmarRatio: maxDrawdownPercent > 0 ? metrics.annualizedReturn / maxDrawdownPercent : 0,
      sterlingRatio: maxDrawdownPercent > 0 ? 
        (metrics.annualizedReturn - 10) / maxDrawdownPercent : 0, // Excess return over 10%
      treynorRatio: metrics.annualizedReturn / 1.2, // Assuming beta of 1.2
      ulcerIndex: Math.sqrt(chartData.reduce((sum, d) => sum + Math.pow(d.drawdown, 2), 0) / chartData.length),
    };
  }, [metrics, chartData]);

  useEffect(() => {
    setIsLoading(false);
  }, [chartData, metrics]);

  return {
    metrics,
    chartData,
    benchmarkComparisons,
    riskAdjustedMetrics,
    isLoading,
    timeframe,
  };
}

// Helper functions
function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const squaredDeviations = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDeviations.reduce((sum, sq) => sum + sq, 0) / (returns.length - 1);
  
  return Math.sqrt(variance);
}

function calculateDrawdowns(values: number[]): { drawdown: number; drawdownPercent: number }[] {
  const drawdowns = [];
  let peak = values[0];

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = peak - value;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    drawdowns.push({ drawdown, drawdownPercent });
  }

  return drawdowns;
}

function calculateMonthlyReturns(chartData: ChartData[]): number[] {
  const monthlyData = new Map<string, { start: number; end: number }>();

  chartData.forEach(d => {
    const monthKey = d.date.substring(0, 7); // YYYY-MM
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { start: d.portfolioValue, end: d.portfolioValue });
    } else {
      const existing = monthlyData.get(monthKey)!;
      monthlyData.set(monthKey, { start: existing.start, end: d.portfolioValue });
    }
  });

  return Array.from(monthlyData.values()).map(({ start, end }) => 
    start > 0 ? ((end - start) / start) * 100 : 0
  );
}

interface AssetWithValue {
  currentValue: number;
}

function calculateDiversificationRatio(assets: AssetWithValue[]): number {
  if (assets.length <= 1) return 0;
  
  // Simplified diversification ratio
  // In reality, this would use correlation matrix and individual asset volatilities
  const equalWeight = 1 / assets.length;
  const herfindahlIndex = assets.reduce((sum, asset) => {
    const weight = asset.currentValue / assets.reduce((total, a) => total + a.currentValue, 0);
    return sum + Math.pow(weight, 2);
  }, 0);
  
  return (1 / herfindahlIndex) / assets.length; // Normalized to 0-1
}

function calculateConcentration(assets: AssetWithValue[], totalValue: number): number {
  if (assets.length === 0 || totalValue === 0) return 0;
  
  const maxWeight = Math.max(...assets.map(asset => 
    (asset.currentValue || 0) / totalValue
  ));
  
  return maxWeight * 100; // Return as percentage
}

function getEmptyMetrics(): PerformanceMetrics {
  return {
    totalReturn: 0,
    totalReturnPercent: 0,
    annualizedReturn: 0,
    volatility: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    totalTrades: 0,
    bestDay: 0,
    worstDay: 0,
    bestMonth: 0,
    worstMonth: 0,
    diversificationRatio: 0,
    concentration: 0,
    turnover: 0,
  };
}