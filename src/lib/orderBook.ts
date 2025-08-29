// Order Book Simulation Engine
// Realistic market behavior simulation

import { Order, OrderBook, OrderBookEntry, OrderFill, OrderType, OrderSide } from '@/types/order';
import { ASSET_PRICES, ASSET_LIQUIDITY, calculateMarketImpact } from './orderMath';

/**
 * Generate realistic order book depth for an asset
 */
export function generateOrderBook(asset: string, basePrice?: number): OrderBook {
  const price = basePrice || ASSET_PRICES[asset] || 100;
  const liquidity = ASSET_LIQUIDITY[asset] || ASSET_LIQUIDITY.MAANG;
  
  const spread = liquidity.spread;
  const midPrice = price;
  const bidPrice = midPrice * (1 - spread / 2);
  const askPrice = midPrice * (1 + spread / 2);
  
  // Generate bid levels (below mid price)
  const bids: OrderBookEntry[] = [];
  for (let i = 0; i < 10; i++) {
    const levelPrice = bidPrice * (1 - i * 0.001); // 0.1% apart
    const baseAmount = liquidity.dailyVolume / price / 1000; // Base liquidity
    const depthDecay = Math.exp(-i * 0.3); // Exponential decay
    const amount = baseAmount * depthDecay * (0.8 + Math.random() * 0.4);
    
    bids.push({
      price: levelPrice,
      amount,
      total: amount * levelPrice,
      orders: Math.floor(Math.random() * 5) + 1
    });
  }
  
  // Generate ask levels (above mid price)
  const asks: OrderBookEntry[] = [];
  for (let i = 0; i < 10; i++) {
    const levelPrice = askPrice * (1 + i * 0.001); // 0.1% apart
    const baseAmount = liquidity.dailyVolume / price / 1000; // Base liquidity
    const depthDecay = Math.exp(-i * 0.3); // Exponential decay
    const amount = baseAmount * depthDecay * (0.8 + Math.random() * 0.4);
    
    asks.push({
      price: levelPrice,
      amount,
      total: amount * levelPrice,
      orders: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return {
    asset,
    bids: bids.sort((a, b) => b.price - a.price), // Highest bid first
    asks: asks.sort((a, b) => a.price - b.price), // Lowest ask first
    spread: askPrice - bidPrice,
    midPrice,
    lastUpdate: new Date()
  };
}

/**
 * Calculate fill probability for limit orders
 */
export function calculateFillProbability(
  order: Order,
  orderBook: OrderBook,
  timeHorizonHours: number = 24
): number {
  if (order.type === 'market') return 1.0; // Market orders fill immediately
  
  const targetPrice = order.price!;
  const currentPrice = orderBook.midPrice;
  
  // Distance from current price (as percentage)
  const priceDistance = Math.abs(targetPrice - currentPrice) / currentPrice;
  
  // Base probability based on how close to market price
  let baseProbability = Math.exp(-priceDistance * 10); // Exponential decay
  
  // Adjust for order side and market direction
  if (order.side === 'buy' && targetPrice < currentPrice) {
    // Buy order below market - good chance if price drops
    baseProbability *= 1.2;
  } else if (order.side === 'sell' && targetPrice > currentPrice) {
    // Sell order above market - good chance if price rises
    baseProbability *= 1.2;
  } else {
    // Order needs favorable price movement
    baseProbability *= 0.8;
  }
  
  // Time factor - longer time horizon increases fill probability
  const timeFactor = Math.min(timeHorizonHours / 24, 2); // Cap at 2x for 48+ hours
  baseProbability *= timeFactor;
  
  // Asset liquidity factor
  const liquidityFactor = Math.log(ASSET_LIQUIDITY[order.asset]?.dailyVolume || 1000000) / 20;
  baseProbability *= liquidityFactor;
  
  return Math.min(baseProbability, 0.95); // Cap at 95%
}

/**
 * Simulate market order execution against order book
 */
export function simulateMarketOrderExecution(
  order: Order,
  orderBook: OrderBook
): { fills: OrderFill[], remainingAmount: number, averagePrice: number } {
  const fills: OrderFill[] = [];
  let remainingAmount = order.amount;
  let totalFillValue = 0;
  let totalFillAmount = 0;
  
  // Use appropriate side of book
  const bookSide = order.side === 'buy' ? orderBook.asks : orderBook.bids;
  
  for (const level of bookSide) {
    if (remainingAmount <= 0) break;
    
    const fillAmount = Math.min(remainingAmount, level.amount);
    const fillValue = fillAmount * level.price;
    
    // Create fill record
    const fill: OrderFill = {
      id: `fill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      timestamp: new Date(),
      amount: fillAmount,
      price: level.price,
      fee: fillValue * 0.001, // 0.1% fee
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
    
    fills.push(fill);
    remainingAmount -= fillAmount;
    totalFillValue += fillValue;
    totalFillAmount += fillAmount;
    
    // Apply market impact for large orders
    if (totalFillValue > (ASSET_LIQUIDITY[order.asset]?.dailyVolume || 1000000) * 0.001) {
      break; // Stop if we've moved the market too much
    }
  }
  
  const averagePrice = totalFillAmount > 0 ? totalFillValue / totalFillAmount : 0;
  
  return { fills, remainingAmount, averagePrice };
}

/**
 * Simulate limit order execution over time
 */
export function simulateLimitOrderExecution(
  order: Order,
  orderBook: OrderBook,
  marketVolatility: number = 0.02 // 2% daily volatility
): { fills: OrderFill[], shouldFill: boolean, partialFillAmount?: number } {
  const fills: OrderFill[] = [];
  const targetPrice = order.price!;
  const currentPrice = orderBook.midPrice;
  
  // Simulate price movement
  const priceMovement = (Math.random() - 0.5) * marketVolatility * currentPrice;
  const newPrice = currentPrice + priceMovement;
  
  // Check if order should execute
  const shouldExecute = (
    (order.side === 'buy' && newPrice <= targetPrice) ||
    (order.side === 'sell' && newPrice >= targetPrice)
  );
  
  if (!shouldExecute) {
    return { fills, shouldFill: false };
  }
  
  // Calculate fill amount based on time in force
  let fillAmount = order.remaining;
  
  if (order.timeInForce === 'IOC') {
    // Immediate or Cancel - fill what's available immediately
    const availableLiquidity = orderBook.bids[0]?.amount || orderBook.asks[0]?.amount || 0;
    fillAmount = Math.min(fillAmount, availableLiquidity * 0.8); // Conservative fill
  } else if (order.timeInForce === 'FOK') {
    // Fill or Kill - only fill if entire order can be filled
    const totalAvailable = (order.side === 'buy' ? orderBook.asks : orderBook.bids)
      .reduce((sum, level) => sum + level.amount, 0);
    
    if (totalAvailable < fillAmount) {
      return { fills, shouldFill: false };
    }
  }
  
  // Create fill
  if (fillAmount > 0) {
    const fill: OrderFill = {
      id: `fill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      timestamp: new Date(),
      amount: fillAmount,
      price: targetPrice,
      fee: fillAmount * targetPrice * 0.001,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
    
    fills.push(fill);
  }
  
  return { 
    fills, 
    shouldFill: true, 
    partialFillAmount: fillAmount < order.remaining ? fillAmount : undefined 
  };
}

/**
 * Update order book after order execution
 */
export function updateOrderBookAfterExecution(
  orderBook: OrderBook,
  executedOrder: Order,
  fills: OrderFill[]
): OrderBook {
  const updatedBook = { ...orderBook };
  
  // Remove liquidity based on fills
  const targetSide = executedOrder.side === 'buy' ? 'asks' : 'bids';
  const levels = updatedBook[targetSide];
  
  let remainingToRemove = fills.reduce((sum, fill) => sum + fill.amount, 0);
  
  for (let i = 0; i < levels.length && remainingToRemove > 0; i++) {
    const level = levels[i];
    const removeAmount = Math.min(level.amount, remainingToRemove);
    
    level.amount -= removeAmount;
    level.total = level.amount * level.price;
    remainingToRemove -= removeAmount;
    
    // Remove empty levels
    if (level.amount <= 0) {
      levels.splice(i, 1);
      i--; // Adjust index after removal
    }
  }
  
  // Update spread and mid price
  if (updatedBook.bids.length > 0 && updatedBook.asks.length > 0) {
    updatedBook.spread = updatedBook.asks[0].price - updatedBook.bids[0].price;
    updatedBook.midPrice = (updatedBook.bids[0].price + updatedBook.asks[0].price) / 2;
  }
  
  updatedBook.lastUpdate = new Date();
  
  return updatedBook;
}

/**
 * Get best bid/ask prices from order book
 */
export function getBestPrices(orderBook: OrderBook): { bestBid: number, bestAsk: number } {
  const bestBid = orderBook.bids.length > 0 ? orderBook.bids[0].price : 0;
  const bestAsk = orderBook.asks.length > 0 ? orderBook.asks[0].price : 0;
  
  return { bestBid, bestAsk };
}

/**
 * Calculate order book depth for a given price range
 */
export function calculateOrderBookDepth(
  orderBook: OrderBook,
  priceRange: number = 0.05 // 5% from mid price
): { bidDepth: number, askDepth: number } {
  const midPrice = orderBook.midPrice;
  const lowerBound = midPrice * (1 - priceRange);
  const upperBound = midPrice * (1 + priceRange);
  
  const bidDepth = orderBook.bids
    .filter(level => level.price >= lowerBound)
    .reduce((sum, level) => sum + level.amount, 0);
  
  const askDepth = orderBook.asks
    .filter(level => level.price <= upperBound)
    .reduce((sum, level) => sum + level.amount, 0);
  
  return { bidDepth, askDepth };
}