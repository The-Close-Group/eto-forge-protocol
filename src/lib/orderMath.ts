// Core Financial Mathematics Engine for Order Execution
// Comprehensive calculations for trading operations

export interface OrderCalculation {
  executionPrice: number;
  totalCost: number;
  networkFee: number;
  platformFee: number;
  slippage: number;
  priceImpact: number;
  estimatedGas: number;
  finalAmount: number;
}

export interface AssetLiquidity {
  symbol: string;
  dailyVolume: number;
  spread: number;
  depthBPS: number; // basis points of depth
}

// Asset liquidity data for calculations
export const ASSET_LIQUIDITY: Record<string, AssetLiquidity> = {
  USDC: { symbol: "USDC", dailyVolume: 2000000000, spread: 0.0001, depthBPS: 10 },
  WETH: { symbol: "WETH", dailyVolume: 500000000, spread: 0.0005, depthBPS: 25 },
  BTC: { symbol: "BTC", dailyVolume: 800000000, spread: 0.0003, depthBPS: 15 },
  MAANG: { symbol: "MAANG", dailyVolume: 50000000, spread: 0.002, depthBPS: 100 },
  SOL: { symbol: "SOL", dailyVolume: 100000000, spread: 0.001, depthBPS: 50 },
  AVAX: { symbol: "AVAX", dailyVolume: 75000000, spread: 0.0015, depthBPS: 75 },
};

// Current market prices
export const ASSET_PRICES: Record<string, number> = {
  USDC: 1.0,
  WETH: 2450.85,
  BTC: 67890.12,
  MAANG: 145.67,
  SOL: 89.34,
  AVAX: 32.18,
};

/**
 * Calculate slippage based on order size relative to daily volume
 */
export function calculateSlippage(
  asset: string,
  orderSize: number,
  currentPrice: number
): number {
  const liquidity = ASSET_LIQUIDITY[asset];
  if (!liquidity) return 0.005; // Default 0.5% for unknown assets

  const orderValue = orderSize * currentPrice;
  const volumeRatio = orderValue / liquidity.dailyVolume;
  
  // Exponential slippage model: small orders have minimal slippage, large orders face exponential increase
  const baseSlippage = liquidity.spread / 2;
  const impactSlippage = Math.pow(volumeRatio * 100, 1.5) * 0.001;
  
  return Math.min(baseSlippage + impactSlippage, 0.05); // Cap at 5%
}

/**
 * Calculate market impact for large orders
 */
export function calculateMarketImpact(
  asset: string,
  orderSize: number,
  currentPrice: number,
  side: 'buy' | 'sell'
): number {
  const liquidity = ASSET_LIQUIDITY[asset];
  if (!liquidity) return 0;

  const orderValue = orderSize * currentPrice;
  const volumeRatio = orderValue / liquidity.dailyVolume;
  
  // Market impact model based on square root of volume ratio
  const impactBPS = liquidity.depthBPS * Math.sqrt(volumeRatio * 1000);
  const impactPercent = impactBPS / 10000;
  
  // Apply directional impact (buy orders push price up, sell orders push down)
  return side === 'buy' ? impactPercent : -impactPercent;
}

/**
 * Calculate platform fees based on order value and user tier
 */
export function calculatePlatformFee(
  orderValue: number,
  userTier: 'basic' | 'premium' | 'pro' = 'basic'
): number {
  const feeRates = {
    basic: 0.003,    // 0.3%
    premium: 0.002,  // 0.2%
    pro: 0.001       // 0.1%
  };
  
  return orderValue * feeRates[userTier];
}

/**
 * Estimate network fees based on current gas conditions
 */
export function estimateNetworkFee(
  asset: string,
  gasPrice: number = 20, // gwei
  priority: 'slow' | 'standard' | 'fast' = 'standard'
): number {
  const gasPriceMultipliers = {
    slow: 1.0,
    standard: 1.2,
    fast: 1.5
  };

  const baseGasLimit = asset === 'USDC' ? 65000 : 21000; // ERC20 vs ETH
  const adjustedGasPrice = gasPrice * gasPriceMultipliers[priority];
  
  // Convert to USD (approximate gas price in USD)
  const ethPrice = ASSET_PRICES.WETH || 2450;
  const gasCostETH = (baseGasLimit * adjustedGasPrice) / 1e9; // Convert gwei to ETH
  
  return gasCostETH * ethPrice;
}

/**
 * Calculate exchange rate with spread
 */
