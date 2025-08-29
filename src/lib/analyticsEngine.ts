// Core analytics engine for comprehensive performance and risk analysis
export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  calmarRatio: number;
  volatility: number;
  beta: number;
  alpha: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  bestDay: number;
  worstDay: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface ExecutionMetrics {
  totalSlippage: number;
  averageSlippage: number;
  fillRate: number;
  partialFillRate: number;
  averageFillTime: number;
  marketImpact: number;
  executionCost: number;
  twapPerformance?: number;
  vwapPerformance?: number;
}

export interface RiskMetrics {
  portfolioVaR: number;
  portfolioVaR95: number;
  portfolioVaR99: number;
  expectedShortfall: number;
  concentrationRisk: number;
  correlationRisk: number;
  liquidityRisk: number;
  stressTestResults: StressTestResult[];
}

export interface StressTestResult {
  scenario: string;
  portfolioImpact: number;
  impactPercent: number;
  worstAsset: string;
  worstAssetImpact: number;
}

export interface AssetCorrelation {
  asset1: string;
  asset2: string;
  correlation: number;
  period: string;
}

export interface DailyPerformance {
  date: string;
  portfolioValue: number;
  dailyReturn: number;
  dailyReturnPercent: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  trades: number;
}

export class AnalyticsEngine {
  private performanceHistory: DailyPerformance[] = [];
  private executionData: any[] = [];
  private marketData: Map<string, number[]> = new Map();

  // Performance Analytics
  calculatePerformanceMetrics(history: DailyPerformance[], benchmarkReturns?: number[]): PerformanceMetrics {
    if (history.length === 0) {
      return this.getEmptyMetrics();
    }

    const returns = history.map(h => h.dailyReturnPercent / 100);
    const values = history.map(h => h.portfolioValue);
    const initialValue = values[0];
    const finalValue = values[values.length - 1];

    const totalReturn = finalValue - initialValue;
    const totalReturnPercent = ((finalValue / initialValue) - 1) * 100;

    // Risk-free rate (assumed 2% annually)
    const riskFreeRate = 0.02 / 365;
    const excessReturns = returns.map(r => r - riskFreeRate);

    // Sharpe Ratio
    const avgExcessReturn = this.mean(excessReturns);
    const returnStd = this.standardDeviation(returns);
    const sharpeRatio = returnStd > 0 ? (avgExcessReturn / returnStd) * Math.sqrt(365) : 0;

    // Sortino Ratio (downside deviation)
    const downsideReturns = returns.filter(r => r < 0);
    const downsideStd = downsideReturns.length > 0 ? this.standardDeviation(downsideReturns) : 0;
    const sortinoRatio = downsideStd > 0 ? (avgExcessReturn / downsideStd) * Math.sqrt(365) : 0;

    // Maximum Drawdown
    const drawdowns = this.calculateDrawdowns(values);
    const maxDrawdown = Math.max(...drawdowns.map(d => d.drawdown));
    const maxDrawdownPercent = Math.max(...drawdowns.map(d => d.drawdownPercent));

    // Calmar Ratio
    const annualizedReturn = Math.pow(finalValue / initialValue, 365 / history.length) - 1;
    const calmarRatio = maxDrawdownPercent > 0 ? annualizedReturn / (maxDrawdownPercent / 100) : 0;

    // Volatility (annualized)
    const volatility = returnStd * Math.sqrt(365) * 100;

    // Beta and Alpha (if benchmark provided)
    let beta = 0;
    let alpha = 0;
    if (benchmarkReturns && benchmarkReturns.length === returns.length) {
      beta = this.calculateBeta(returns, benchmarkReturns);
      const avgReturn = this.mean(returns);
      const avgBenchmark = this.mean(benchmarkReturns);
      alpha = (avgReturn - (riskFreeRate + beta * (avgBenchmark - riskFreeRate))) * 365 * 100;
    }

    // Trading Statistics
    const profitableDays = returns.filter(r => r > 0);
    const losingDays = returns.filter(r => r < 0);
    const winRate = returns.length > 0 ? (profitableDays.length / returns.length) * 100 : 0;

    const totalProfits = profitableDays.reduce((sum, r) => sum + r, 0);
    const totalLosses = Math.abs(losingDays.reduce((sum, r) => sum + r, 0));
    const profitFactor = totalLosses > 0 ? totalProfits / totalLosses : 0;

    const averageWin = profitableDays.length > 0 ? totalProfits / profitableDays.length : 0;
    const averageLoss = losingDays.length > 0 ? totalLosses / losingDays.length : 0;

    const bestDay = Math.max(...returns) * 100;
    const worstDay = Math.min(...returns) * 100;

    // Consecutive wins/losses
    const { maxWins, maxLosses } = this.calculateConsecutiveWinsLosses(returns);

    return {
      totalReturn,
      totalReturnPercent,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      maxDrawdownPercent,
      calmarRatio,
      volatility,
      beta,
      alpha,
      winRate,
      profitFactor,
      averageWin: averageWin * 100,
      averageLoss: averageLoss * 100,
      bestDay,
      worstDay,
      consecutiveWins: maxWins,
      consecutiveLosses: maxLosses,
    };
  }

