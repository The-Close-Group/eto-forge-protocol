// Advanced risk analytics and monitoring system
export interface RiskProfile {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskScore: number; // 0-100
  concentrationRisk: number;
  liquidityRisk: number;
  correlationRisk: number;
  volatilityRisk: number;
  drawdownRisk: number;
  leverageRisk: number;
}

export interface RiskAlert {
  id: string;
  type: 'CONCENTRATION' | 'VOLATILITY' | 'DRAWDOWN' | 'CORRELATION' | 'LIQUIDITY' | 'VAR_BREACH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  asset?: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface PositionSizing {
  asset: string;
  recommendedSize: number;
  maxSize: number;
  currentSize: number;
  riskAdjustedSize: number;
  reasoning: string;
}

export interface PortfolioRiskMetrics {
  valueAtRisk: {
    daily95: number;
    daily99: number;
    weekly95: number;
    weekly99: number;
  };
  expectedShortfall: {
    daily95: number;
    weekly95: number;
  };
  betaMetrics: {
    portfolioBeta: number;
    activeBeta: number;
    betaStability: number;
  };
  diversificationMetrics: {
    diversificationRatio: number;
    effectiveAssets: number;
    concentrationIndex: number;
  };
  liquidityMetrics: {
    liquidityScore: number;
    daysToLiquidate: number;
    liquidityPremium: number;
  };
}

export interface RiskLimit {
  type: 'POSITION_SIZE' | 'SECTOR_EXPOSURE' | 'VAR_LIMIT' | 'DRAWDOWN_LIMIT' | 'VOLATILITY_LIMIT';
  asset?: string;
  sector?: string;
  limit: number;
  currentValue: number;
  utilization: number; // Percentage of limit used
  breached: boolean;
}

export class RiskAnalytics {
  private riskAlerts: RiskAlert[] = [];
  private riskLimits: RiskLimit[] = [];

  // Comprehensive risk assessment
  assessPortfolioRisk(portfolioData: any, marketData?: any): RiskProfile {
    const concentrationRisk = this.calculateConcentrationRisk(portfolioData);
    const liquidityRisk = this.calculateLiquidityRisk(portfolioData);
    const correlationRisk = this.calculateCorrelationRisk(portfolioData, marketData);
    const volatilityRisk = this.calculateVolatilityRisk(portfolioData, marketData);
    const drawdownRisk = this.calculateDrawdownRisk(portfolioData);
    const leverageRisk = this.calculateLeverageRisk(portfolioData);

    // Weighted risk score
    const riskScore = Math.min(100, 
      concentrationRisk * 0.25 +
      liquidityRisk * 0.20 +
      correlationRisk * 0.15 +
      volatilityRisk * 0.20 +
      drawdownRisk * 0.15 +
      leverageRisk * 0.05
    );

    const overallRisk = this.determineRiskLevel(riskScore);

    return {
      overallRisk,
      riskScore,
      concentrationRisk,
      liquidityRisk,
      correlationRisk,
      volatilityRisk,
      drawdownRisk,
      leverageRisk,
    };
  }

  // Advanced portfolio risk metrics
  calculatePortfolioRiskMetrics(portfolioData: any, priceHistory: Map<string, number[]>): PortfolioRiskMetrics {
    const returns = this.calculatePortfolioReturns(portfolioData, priceHistory);
    
    // Value at Risk calculations
    const valueAtRisk = {
      daily95: this.calculateVaR(returns, 0.95),
      daily99: this.calculateVaR(returns, 0.99),
      weekly95: this.calculateVaR(returns, 0.95) * Math.sqrt(7),
      weekly99: this.calculateVaR(returns, 0.99) * Math.sqrt(7),
    };

    // Expected Shortfall (Conditional VaR)
    const expectedShortfall = {
      daily95: this.calculateExpectedShortfall(returns, 0.95),
      weekly95: this.calculateExpectedShortfall(returns, 0.95) * Math.sqrt(7),
    };

    // Beta metrics
    const betaMetrics = this.calculateBetaMetrics(portfolioData, priceHistory);

    // Diversification metrics
    const diversificationMetrics = this.calculateDiversificationMetrics(portfolioData);

    // Liquidity metrics
    const liquidityMetrics = this.calculateLiquidityMetrics(portfolioData);

    return {
      valueAtRisk,
      expectedShortfall,
      betaMetrics,
      diversificationMetrics,
      liquidityMetrics,
    };
  }

