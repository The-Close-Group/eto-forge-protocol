// Order Management Context
// Centralized order state management and execution

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Order, OrderBook, OrderFill, CreateOrderParams, OrderValidation, OrderExecutionResult, OrderStats } from '@/types/order';
import { usePortfolio } from './PortfolioContext';
import { useBalances } from '@/hooks/useBalances';
import { calculateOrderExecution, calculateRequiredBalance } from '@/lib/orderMath';
import { usePrices } from '@/hooks/usePrices';
import { 
  generateOrderBook, 
  simulateMarketOrderExecution, 
  simulateLimitOrderExecution, 
  updateOrderBookAfterExecution 
} from '@/lib/orderBook';

interface OrderContextType {
  orders: Order[];
  orderBooks: Record<string, OrderBook>;
  orderStats: OrderStats;
  createOrder: (params: CreateOrderParams) => Promise<OrderExecutionResult>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  modifyOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  validateOrder: (params: CreateOrderParams) => OrderValidation;
  getOrderHistory: (asset?: string) => Order[];
  getActiveOrders: (asset?: string) => Order[];
  refreshOrderBooks: () => void;
  executeOrder: (orderId: string) => Promise<OrderExecutionResult>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Order storage and ID generation
let orderIdCounter = 1;
const generateOrderId = () => `order_${Date.now()}_${orderIdCounter++}`;

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBook>>({});
  const { addTrade } = usePortfolio();
  const { balances, getAvailableBalance } = useBalances();
  const { getTokenPrices } = usePrices();

  // Initialize order books for all assets
  useEffect(() => {
    const prices = getTokenPrices(['USDC', 'mUSDC', 'ETH', 'WETH', 'MAANG', 'AVAX', 'BTC', 'GOVDRI']);
    const assets = Object.keys(prices);
    const initialOrderBooks: Record<string, OrderBook> = {};
    
    assets.forEach(asset => {
      initialOrderBooks[asset] = generateOrderBook(asset, prices[asset]);
    });
    
    setOrderBooks(initialOrderBooks);
  }, []);

  // Process pending orders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      processLimitOrders();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [orders, orderBooks]);

  const processLimitOrders = useCallback(() => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.status !== 'open' || order.type === 'market') {
          return order;
        }
        
        const orderBook = orderBooks[order.asset];
        if (!orderBook) return order;
        
        // Simulate limit order execution
        const { fills, shouldFill, partialFillAmount } = simulateLimitOrderExecution(order, orderBook);
        
        if (shouldFill && fills.length > 0) {
          const totalFilled = fills.reduce((sum, fill) => sum + fill.amount, 0);
          const newFilled = order.filled + totalFilled;
          const newRemaining = order.amount - newFilled;
          
          // Update portfolio if order is filled
          if (order.metadata?.fromAsset) {
            const prices = getTokenPrices([order.asset]);
            const fromAmount = totalFilled * (order.price || prices[order.asset] || 0);
            addTrade(order.metadata.fromAsset, order.asset, fromAmount, totalFilled * (order.price || 0), order.price || 0);
          }
          
          return {
            ...order,
            filled: newFilled,
            remaining: newRemaining,
            status: newRemaining <= 0.001 ? 'filled' : 'partially_filled',
            fills: [...order.fills, ...fills],
            totalFees: order.totalFees + fills.reduce((sum, fill) => sum + fill.fee, 0),
            averageFillPrice: calculateAverageFillPrice([...order.fills, ...fills]),
            updatedAt: new Date()
          };
        }
        
