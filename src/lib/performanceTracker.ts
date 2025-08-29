// Historical performance tracking and portfolio snapshots
export interface PortfolioSnapshot {
  id: string;
  timestamp: Date;
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  realizedPnL: number;
  unrealizedPnL: number;
  assetCount: number;
  assets: AssetSnapshot[];
  metadata: {
    trades: number;
    fees: number;
    bestAsset?: string;
    worstAsset?: string;
  };
}

export interface AssetSnapshot {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  costBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weight: number; // percentage of portfolio
}

export interface PerformanceHistory {
  dailySnapshots: PortfolioSnapshot[];
  weeklySnapshots: PortfolioSnapshot[];
  monthlySnapshots: PortfolioSnapshot[];
  benchmarkData?: BenchmarkData[];
}

export interface BenchmarkData {
  date: Date;
  sp500: number;
  bitcoin: number;
  ethereum: number;
  totalCrypto: number;
}

export interface PerformanceComparison {
  timeframe: string;
  portfolioReturn: number;
  portfolioReturnPercent: number;
  sp500Return: number;
  sp500ReturnPercent: number;
  bitcoinReturn: number;
  bitcoinReturnPercent: number;
  ethereumReturn: number;
  ethereumReturnPercent: number;
  outperformance: {
    vsSP500: number;
    vsBitcoin: number;
    vsEthereum: number;
  };
}

export class PerformanceTracker {
  private snapshots: PortfolioSnapshot[] = [];
  private benchmarkData: BenchmarkData[] = [];

  // Create portfolio snapshot
  async createSnapshot(portfolioData: any): Promise<PortfolioSnapshot> {
    const snapshot: PortfolioSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      totalValue: portfolioData.totalValue || 0,
      totalInvested: portfolioData.totalInvested || 0,
      totalPnL: portfolioData.totalPnL || 0,
      totalPnLPercent: portfolioData.totalPnLPercent || 0,
      realizedPnL: portfolioData.realizedPnL || 0,
      unrealizedPnL: portfolioData.unrealizedPnL || 0,
      assetCount: portfolioData.assets?.length || 0,
      assets: this.createAssetSnapshots(portfolioData.assets || [], portfolioData.totalValue || 0),
      metadata: {
        trades: portfolioData.totalTrades || 0,
        fees: portfolioData.totalFees || 0,
        bestAsset: this.findBestPerformingAsset(portfolioData.assets || []),
        worstAsset: this.findWorstPerformingAsset(portfolioData.assets || []),
      },
    };

