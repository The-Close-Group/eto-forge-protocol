// Order Management Hook
// Convenience hook for order operations

import { useCallback } from 'react';
import { useOrders as useOrderContext } from '@/contexts/OrderContext';
import { CreateOrderParams, Order, OrderType, OrderSide } from '@/types/order';
import { toast } from 'sonner';

export function useOrderManagement() {
  const {
    orders,
    orderStats,
    createOrder,
    cancelOrder,
    modifyOrder,
    validateOrder,
    getOrderHistory,
    getActiveOrders,
    executeOrder
  } = useOrderContext();

  const placeOrder = useCallback(async (params: CreateOrderParams) => {
    try {
      // Validate order first
      const validation = validateOrder(params);
      
      if (!validation.isValid) {
        toast.error(`Order validation failed: ${validation.errors.join(', ')}`);
        return { success: false, error: validation.errors.join(', ') };
      }
      
      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast.warning(warning);
        });
      }
      
      const result = await createOrder(params);
      
      if (result.success) {
        if (params.type === 'market') {
          toast.success(`Market ${params.side} order executed successfully`);
        } else {
          toast.success(`${params.type} ${params.side} order placed successfully`);
        }
      } else {
        toast.error(`Order failed: ${result.error}`);
      }
      
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to place order';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [createOrder, validateOrder]);

  const cancelOrderWithToast = useCallback(async (orderId: string) => {
    try {
      const success = await cancelOrder(orderId);
      
      if (success) {
        toast.success('Order cancelled successfully');
      } else {
        toast.error('Failed to cancel order');
      }
      
      return success;
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
      return false;
    }
  }, [cancelOrder]);

  const modifyOrderWithToast = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      const success = await modifyOrder(orderId, updates);
      
      if (success) {
        toast.success('Order modified successfully');
      } else {
        toast.error('Failed to modify order');
      }
      
      return success;
    } catch (error: any) {
      toast.error(error.message || 'Failed to modify order');
      return false;
    }
  }, [modifyOrder]);

  const getOrdersByAsset = useCallback((asset: string): Order[] => {
    return orders.filter(order => order.asset === asset);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: string): Order[] => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getOrdersByType = useCallback((type: OrderType): Order[] => {
    return orders.filter(order => order.type === type);
  }, [orders]);

  const getTodaysOrders = useCallback((): Order[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => order.createdAt >= today);
  }, [orders]);

  const getRecentFills = useCallback((): Order[] => {
    return orders
      .filter(order => order.status === 'filled' && order.fills.length > 0)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);
  }, [orders]);

  const calculatePortfolioValue = useCallback((): number => {
    return orders
      .filter(order => order.status === 'filled')
      .reduce((total, order) => {
        return total + order.fills.reduce((sum, fill) => sum + (fill.amount * fill.price), 0);
      }, 0);
  }, [orders]);

  const getOrderEfficiency = useCallback((): { successRate: number, averageFillTime: number } => {
    const completedOrders = orders.filter(order => 
      order.status === 'filled' || order.status === 'cancelled'
    );
    
    const successfulOrders = orders.filter(order => order.status === 'filled');
    const successRate = completedOrders.length > 0 
      ? (successfulOrders.length / completedOrders.length) * 100 
      : 0;
    
    const averageFillTime = successfulOrders.length > 0
      ? successfulOrders.reduce((sum, order) => 
          sum + (order.updatedAt.getTime() - order.createdAt.getTime()), 0
        ) / successfulOrders.length
      : 0;
    
    return { successRate, averageFillTime };
  }, [orders]);

  // Quick order creation helpers
  const createMarketBuyOrder = useCallback((asset: string, amount: number, fromAsset?: string) => {
    return placeOrder({
      type: 'market',
      side: 'buy',
      asset,
      amount,
      fromAsset,
      timeInForce: 'IOC',
      priority: 'standard'
    });
  }, [placeOrder]);

  const createMarketSellOrder = useCallback((asset: string, amount: number, fromAsset?: string) => {
    return placeOrder({
      type: 'market',
      side: 'sell',
      asset,
      amount,
      fromAsset,
      timeInForce: 'IOC',
      priority: 'standard'
    });
  }, [placeOrder]);

  const createLimitOrder = useCallback((
    asset: string, 
    amount: number, 
    price: number, 
    side: OrderSide,
    timeInForce: 'GTC' | 'DAY' = 'GTC',
    fromAsset?: string
  ) => {
    return placeOrder({
      type: 'limit',
      side,
      asset,
      amount,
      price,
      timeInForce,
      fromAsset,
      priority: 'standard'
    });
  }, [placeOrder]);

  const createStopOrder = useCallback((
    asset: string,
    amount: number,
    stopPrice: number,
    side: OrderSide,
    fromAsset?: string
  ) => {
    return placeOrder({
      type: 'stop',
      side,
      asset,
      amount,
      stopPrice,
      timeInForce: 'GTC',
      fromAsset,
      priority: 'standard'
    });
  }, [placeOrder]);

  return {
    // Core order operations
    orders,
    orderStats,
    placeOrder,
    cancelOrder: cancelOrderWithToast,
    modifyOrder: modifyOrderWithToast,
    validateOrder,
    executeOrder,
    
    // Query helpers
    getOrderHistory,
    getActiveOrders,
    getOrdersByAsset,
    getOrdersByStatus,
    getOrdersByType,
    getTodaysOrders,
    getRecentFills,
    
    // Analytics
    calculatePortfolioValue,
    getOrderEfficiency,
    
    // Quick order creators
    createMarketBuyOrder,
    createMarketSellOrder,
    createLimitOrder,
    createStopOrder
  };
}

export { useOrders } from '@/contexts/OrderContext';