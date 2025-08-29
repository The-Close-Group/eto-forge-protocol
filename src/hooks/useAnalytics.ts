import { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { analyticsEngine, PerformanceMetrics, ExecutionMetrics, RiskMetrics } from '@/lib/analyticsEngine';
import { performanceTracker, PerformanceHistory, PerformanceComparison } from '@/lib/performanceTracker';
import { riskAnalytics, RiskProfile, RiskAlert, PortfolioRiskMetrics } from '@/lib/riskAnalytics';

export interface AnalyticsData {
  performance: PerformanceMetrics;
  execution: ExecutionMetrics;
  risk: RiskMetrics;
  riskProfile: RiskProfile;
  riskAlerts: RiskAlert[];
  portfolioRiskMetrics: PortfolioRiskMetrics;
  performanceHistory: PerformanceHistory;
  performanceComparison: PerformanceComparison;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export interface AnalyticsFilters {
  timeframe: '1D' | '7D' | '30D' | '90D' | '1Y' | 'ALL';
  includeRealizedPnL: boolean;
  includeUnrealizedPnL: boolean;
  assetFilter?: string[];
}

export function useAnalytics(filters: AnalyticsFilters = { 
  timeframe: '30D', 
  includeRealizedPnL: true, 
  includeUnrealizedPnL: true 
}) {
  const { assets, totalValue, totalInvested, totalProfitLoss, totalRealizedPnL, totalUnrealizedPnL } = usePortfolio();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    performance: getEmptyPerformanceMetrics(),
    execution: getEmptyExecutionMetrics(),
    risk: getEmptyRiskMetrics(),
    riskProfile: getEmptyRiskProfile(),
    riskAlerts: [],
    portfolioRiskMetrics: getEmptyPortfolioRiskMetrics(),
    performanceHistory: { dailySnapshots: [], weeklySnapshots: [], monthlySnapshots: [] },
    performanceComparison: getEmptyPerformanceComparison(),
    isLoading: true,
    lastUpdated: null,
  });

  // Generate mock performance history for demonstration
  const mockPerformanceHistory = useMemo(() => {
    const history = [];
    const days = filters.timeframe === '1D' ? 1 : 
                 filters.timeframe === '7D' ? 7 :
                 filters.timeframe === '30D' ? 30 :
                 filters.timeframe === '90D' ? 90 :
                 filters.timeframe === '1Y' ? 365 : 90;

    const baseValue = totalInvested || 10000;
    let currentValue = baseValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic daily changes
      const dailyChange = (Math.random() - 0.5) * 0.04; // ±2% daily
      currentValue = Math.max(currentValue * (1 + dailyChange), baseValue * 0.5); // Don't go below 50% of initial
      
      const dailyReturn = i < days ? (currentValue / history[history.length - 1]?.portfolioValue - 1) : 0;
      
      history.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: currentValue,
        dailyReturn: dailyReturn * currentValue,
        dailyReturnPercent: dailyReturn * 100,
        unrealizedPnL: (totalUnrealizedPnL || 0) * (0.8 + Math.random() * 0.4), // Vary unrealized P&L
        realizedPnL: (totalRealizedPnL || 0) * Math.min(i / days, 1), // Cumulative realized P&L
        totalPnL: currentValue - baseValue,
        trades: Math.floor(Math.random() * 5), // 0-4 trades per day
      });
    }

    return history;
  }, [filters.timeframe, totalInvested, totalRealizedPnL, totalUnrealizedPnL]);

  // Mock execution data
  const mockExecutionData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `trade_${i}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Every hour
      symbol: ['BTC', 'ETH', 'AVAX', 'USDC'][Math.floor(Math.random() * 4)],
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: Math.random() * 1000 + 100,
      price: Math.random() * 50000 + 1000,
      slippage: Math.random() * 0.005, // 0-0.5% slippage
      filled: Math.random() > 0.1, // 90% fill rate
      partiallyFilled: Math.random() > 0.8, // 20% partial fill rate
      fillTime: Math.random() * 30 + 1, // 1-30 seconds
      marketImpact: Math.random() * 0.002, // 0-0.2% market impact
      fees: Math.random() * 10 + 1, // $1-10 fees
    }));
  }, []);

  // Calculate analytics
  useEffect(() => {
    const calculateAnalytics = async () => {
      setAnalyticsData(prev => ({ ...prev, isLoading: true }));

      try {
        // Portfolio data for analytics
        const portfolioData = {
          assets,
          totalValue,
          totalInvested,
          totalPnL: totalProfitLoss,
          totalRealizedPnL,
          totalUnrealizedPnL,
          totalTrades: mockExecutionData.length,
          totalFees: mockExecutionData.reduce((sum, trade) => sum + trade.fees, 0),
        };

        // Calculate performance metrics
        const performance = analyticsEngine.calculatePerformanceMetrics(mockPerformanceHistory);

        // Calculate execution metrics
        const execution = analyticsEngine.calculateExecutionMetrics(mockExecutionData);

        // Calculate risk metrics
        const risk = analyticsEngine.calculateRiskMetrics(mockPerformanceHistory);

        // Assess portfolio risk
        const riskProfile = riskAnalytics.assessPortfolioRisk(portfolioData);

        // Monitor risk alerts
        const riskAlerts = riskAnalytics.monitorRiskLimits(portfolioData);

        // Calculate portfolio risk metrics
        const portfolioRiskMetrics = riskAnalytics.calculatePortfolioRiskMetrics(
          portfolioData,
          new Map() // Empty price history for now
        );

        // Create portfolio snapshot
        await performanceTracker.createSnapshot(portfolioData);

        // Get performance history
        const performanceHistory = performanceTracker.getPerformanceHistory(
          filters.timeframe === '1Y' ? '1Y' : 
          filters.timeframe === '90D' ? '6M' : 
          filters.timeframe === '30D' ? '3M' : '1M'
        );

        // Calculate performance comparison
        const performanceComparison = performanceTracker.calculatePerformanceComparison(
          filters.timeframe === '1Y' ? '1Y' : 
          filters.timeframe === '90D' ? '6M' : 
          filters.timeframe === '30D' ? '3M' : '1M'
        );

        setAnalyticsData({
          performance,
          execution,
          risk,
          riskProfile,
          riskAlerts,
          portfolioRiskMetrics,
          performanceHistory,
          performanceComparison,
          isLoading: false,
          lastUpdated: new Date(),
        });

      } catch (error) {
        console.error('Error calculating analytics:', error);
        setAnalyticsData(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Initialize mock benchmark data
    if (mockPerformanceHistory.length > 0) {
      performanceTracker.generateMockBenchmarkData(mockPerformanceHistory.length);
    }

    calculateAnalytics();
  }, [assets, totalValue, totalInvested, totalProfitLoss, totalRealizedPnL, totalUnrealizedPnL, filters, mockPerformanceHistory, mockExecutionData]);

  // Refresh analytics data
  const refreshAnalytics = () => {
    setAnalyticsData(prev => ({ ...prev, lastUpdated: null }));
  };

  // Get specific timeframe data
  const getTimeframeData = (timeframe: string) => {
    return mockPerformanceHistory.slice(-getTimeframeDays(timeframe));
  };

  // Calculate period-over-period metrics
  const getPeriodComparison = (metric: keyof PerformanceMetrics, period: 'day' | 'week' | 'month' = 'day') => {
    // Simplified comparison - in production this would compare actual periods
    const currentValue = analyticsData.performance[metric];
    const previousValue = typeof currentValue === 'number' ? currentValue * (0.95 + Math.random() * 0.1) : 0;
    const change = typeof currentValue === 'number' ? currentValue - previousValue : 0;
    const changePercent = previousValue !== 0 ? (change / Math.abs(previousValue)) * 100 : 0;

    return {
      current: currentValue,
      previous: previousValue,
      change,
      changePercent,
      isPositive: change >= 0,
    };
  };

  return {
    ...analyticsData,
    refreshAnalytics,
    getTimeframeData,
    getPeriodComparison,
    filters,
    mockPerformanceHistory, // For chart components
  };
}

// Helper functions
function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '1D': return 1;
    case '7D': return 7;
    case '30D': return 30;
    case '90D': return 90;
    case '1Y': return 365;
    default: return 30;
  }
}

function getEmptyPerformanceMetrics(): PerformanceMetrics {
  return {
    totalReturn: 0,
    totalReturnPercent: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    calmarRatio: 0,
    volatility: 0,
    beta: 0,
    alpha: 0,
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    bestDay: 0,
    worstDay: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  };
}

function getEmptyExecutionMetrics(): ExecutionMetrics {
  return {
    totalSlippage: 0,
    averageSlippage: 0,
    fillRate: 100,
    partialFillRate: 0,
    averageFillTime: 0,
    marketImpact: 0,
    executionCost: 0,
  };
}

function getEmptyRiskMetrics(): RiskMetrics {
  return {
    portfolioVaR: 0,
    portfolioVaR95: 0,
    portfolioVaR99: 0,
    expectedShortfall: 0,
    concentrationRisk: 0,
    correlationRisk: 0,
    liquidityRisk: 0,
    stressTestResults: [],
  };
}

function getEmptyRiskProfile(): RiskProfile {
  return {
    overallRisk: 'LOW',
    riskScore: 0,
    concentrationRisk: 0,
    liquidityRisk: 0,
    correlationRisk: 0,
    volatilityRisk: 0,
    drawdownRisk: 0,
    leverageRisk: 0,
  };
}

function getEmptyPortfolioRiskMetrics(): PortfolioRiskMetrics {
  return {
    valueAtRisk: { daily95: 0, daily99: 0, weekly95: 0, weekly99: 0 },
    expectedShortfall: { daily95: 0, weekly95: 0 },
    betaMetrics: { portfolioBeta: 0, activeBeta: 0, betaStability: 0 },
    diversificationMetrics: { diversificationRatio: 0, effectiveAssets: 0, concentrationIndex: 0 },
    liquidityMetrics: { liquidityScore: 0, daysToLiquidate: 0, liquidityPremium: 0 },
  };
}

function getEmptyPerformanceComparison(): PerformanceComparison {
  return {
    timeframe: '30D',
    portfolioReturn: 0,
    portfolioReturnPercent: 0,
    sp500Return: 0,
    sp500ReturnPercent: 0,
    bitcoinReturn: 0,
    bitcoinReturnPercent: 0,
    ethereumReturn: 0,
    ethereumReturnPercent: 0,
    outperformance: { vsSP500: 0, vsBitcoin: 0, vsEthereum: 0 },
  };
}