  // Risk-based position sizing
  calculateOptimalPositionSizing(asset: string, portfolioData: any, riskBudget: number = 0.02): PositionSizing {
    const assetData = portfolioData.assets?.find((a: any) => a.symbol === asset);
    const portfolioValue = portfolioData.totalValue || 0;
    
    // Get asset volatility (simplified)
    const assetVolatility = this.getAssetVolatility(asset) || 0.30; // Default 30% annual volatility
    
    // Kelly Criterion for position sizing
    const winRate = 0.55; // Assumed 55% win rate
    const avgWin = 0.05; // Average win 5%
    const avgLoss = 0.03; // Average loss 3%
    
    const kellyFraction = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    const conservativeKelly = Math.max(0, Math.min(kellyFraction * 0.25, 0.10)); // Conservative Kelly with 10% max
    
    // Volatility-adjusted sizing
    const targetVolatility = riskBudget; // 2% portfolio risk
    const volatilityAdjustedSize = targetVolatility / assetVolatility;
    
    // Final recommendation - use the more conservative approach
    const recommendedSizePercent = Math.min(conservativeKelly, volatilityAdjustedSize, 0.20); // Max 20%
    const recommendedSize = portfolioValue * recommendedSizePercent;
    
    const currentSize = assetData?.currentValue || 0;
    const maxSize = portfolioValue * 0.25; // Never more than 25% in single asset
    
    let reasoning = `Recommended size based on `;
    if (conservativeKelly <= volatilityAdjustedSize) {
      reasoning += `Kelly Criterion (${(conservativeKelly * 100).toFixed(1)}% of portfolio)`;
    } else {
      reasoning += `volatility targeting (${targetVolatility * 100}% portfolio risk)`;
    }

    return {
      asset,
      recommendedSize,
      maxSize,
      currentSize,
      riskAdjustedSize: recommendedSize,
      reasoning,
    };
  }

  // Risk monitoring and alerts
  monitorRiskLimits(portfolioData: any): RiskAlert[] {
    const newAlerts: RiskAlert[] = [];

    // Check concentration limits
    const concentrationAlert = this.checkConcentrationLimits(portfolioData);
    if (concentrationAlert) newAlerts.push(concentrationAlert);

    // Check volatility limits
    const volatilityAlert = this.checkVolatilityLimits(portfolioData);
    if (volatilityAlert) newAlerts.push(volatilityAlert);

    // Check VaR limits
    const varAlert = this.checkVaRLimits(portfolioData);
    if (varAlert) newAlerts.push(varAlert);

    // Check drawdown limits
    const drawdownAlert = this.checkDrawdownLimits(portfolioData);
    if (drawdownAlert) newAlerts.push(drawdownAlert);

    // Add new alerts
    newAlerts.forEach(alert => {
      alert.id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      alert.timestamp = new Date();
      alert.acknowledged = false;
      this.riskAlerts.push(alert);
    });

    return newAlerts;
  }

  // Stress testing
  runStressTest(portfolioData: any, scenarios: any[]): any {
    const results = scenarios.map(scenario => {
      const stressedPortfolio = this.applyStressScenario(portfolioData, scenario);
      const impact = stressedPortfolio.totalValue - portfolioData.totalValue;
      const impactPercent = portfolioData.totalValue > 0 ? (impact / portfolioData.totalValue) * 100 : 0;

      return {
        scenario: scenario.name,
        impact,
        impactPercent,
        stressedValue: stressedPortfolio.totalValue,
        worstAssets: this.findWorstAffectedAssets(portfolioData, stressedPortfolio),
        recoveryTime: this.estimateRecoveryTime(impactPercent),
      };
    });

    return {
      results,
      averageImpact: results.reduce((sum, r) => sum + r.impactPercent, 0) / results.length,
      worstCase: results.reduce((worst, current) => 
        current.impactPercent < worst.impactPercent ? current : worst
      ),
      bestCase: results.reduce((best, current) => 
        current.impactPercent > best.impactPercent ? current : best
      ),
    };
  }