    this.snapshots.push(snapshot);
    await this.persistSnapshot(snapshot);
    return snapshot;
  }

  // Get performance history
  getPerformanceHistory(timeframe: 'all' | '1Y' | '6M' | '3M' | '1M' = 'all'): PerformanceHistory {
    const cutoffDate = this.getCutoffDate(timeframe);
    const filteredSnapshots = this.snapshots.filter(s => s.timestamp >= cutoffDate);

    return {
      dailySnapshots: this.getDailySnapshots(filteredSnapshots),
      weeklySnapshots: this.getWeeklySnapshots(filteredSnapshots),
      monthlySnapshots: this.getMonthlySnapshots(filteredSnapshots),
      benchmarkData: this.benchmarkData.filter(b => b.date >= cutoffDate),
    };
  }

  // Performance comparison vs benchmarks
  calculatePerformanceComparison(timeframe: string): PerformanceComparison {
    const history = this.getPerformanceHistory(timeframe as any);
    const snapshots = history.dailySnapshots;
    const benchmarks = history.benchmarkData || [];

    if (snapshots.length < 2 || benchmarks.length < 2) {
      return this.getEmptyComparison(timeframe);
    }

    const startSnapshot = snapshots[0];
    const endSnapshot = snapshots[snapshots.length - 1];
    const startBenchmark = benchmarks[0];
    const endBenchmark = benchmarks[benchmarks.length - 1];

    const portfolioReturn = endSnapshot.totalValue - startSnapshot.totalValue;
    const portfolioReturnPercent = startSnapshot.totalValue > 0 
      ? ((endSnapshot.totalValue / startSnapshot.totalValue) - 1) * 100 
      : 0;

    const sp500Return = endBenchmark.sp500 - startBenchmark.sp500;
    const sp500ReturnPercent = startBenchmark.sp500 > 0 
      ? ((endBenchmark.sp500 / startBenchmark.sp500) - 1) * 100 
      : 0;

    const bitcoinReturn = endBenchmark.bitcoin - startBenchmark.bitcoin;
    const bitcoinReturnPercent = startBenchmark.bitcoin > 0 
      ? ((endBenchmark.bitcoin / startBenchmark.bitcoin) - 1) * 100 
      : 0;

    const ethereumReturn = endBenchmark.ethereum - startBenchmark.ethereum;
    const ethereumReturnPercent = startBenchmark.ethereum > 0 
      ? ((endBenchmark.ethereum / startBenchmark.ethereum) - 1) * 100 
      : 0;

    return {
      timeframe,
      portfolioReturn,
      portfolioReturnPercent,
      sp500Return,
      sp500ReturnPercent,
      bitcoinReturn,
      bitcoinReturnPercent,
      ethereumReturn,
      ethereumReturnPercent,
      outperformance: {
        vsSP500: portfolioReturnPercent - sp500ReturnPercent,
        vsBitcoin: portfolioReturnPercent - bitcoinReturnPercent,
        vsEthereum: portfolioReturnPercent - ethereumReturnPercent,
      },
    };
  }

  // Track individual asset performance over time
  getAssetPerformanceHistory(symbol: string, timeframe: string = '1M'): AssetSnapshot[] {
    const history = this.getPerformanceHistory(timeframe as any);
    return history.dailySnapshots
      .map(snapshot => snapshot.assets.find(asset => asset.symbol === symbol))
      .filter(asset => asset !== undefined) as AssetSnapshot[];
  }

  // Calculate portfolio attribution
  calculatePerformanceAttribution(timeframe: string = '1M'): any {
    const history = this.getPerformanceHistory(timeframe as any);
    const snapshots = history.dailySnapshots;

    if (snapshots.length < 2) return null;

    const startSnapshot = snapshots[0];
    const endSnapshot = snapshots[snapshots.length - 1];

    const attribution = endSnapshot.assets.map(endAsset => {
      const startAsset = startSnapshot.assets.find(a => a.symbol === endAsset.symbol);
      if (!startAsset) return null;

      const contribution = (endAsset.value - startAsset.value) / startSnapshot.totalValue * 100;
      const assetReturn = startAsset.value > 0 
        ? ((endAsset.value / startAsset.value) - 1) * 100 
        : 0;

      return {
        symbol: endAsset.symbol,
        contribution,
        assetReturn,
        weight: endAsset.weight,
        startWeight: startAsset.weight,
      };
    }).filter(attr => attr !== null);

    return attribution;
  }

  // Risk-adjusted returns
  calculateRiskAdjustedMetrics(timeframe: string = '1M'): any {
    const history = this.getPerformanceHistory(timeframe as any);
    const snapshots = history.dailySnapshots;

    if (snapshots.length < 30) return null; // Need at least 30 days for meaningful metrics

    const returns = [];
    for (let i = 1; i < snapshots.length; i++) {
      const dailyReturn = snapshots[i - 1].totalValue > 0 
        ? (snapshots[i].totalValue / snapshots[i - 1].totalValue) - 1 
        : 0;
      returns.push(dailyReturn);
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = volatility > 0 ? (avgReturn - 0.02/365) / volatility * Math.sqrt(365) : 0;

    const maxDrawdown = this.calculateMaxDrawdown(snapshots.map(s => s.totalValue));

    return {
      averageDailyReturn: avgReturn * 100,
      annualizedReturn: (Math.pow(1 + avgReturn, 365) - 1) * 100,
      volatility: volatility * Math.sqrt(365) * 100,
      sharpeRatio,
      maxDrawdown: maxDrawdown.maxDrawdownPercent,
      calmarRatio: maxDrawdown.maxDrawdownPercent > 0 
        ? (Math.pow(1 + avgReturn, 365) - 1) / (maxDrawdown.maxDrawdownPercent / 100)
        : 0,
    };
  }

  // Private helper methods
  private createAssetSnapshots(assets: any[], totalValue: number): AssetSnapshot[] {
    return assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      amount: asset.amount,
      price: asset.currentPrice || asset.price || 0,
      value: asset.currentValue || asset.value || 0,
      costBasis: asset.averagePrice * asset.amount,
      unrealizedPnL: asset.unrealizedPnL || 0,
      unrealizedPnLPercent: asset.profitLossPercent || 0,
      weight: totalValue > 0 ? ((asset.currentValue || asset.value || 0) / totalValue) * 100 : 0,
    }));
  }

  private findBestPerformingAsset(assets: any[]): string | undefined {
    if (assets.length === 0) return undefined;
    return assets.reduce((best, current) => 
      (current.profitLossPercent || 0) > (best.profitLossPercent || 0) ? current : best
    ).symbol;
  }

  private findWorstPerformingAsset(assets: any[]): string | undefined {
    if (assets.length === 0) return undefined;
    return assets.reduce((worst, current) => 
      (current.profitLossPercent || 0) < (worst.profitLossPercent || 0) ? current : worst
    ).symbol;
  }

  private getCutoffDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1M': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3M': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6M': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1Y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }

  private getDailySnapshots(snapshots: PortfolioSnapshot[]): PortfolioSnapshot[] {
    // Return one snapshot per day (latest snapshot of each day)
    const dailyMap = new Map<string, PortfolioSnapshot>();
    
    snapshots.forEach(snapshot => {
      const dateKey = snapshot.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey);
      if (!existing || snapshot.timestamp > existing.timestamp) {
        dailyMap.set(dateKey, snapshot);
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getWeeklySnapshots(snapshots: PortfolioSnapshot[]): PortfolioSnapshot[] {
    // Return one snapshot per week (latest snapshot of each week)
    const weeklyMap = new Map<string, PortfolioSnapshot>();
    
    snapshots.forEach(snapshot => {
      const weekStart = new Date(snapshot.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey);
      if (!existing || snapshot.timestamp > existing.timestamp) {
        weeklyMap.set(weekKey, snapshot);
      }
    });

    return Array.from(weeklyMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getMonthlySnapshots(snapshots: PortfolioSnapshot[]): PortfolioSnapshot[] {
    // Return one snapshot per month (latest snapshot of each month)
    const monthlyMap = new Map<string, PortfolioSnapshot>();
    
    snapshots.forEach(snapshot => {
      const monthKey = `${snapshot.timestamp.getFullYear()}-${snapshot.timestamp.getMonth()}`;
      const existing = monthlyMap.get(monthKey);
      if (!existing || snapshot.timestamp > existing.timestamp) {
        monthlyMap.set(monthKey, snapshot);
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getEmptyComparison(timeframe: string): PerformanceComparison {
    return {
      timeframe,
      portfolioReturn: 0,
      portfolioReturnPercent: 0,
      sp500Return: 0,
      sp500ReturnPercent: 0,
      bitcoinReturn: 0,
      bitcoinReturnPercent: 0,
      ethereumReturn: 0,
      ethereumReturnPercent: 0,
      outperformance: {
        vsSP500: 0,
        vsBitcoin: 0,
        vsEthereum: 0,
      },
    };
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDeviations = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDeviations.reduce((sum, sq) => sum + sq, 0) / (returns.length - 1);
    return Math.sqrt(variance);
  }

  private calculateMaxDrawdown(values: number[]): { maxDrawdown: number; maxDrawdownPercent: number } {
    let peak = values[0];
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    for (const value of values) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = peak - value;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    }

    return { maxDrawdown, maxDrawdownPercent };
  }

  private async persistSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
    // In a real implementation, this would save to database
    // For now, we keep in memory
    console.log('Persisting snapshot:', snapshot.id);
  }

  // Mock benchmark data for demonstration
  generateMockBenchmarkData(days: number = 30): void {
    const now = new Date();
    const baseValues = {
      sp500: 4500,
      bitcoin: 45000,
      ethereum: 3000,
      totalCrypto: 2000000000000, // Market cap
    };

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const randomFactor = () => 0.98 + Math.random() * 0.04; // ±2% daily variation

      this.benchmarkData.push({
        date,
        sp500: baseValues.sp500 * Math.pow(randomFactor(), days - i),
        bitcoin: baseValues.bitcoin * Math.pow(randomFactor(), days - i),
        ethereum: baseValues.ethereum * Math.pow(randomFactor(), days - i),
        totalCrypto: baseValues.totalCrypto * Math.pow(randomFactor(), days - i),
      });
    }
  }
}

export const performanceTracker = new PerformanceTracker();