export function calculateExchangeRate(
  fromAsset: string,
  toAsset: string,
  orderSize: number,
  side: 'buy' | 'sell'
): number {
  const fromPrice = ASSET_PRICES[fromAsset] || 0;
  const toPrice = ASSET_PRICES[toAsset] || 0;
  
  if (fromPrice === 0 || toPrice === 0) return 0;
  
  const baseRate = fromPrice / toPrice;
  
  // Apply spread and market impact
  const fromLiquidity = ASSET_LIQUIDITY[fromAsset];
  const toLiquidity = ASSET_LIQUIDITY[toAsset];
  
  const spreadAdjustment = ((fromLiquidity?.spread || 0.001) + (toLiquidity?.spread || 0.001)) / 2;
  const marketImpact = calculateMarketImpact(toAsset, orderSize, toPrice, side);
  
  // Apply adjustments based on order side
  const adjustment = side === 'buy' ? spreadAdjustment + marketImpact : -spreadAdjustment + marketImpact;
  
  return baseRate * (1 + adjustment);
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(
  asset: string,
  orderSize: number,
  currentPrice: number
): number {
  const slippage = calculateSlippage(asset, orderSize, currentPrice);
  const marketImpact = Math.abs(calculateMarketImpact(asset, orderSize, currentPrice, 'buy'));
  
  return slippage + marketImpact;
}

/**
 * Comprehensive order calculation
 */
export function calculateOrderExecution(
  fromAsset: string,
  toAsset: string,
  fromAmount: number,
  side: 'buy' | 'sell',
  userTier: 'basic' | 'premium' | 'pro' = 'basic',
  gasPrice: number = 20,
  priority: 'slow' | 'standard' | 'fast' = 'standard'
): OrderCalculation {
  const fromPrice = ASSET_PRICES[fromAsset] || 0;
  const toPrice = ASSET_PRICES[toAsset] || 0;
  const orderValue = fromAmount * fromPrice;
  
  // Calculate execution price with market impact
  const marketImpact = calculateMarketImpact(toAsset, fromAmount, toPrice, side);
  const executionPrice = toPrice * (1 + marketImpact);
  
  // Calculate fees
  const platformFee = calculatePlatformFee(orderValue, userTier);
  const networkFee = estimateNetworkFee(fromAsset, gasPrice, priority);
  
  // Calculate slippage and price impact
  const slippage = calculateSlippage(toAsset, fromAmount, toPrice);
  const priceImpact = calculatePriceImpact(toAsset, fromAmount, toPrice);
  
  // Calculate final amounts
  const grossToAmount = fromAmount * (fromPrice / executionPrice);
  const slippageAmount = grossToAmount * slippage;
  const finalAmount = grossToAmount - slippageAmount;
  
  const totalCost = orderValue + platformFee + networkFee;
  
  return {
    executionPrice,
    totalCost,
    networkFee,
    platformFee,
    slippage: slippage * 100, // Convert to percentage
    priceImpact: priceImpact * 100, // Convert to percentage
    estimatedGas: 65000, // Estimated gas units
    finalAmount
  };
}

/**
 * Calculate maximum order size based on slippage tolerance
 */
export function calculateMaxOrderSize(
  asset: string,
  currentPrice: number,
  maxSlippageTolerance: number = 0.05 // 5% default
): number {
  const liquidity = ASSET_LIQUIDITY[asset];
  if (!liquidity) return 0;
  
  // Binary search for maximum order size that stays within slippage tolerance
  let low = 0;
  let high = liquidity.dailyVolume / currentPrice * 0.1; // Start with 10% of daily volume
  let maxSize = 0;
  
  for (let i = 0; i < 20; i++) { // 20 iterations for precision
    const mid = (low + high) / 2;
    const slippage = calculateSlippage(asset, mid, currentPrice);
    
    if (slippage <= maxSlippageTolerance) {
      maxSize = mid;
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return maxSize;
}

/**
 * Calculate required balance including fees and slippage buffer
 */
export function calculateRequiredBalance(
  fromAsset: string,
  toAsset: string,
  fromAmount: number,
  side: 'buy' | 'sell',
  slippageBuffer: number = 0.005 // 0.5% buffer
): number {
  const calculation = calculateOrderExecution(fromAsset, toAsset, fromAmount, side);
  const buffer = calculation.totalCost * slippageBuffer;
  
  return calculation.totalCost + buffer;
}