        return order;
      });
    });
  }, [orderBooks, addTrade]);

  const calculateAverageFillPrice = (fills: OrderFill[]): number => {
    if (fills.length === 0) return 0;
    const totalValue = fills.reduce((sum, fill) => sum + (fill.amount * fill.price), 0);
    const totalAmount = fills.reduce((sum, fill) => sum + fill.amount, 0);
    return totalValue / totalAmount;
  };

  const validateOrder = useCallback((params: CreateOrderParams): OrderValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    const prices = getTokenPrices([params.asset]);
    if (!params.asset || !prices[params.asset]) {
      errors.push('Invalid asset selected');
    }
    
    if (params.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (params.type === 'limit' && (!params.price || params.price <= 0)) {
      errors.push('Limit price must be specified and greater than 0');
    }
    
    if (params.type === 'stop' && (!params.stopPrice || params.stopPrice <= 0)) {
      errors.push('Stop price must be specified and greater than 0');
    }
    
    // Calculate order costs
    const fromAsset = params.fromAsset || 'USDC';
    const calculation = calculateOrderExecution(
      fromAsset,
      params.asset,
      params.amount,
      params.side,
      prices, // Pass current prices
      'basic',
      20,
      params.priority || 'standard'
    );
    
    const requiredBalance = calculateRequiredBalance(
      fromAsset,
      params.asset,
      params.amount,
      params.side,
      getTokenPrices([fromAsset, params.asset]) // Pass prices for both assets
    );
    
    // Balance validation using balance manager
    const availableBalance = getAvailableBalance(fromAsset);
    
    if (availableBalance < requiredBalance) {
      errors.push(`Insufficient balance. Required: ${requiredBalance.toFixed(4)} ${fromAsset}, Available: ${availableBalance.toFixed(4)} ${fromAsset}`);
    }
    
    // Risk warnings
    if (calculation.priceImpact > 5) {
      warnings.push(`High price impact: ${calculation.priceImpact.toFixed(2)}%`);
    }
    
    if (calculation.slippage > 3) {
      warnings.push(`High slippage expected: ${calculation.slippage.toFixed(2)}%`);
    }
    
    if (params.type === 'limit') {
      const currentPrice = prices[params.asset];
      const priceDeviation = Math.abs((params.price! - currentPrice) / currentPrice) * 100;
      
      if (priceDeviation > 10) {
        warnings.push(`Limit price is ${priceDeviation.toFixed(1)}% away from market price`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredBalance,
      estimatedCost: calculation.totalCost,
      priceImpact: calculation.priceImpact,
      slippage: calculation.slippage
    };
  }, [balances]);

  const executeOrder = useCallback(async (orderId: string): Promise<OrderExecutionResult> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    const orderBook = orderBooks[order.asset];
    if (!orderBook) {
      return { success: false, error: 'Order book not available' };
    }
    
    try {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'pending' } : o
      ));
      
      let fills: OrderFill[] = [];
      let remainingAmount = order.remaining;
      
      if (order.type === 'market') {
        const result = simulateMarketOrderExecution(order, orderBook);
        fills = result.fills;
        remainingAmount = result.remainingAmount;
      } else {
        const result = simulateLimitOrderExecution(order, orderBook);
        if (result.shouldFill) {
          fills = result.fills;
          remainingAmount = order.remaining - fills.reduce((sum, fill) => sum + fill.amount, 0);
        }
      }
      
      // Update order with fills
      const totalFilled = fills.reduce((sum, fill) => sum + fill.amount, 0);
      const newFilled = order.filled + totalFilled;
      const newStatus = remainingAmount <= 0.001 ? 'filled' : 'partially_filled';
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? {
          ...o,
          filled: newFilled,
          remaining: remainingAmount,
          status: newStatus,
          fills: [...o.fills, ...fills],
          totalFees: o.totalFees + fills.reduce((sum, fill) => sum + fill.fee, 0),
          averageFillPrice: calculateAverageFillPrice([...o.fills, ...fills]),
          updatedAt: new Date()
        } : o
      ));
      
      // Update portfolio
      if (order.metadata?.fromAsset && totalFilled > 0) {
        const averagePrice = calculateAverageFillPrice(fills);
        const fromAmount = totalFilled * averagePrice;
        addTrade(order.metadata.fromAsset, order.asset, fromAmount, totalFilled * averagePrice, averagePrice);
      }
      
      // Update order book
      if (fills.length > 0) {
        setOrderBooks(prev => ({
          ...prev,
          [order.asset]: updateOrderBookAfterExecution(orderBook, order, fills)
        }));
      }
      
      return {
        success: true,
        orderId,
        fills,
        remainingAmount,
        totalCost: fills.reduce((sum, fill) => sum + (fill.amount * fill.price) + fill.fee, 0)
      };
      
    } catch (error: unknown) {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'rejected' } : o
      ));
      
      return {
        success: false,
        error: error.message || 'Order execution failed'
      };
    }
  }, [orders, orderBooks, addTrade]);

  const createOrder = useCallback(async (params: CreateOrderParams): Promise<OrderExecutionResult> => {
    const validation = validateOrder(params);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }
    
    const orderId = generateOrderId();
    const fromAsset = params.fromAsset || 'USDC';
    
    const calculation = calculateOrderExecution(
      fromAsset,
      params.asset,
      params.amount,
      params.side,
      getTokenPrices([params.asset]), // Pass as string[] to fix type error
      'basic',
      20,
      params.priority || 'standard'
    );
    
    // Set expiration for time-limited orders
    let expiresAt: Date | undefined;
    if (params.timeInForce === 'DAY') {
      expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999); // End of trading day
    }
    
    const order: Order = {
      id: orderId,
      type: params.type,
      side: params.side,
      status: params.type === 'market' ? 'pending' : 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      price: params.price,
      stopPrice: params.stopPrice,
      timeInForce: params.timeInForce || 'GTC',
      priority: params.priority || 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: params.slippageTolerance || 0.005,
      estimatedCost: calculation.totalCost,
      requiredBalance: validation.requiredBalance,
      metadata: {
        fromAsset,
        originalAmount: params.amount,
        estimatedGas: calculation.estimatedGas,
        priceImpact: calculation.priceImpact,
        marketImpact: calculation.priceImpact
      }
    };
    
    setOrders(prev => [...prev, order]);
    
    // Execute market orders immediately
    if (params.type === 'market') {
      return executeOrder(orderId);
    }
    
    return {
      success: true,
      orderId,
      remainingAmount: params.amount
    };
  }, [validateOrder, executeOrder]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'filled' || order.status === 'cancelled') {
      return false;
    }
    
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'cancelled', updatedAt: new Date() } : o
    ));
    
    return true;
  }, [orders]);

  const modifyOrder = useCallback(async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'open') {
      return false;
    }
    
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, ...updates, updatedAt: new Date() } : o
    ));
    
    return true;
  }, [orders]);

  const getOrderHistory = useCallback((asset?: string): Order[] => {
    return orders
      .filter(order => !asset || order.asset === asset)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders]);

  const getActiveOrders = useCallback((asset?: string): Order[] => {
    return orders
      .filter(order => 
        (order.status === 'open' || order.status === 'partially_filled') &&
        (!asset || order.asset === asset)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders]);

  const refreshOrderBooks = useCallback(() => {
    const prices = getTokenPrices(['USDC', 'mUSDC', 'ETH', 'WETH', 'MAANG', 'AVAX', 'BTC', 'GOVDRI']);
    const assets = Object.keys(prices);
    const updatedOrderBooks: Record<string, OrderBook> = {};
    
    assets.forEach(asset => {
      updatedOrderBooks[asset] = generateOrderBook(asset, prices[asset]);
    });
    
    setOrderBooks(updatedOrderBooks);
  }, []);

  // Calculate order statistics
  const orderStats: OrderStats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'open' || o.status === 'partially_filled').length,
    filledOrders: orders.filter(o => o.status === 'filled').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    totalVolume: orders.reduce((sum, order) => sum + (order.filled * (order.averageFillPrice || 0)), 0),
    averageFillTime: orders.filter(o => o.status === 'filled').length > 0 
      ? orders
          .filter(o => o.status === 'filled')
          .reduce((sum, order) => sum + (order.updatedAt.getTime() - order.createdAt.getTime()), 0) 
        / orders.filter(o => o.status === 'filled').length 
      : 0
  };

  return (
    <OrderContext.Provider value={{
      orders,
      orderBooks,
      orderStats,
      createOrder,
      cancelOrder,
      modifyOrder,
      validateOrder,
      getOrderHistory,
      getActiveOrders,
      refreshOrderBooks,
      executeOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}