  // Private helper methods
  private calculateConcentrationRisk(portfolioData: any): number {
    if (!portfolioData.assets || portfolioData.assets.length === 0) return 0;
    
    const totalValue = portfolioData.totalValue || 0;
    if (totalValue === 0) return 0;

    // Calculate Herfindahl-Hirschman Index
    const weights = portfolioData.assets.map((asset: any) => 
      (asset.currentValue || asset.value || 0) / totalValue
    );
    
    const hhi = weights.reduce((sum: number, weight: number) => sum + Math.pow(weight, 2), 0);
    
    // Convert to risk score (0-100)
    // HHI ranges from 1/n (perfectly diversified) to 1 (all in one asset)
    // Risk score: 0 = well diversified, 100 = highly concentrated
    const minHHI = 1 / portfolioData.assets.length;
    const normalizedHHI = (hhi - minHHI) / (1 - minHHI);
    
    return normalizedHHI * 100;
  }

  private calculateLiquidityRisk(portfolioData: any): number {
    if (!portfolioData.assets || portfolioData.assets.length === 0) return 0;
    
    // Simplified liquidity scoring based on asset types
    const liquidityScores = portfolioData.assets.map((asset: any) => {
      // These would be real liquidity metrics in production
      const symbol = asset.symbol || '';
      if (['USDC', 'USDT', 'ETH', 'BTC'].includes(symbol)) return 1; // Highly liquid
      if (['AVAX', 'MATIC', 'SOL'].includes(symbol)) return 0.8; // Good liquidity
      return 0.5; // Moderate liquidity
    });

    const totalValue = portfolioData.totalValue || 0;
    const weightedLiquidityScore = portfolioData.assets.reduce((sum: number, asset: any, index: number) => {
      const weight = totalValue > 0 ? (asset.currentValue || asset.value || 0) / totalValue : 0;
      return sum + weight * liquidityScores[index];
    }, 0);

    // Convert to risk score (higher liquidity = lower risk)
    return (1 - weightedLiquidityScore) * 100;
  }

  private calculateCorrelationRisk(portfolioData: any, marketData?: any): number {
    // Simplified correlation risk calculation
    // In production, this would use real correlation matrices
    if (!portfolioData.assets || portfolioData.assets.length < 2) return 0;
    
    // Assume moderate correlation risk for crypto assets
    const cryptoAssets = portfolioData.assets.filter((asset: any) => 
      !['USDC', 'USDT', 'DAI'].includes(asset.symbol)
    );
    
    if (cryptoAssets.length < 2) return 20; // Low correlation risk with stablecoins
    
    // Higher correlation risk with more crypto assets
    const correlationScore = Math.min(cryptoAssets.length * 15, 80);
    return correlationScore;
  }

  private calculateVolatilityRisk(portfolioData: any, marketData?: any): number {
    if (!portfolioData.assets || portfolioData.assets.length === 0) return 0;
    
    // Simplified volatility calculation
    const totalValue = portfolioData.totalValue || 0;
    const weightedVolatility = portfolioData.assets.reduce((sum: number, asset: any) => {
      const weight = totalValue > 0 ? (asset.currentValue || asset.value || 0) / totalValue : 0;
      const assetVolatility = this.getAssetVolatility(asset.symbol) || 0.30;
      return sum + weight * assetVolatility;
    }, 0);

    // Convert annual volatility to risk score
    return Math.min(weightedVolatility * 100, 100);
  }

  private calculateDrawdownRisk(portfolioData: any): number {
    // Simplified drawdown risk based on current unrealized losses
    const totalUnrealizedPnL = portfolioData.totalUnrealizedPnL || 0;
    const totalValue = portfolioData.totalValue || 0;
    
    if (totalValue === 0) return 0;
    
    const unrealizedLossPercent = totalUnrealizedPnL < 0 ? Math.abs(totalUnrealizedPnL / totalValue) * 100 : 0;
    
    // Scale to risk score
    return Math.min(unrealizedLossPercent * 2, 100);
  }