  // Risk Analytics
  calculateRiskMetrics(portfolioData: any[], correlationMatrix?: AssetCorrelation[]): RiskMetrics {
    const returns = portfolioData.map(p => p.dailyReturnPercent / 100);
    
    // Value at Risk calculations
    const portfolioVaR = this.calculateVaR(returns, 0.90) * 100;
    const portfolioVaR95 = this.calculateVaR(returns, 0.95) * 100;
    const portfolioVaR99 = this.calculateVaR(returns, 0.99) * 100;

    // Expected Shortfall (Conditional VaR)
    const expectedShortfall = this.calculateExpectedShortfall(returns, 0.95) * 100;

    // Risk assessments
    const concentrationRisk = this.calculateConcentrationRisk(portfolioData);
    const correlationRisk = correlationMatrix ? this.calculateCorrelationRisk(correlationMatrix) : 0;
    const liquidityRisk = this.calculateLiquidityRisk(portfolioData);

    // Stress test scenarios
    const stressTestResults = this.runStressTests(portfolioData);

    return {
      portfolioVaR,
      portfolioVaR95,
      portfolioVaR99,
      expectedShortfall,
      concentrationRisk,
      correlationRisk,
      liquidityRisk,
      stressTestResults,
    };
  }

  // Execution Analytics
  calculateExecutionMetrics(executionData: any[]): ExecutionMetrics {
    if (executionData.length === 0) {
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

    const totalSlippage = executionData.reduce((sum, trade) => sum + (trade.slippage || 0), 0);
    const averageSlippage = totalSlippage / executionData.length;

    const filledOrders = executionData.filter(trade => trade.filled);
    const partiallyFilled = executionData.filter(trade => trade.partiallyFilled);
    
    const fillRate = (filledOrders.length / executionData.length) * 100;
    const partialFillRate = (partiallyFilled.length / executionData.length) * 100;

    const averageFillTime = this.mean(executionData.map(trade => trade.fillTime || 0));
    const marketImpact = this.mean(executionData.map(trade => trade.marketImpact || 0));
    const executionCost = executionData.reduce((sum, trade) => sum + (trade.fees || 0), 0);

    return {
      totalSlippage,
      averageSlippage,
      fillRate,
      partialFillRate,
      averageFillTime,
      marketImpact,
      executionCost,
    };
  }

  // Asset Correlation Analysis
  calculateAssetCorrelations(assets: string[], priceHistory: Map<string, number[]>): AssetCorrelation[] {
    const correlations: AssetCorrelation[] = [];

    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const asset1 = assets[i];
        const asset2 = assets[j];
        
        const prices1 = priceHistory.get(asset1);
        const prices2 = priceHistory.get(asset2);

        if (prices1 && prices2 && prices1.length === prices2.length) {
          const returns1 = this.calculateReturns(prices1);
          const returns2 = this.calculateReturns(prices2);
          const correlation = this.calculateCorrelation(returns1, returns2);

          correlations.push({
            asset1,
            asset2,
            correlation,
            period: '30D',
          });
        }
      }
    }