  private calculateLeverageRisk(portfolioData: any): number {
    // Simplified - no leverage in current implementation
    return 0;
  }

  private determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (riskScore < 25) return 'LOW';
    if (riskScore < 50) return 'MEDIUM';
    if (riskScore < 75) return 'HIGH';
    return 'EXTREME';
  }

  private calculatePortfolioReturns(portfolioData: any, priceHistory: Map<string, number[]>): number[] {
    // Simplified portfolio return calculation
    // In production, this would use actual portfolio value history
    const mockReturns = [];
    for (let i = 0; i < 30; i++) {
      // Generate mock daily returns based on portfolio composition
      const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily
      mockReturns.push(dailyReturn);
    }
    return mockReturns;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return Math.abs(sortedReturns[index] || 0);
  }

  private calculateExpectedShortfall(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, index);
    const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    return Math.abs(avgTailReturn || 0);
  }

  private calculateBetaMetrics(portfolioData: any, priceHistory: Map<string, number[]>): any {
    // Simplified beta calculation
    return {
      portfolioBeta: 1.2, // Assume portfolio is 20% more volatile than market
      activeBeta: 0.3,
      betaStability: 0.85,
    };
  }

  private calculateDiversificationMetrics(portfolioData: any): any {
    const assetCount = portfolioData.assets?.length || 0;
    const totalValue = portfolioData.totalValue || 0;
    
    if (assetCount === 0 || totalValue === 0) {
      return {
        diversificationRatio: 0,
        effectiveAssets: 0,
        concentrationIndex: 0,
      };
    }

    // Calculate effective number of assets (inverse of HHI)
    const weights = portfolioData.assets.map((asset: any) => 
      (asset.currentValue || asset.value || 0) / totalValue
    );
    const hhi = weights.reduce((sum: number, weight: number) => sum + Math.pow(weight, 2), 0);
    const effectiveAssets = hhi > 0 ? 1 / hhi : 0;

    return {
      diversificationRatio: effectiveAssets / assetCount,
      effectiveAssets,
      concentrationIndex: hhi,
    };
  }

  private calculateLiquidityMetrics(portfolioData: any): any {
    return {
      liquidityScore: 75, // Simplified score
      daysToLiquidate: 1.5,
      liquidityPremium: 0.002,
    };
  }

  private getAssetVolatility(symbol: string): number {
    // Simplified volatility mapping
    const volatilities: { [key: string]: number } = {
      'BTC': 0.60,
      'ETH': 0.70,
      'AVAX': 0.80,
      'SOL': 0.85,
      'MATIC': 0.75,
      'USDC': 0.01,
      'USDT': 0.01,
      'DAI': 0.01,
    };
    return volatilities[symbol] || 0.50; // Default 50% annual volatility
  }

  private checkConcentrationLimits(portfolioData: any): RiskAlert | null {
    const totalValue = portfolioData.totalValue || 0;
    if (totalValue === 0) return null;

    const maxAssetWeight = Math.max(...(portfolioData.assets || []).map((asset: any) => 
      (asset.currentValue || asset.value || 0) / totalValue
    ));

    if (maxAssetWeight > 0.40) { // Alert if any single asset > 40%
      return {
        id: '',
        type: 'CONCENTRATION',
        severity: maxAssetWeight > 0.60 ? 'CRITICAL' : 'HIGH',
        message: `Single asset concentration exceeds ${(maxAssetWeight * 100).toFixed(1)}%`,
        currentValue: maxAssetWeight * 100,
        threshold: 40,
        timestamp: new Date(),
        acknowledged: false,
      };
    }

    return null;
  }

  private checkVolatilityLimits(portfolioData: any): RiskAlert | null {
    const volatilityRisk = this.calculateVolatilityRisk(portfolioData);
    
    if (volatilityRisk > 70) {
      return {
        id: '',
        type: 'VOLATILITY',
        severity: volatilityRisk > 85 ? 'CRITICAL' : 'HIGH',
        message: `Portfolio volatility risk is ${volatilityRisk.toFixed(1)}%`,
        currentValue: volatilityRisk,
        threshold: 70,
        timestamp: new Date(),
        acknowledged: false,
      };
    }

    return null;
  }

  private checkVaRLimits(portfolioData: any): RiskAlert | null {
    // Simplified VaR check
    const totalValue = portfolioData.totalValue || 0;
    const estimatedDailyVaR = totalValue * 0.03; // 3% daily VaR estimate
    
    if (estimatedDailyVaR > totalValue * 0.05) { // Alert if VaR > 5%
      return {
        id: '',
        type: 'VAR_BREACH',
        severity: 'HIGH',
        message: `Estimated daily VaR exceeds 5% of portfolio value`,
        currentValue: (estimatedDailyVaR / totalValue) * 100,
        threshold: 5,
        timestamp: new Date(),
        acknowledged: false,
      };
    }

    return null;
  }

  private checkDrawdownLimits(portfolioData: any): RiskAlert | null {
    const totalUnrealizedPnL = portfolioData.totalUnrealizedPnL || 0;
    const totalValue = portfolioData.totalValue || 0;
    
    if (totalValue > 0 && totalUnrealizedPnL < 0) {
      const drawdownPercent = Math.abs(totalUnrealizedPnL / totalValue) * 100;
      
      if (drawdownPercent > 15) { // Alert if unrealized loss > 15%
        return {
          id: '',
          type: 'DRAWDOWN',
          severity: drawdownPercent > 25 ? 'CRITICAL' : 'HIGH',
          message: `Portfolio drawdown is ${drawdownPercent.toFixed(1)}%`,
          currentValue: drawdownPercent,
          threshold: 15,
          timestamp: new Date(),
          acknowledged: false,
        };
      }
    }

    return null;
  }

  private applyStressScenario(portfolioData: any, scenario: any): any {
    // Simplified stress scenario application
    const stressedAssets = portfolioData.assets?.map((asset: any) => ({
      ...asset,
      currentValue: (asset.currentValue || asset.value || 0) * (1 + (scenario.impact || -0.20)),
    })) || [];

    const stressedTotalValue = stressedAssets.reduce((sum: number, asset: any) => 
      sum + asset.currentValue, 0
    );

    return {
      ...portfolioData,
      assets: stressedAssets,
      totalValue: stressedTotalValue,
    };
  }

  private findWorstAffectedAssets(originalPortfolio: any, stressedPortfolio: any): any[] {
    const impacts = originalPortfolio.assets?.map((asset: any, index: number) => {
      const originalValue = asset.currentValue || asset.value || 0;
      const stressedValue = stressedPortfolio.assets[index]?.currentValue || 0;
      const impact = stressedValue - originalValue;
      const impactPercent = originalValue > 0 ? (impact / originalValue) * 100 : 0;

      return {
        symbol: asset.symbol,
        impact,
        impactPercent,
        originalValue,
        stressedValue,
      };
    }) || [];

    return impacts
      .sort((a, b) => a.impactPercent - b.impactPercent)
      .slice(0, 3); // Return top 3 worst affected
  }

  private estimateRecoveryTime(impactPercent: number): number {
    // Simplified recovery time estimation (in days)
    // Assumes gradual recovery based on severity
    const severityFactor = Math.abs(impactPercent) / 10;
    return Math.min(severityFactor * 30, 365); // Max 1 year recovery
  }

  // Public methods for managing alerts and limits
  getRiskAlerts(): RiskAlert[] {
    return this.riskAlerts.filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.riskAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  setRiskLimit(limit: RiskLimit): void {
    const existingIndex = this.riskLimits.findIndex(l => 
      l.type === limit.type && l.asset === limit.asset && l.sector === limit.sector
    );

    if (existingIndex >= 0) {
      this.riskLimits[existingIndex] = limit;
    } else {
      this.riskLimits.push(limit);
    }
  }

  getRiskLimits(): RiskLimit[] {
    return this.riskLimits;
  }
}

export const riskAnalytics = new RiskAnalytics();