    return correlations;
  }

  // Helper methods
  private getEmptyMetrics(): PerformanceMetrics {
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

  private mean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.mean(values);
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  private calculateDrawdowns(values: number[]): { drawdown: number; drawdownPercent: number }[] {
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

  private calculateBeta(returns: number[], benchmarkReturns: number[]): number {
    if (returns.length !== benchmarkReturns.length) return 0;

    const covariance = this.calculateCovariance(returns, benchmarkReturns);
    const benchmarkVariance = Math.pow(this.standardDeviation(benchmarkReturns), 2);

    return benchmarkVariance > 0 ? covariance / benchmarkVariance : 0;
  }

  private calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length) return 0;

    const meanX = this.mean(x);
    const meanY = this.mean(y);

    const covariance = x.reduce((sum, xi, i) => {
      return sum + (xi - meanX) * (y[i] - meanY);
    }, 0);

    return covariance / (x.length - 1);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const covariance = this.calculateCovariance(x, y);
    const stdX = this.standardDeviation(x);
    const stdY = this.standardDeviation(y);

    return (stdX > 0 && stdY > 0) ? covariance / (stdX * stdY) : 0;
  }

  private calculateConsecutiveWinsLosses(returns: number[]): { maxWins: number; maxLosses: number } {
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    for (const ret of returns) {
      if (ret > 0) {
        currentWins++;
        currentLosses = 0;
        maxWins = Math.max(maxWins, currentWins);
      } else if (ret < 0) {
        currentLosses++;
        currentWins = 0;
        maxLosses = Math.max(maxLosses, currentLosses);
      } else {
        currentWins = 0;
        currentLosses = 0;
      }
    }

    return { maxWins, maxLosses };
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private calculateExpectedShortfall(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, index);
    return tailReturns.length > 0 ? this.mean(tailReturns) : 0;
  }

  private calculateConcentrationRisk(portfolioData: any[]): number {
    if (portfolioData.length === 0) return 0;
    
    const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0);
    const weights = portfolioData.map(asset => asset.value / totalValue);
    
    // Herfindahl-Hirschman Index
    const hhi = weights.reduce((sum, weight) => sum + Math.pow(weight, 2), 0);
    return hhi * 100; // Convert to percentage
  }

  private calculateCorrelationRisk(correlations: AssetCorrelation[]): number {
    if (correlations.length === 0) return 0;
    
    const avgCorrelation = this.mean(correlations.map(c => Math.abs(c.correlation)));
    return avgCorrelation * 100; // Convert to percentage
  }

  private calculateLiquidityRisk(portfolioData: any[]): number {
    // Simplified liquidity risk based on asset concentration
    return this.calculateConcentrationRisk(portfolioData) * 0.5;
  }

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
      returns.push(ret);
    }
    return returns;
  }

  private runStressTests(portfolioData: any[]): StressTestResult[] {
    const scenarios = [
      { name: "Market Crash (-20%)", impact: -0.20 },
      { name: "Crypto Bear Market (-50%)", impact: -0.50 },
      { name: "Flash Crash (-15%)", impact: -0.15 },
      { name: "Regulatory Shock (-30%)", impact: -0.30 },
    ];

    return scenarios.map(scenario => {
      const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0);
      const portfolioImpact = totalValue * scenario.impact;
      const impactPercent = scenario.impact * 100;

      // Find worst affected asset (simplified)
      const worstAsset = portfolioData.length > 0 ? portfolioData[0] : null;
      const worstAssetImpact = worstAsset ? worstAsset.value * scenario.impact : 0;

      return {
        scenario: scenario.name,
        portfolioImpact,
        impactPercent,
        worstAsset: worstAsset?.symbol || "N/A",
        worstAssetImpact,
      };
    });
  }
}

export const analyticsEngine = new AnalyticsEngine();