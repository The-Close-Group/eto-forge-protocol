// Advanced Orders Hook
// Manages OCO, Trailing Stop, Iceberg, TWAP, and VWAP orders

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { advancedOrderEngine } from '@/lib/advancedOrderEngine';
import {
  OCOOrder,
  TrailingStopOrder,
  IcebergOrder,
  TWAPOrder,
  VWAPOrder,
  CreateOCOParams,
  CreateTrailingStopParams,
  CreateIcebergParams,
  CreateTWAPParams,
  CreateVWAPParams,
  AdvancedOrderStats
} from '@/types/advancedOrder';
import { useOrders } from '@/contexts/OrderContext';
import { ASSET_PRICES } from '@/lib/orderMath';

export function useAdvancedOrders() {
  const [ocoOrders, setOCOOrders] = useState<OCOOrder[]>([]);
  const [trailingStops, setTrailingStops] = useState<TrailingStopOrder[]>([]);
  const [icebergOrders, setIcebergOrders] = useState<IcebergOrder[]>([]);
  const [twapOrders, setTWAPOrders] = useState<TWAPOrder[]>([]);
  const [vwapOrders, setVWAPOrders] = useState<VWAPOrder[]>([]);
  
  const { createOrder, executeOrder } = useOrders();

  // Update trailing stops based on current prices
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTrailingStops = advancedOrderEngine.getTrailingStops()
        .filter(order => order.status === 'open');
      
      activeTrailingStops.forEach(order => {
        const currentPrice = ASSET_PRICES[order.asset];
        advancedOrderEngine.updateTrailingStop(order.id, currentPrice);
        
        // Check if stop should trigger
        if (currentPrice <= order.currentStopPrice && order.side === 'sell') {
          triggerTrailingStop(order.id);
        }
      });
      
      setTrailingStops(advancedOrderEngine.getTrailingStops());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Process TWAP orders
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTWAP = advancedOrderEngine.getTWAPOrders()
        .filter(order => order.status === 'open');
      
      activeTWAP.forEach(order => {
        const now = new Date();
        const currentSlice = order.slices[order.currentSliceIndex];
        
        if (currentSlice && currentSlice.status === 'pending' && 
            now >= currentSlice.scheduledTime) {
          executeTWAPSlice(order.id);
        }
      });
      
      setTWAPOrders(advancedOrderEngine.getTWAPOrders());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // OCO Order Functions
  const createOCOOrder = useCallback(async (params: CreateOCOParams) => {
    try {
      const ocoOrder = advancedOrderEngine.createOCOOrder(params);
      
      // Create the actual orders in the system
      await createOrder({
        type: 'limit',
        side: params.side,
        asset: params.asset,
        amount: params.amount,
        price: params.takeProfitPrice,
        timeInForce: params.timeInForce,
        fromAsset: params.fromAsset
      });

      await createOrder({
        type: 'stop',
        side: params.side,
        asset: params.asset,
        amount: params.amount,
        stopPrice: params.stopLossPrice,
        timeInForce: params.timeInForce,
        fromAsset: params.fromAsset
      });

      setOCOOrders(advancedOrderEngine.getOCOOrders());
      toast.success('OCO order created successfully');
      
      return { success: true, orderId: ocoOrder.id };
    } catch (error: any) {
      toast.error(`Failed to create OCO order: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, [createOrder]);

  // Trailing Stop Functions
  const createTrailingStopOrder = useCallback(async (params: CreateTrailingStopParams) => {
    try {
      const trailingOrder = advancedOrderEngine.createTrailingStopOrder(params);
      setTrailingStops(advancedOrderEngine.getTrailingStops());
      
      toast.success(`Trailing stop order created with ${params.trailPercent ? 
        `${(params.trailPercent * 100).toFixed(1)}% trail` : 
        `$${params.trailAmount} trail`}`);
      
      return { success: true, orderId: trailingOrder.id };
    } catch (error: any) {
      toast.error(`Failed to create trailing stop: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, []);

  const triggerTrailingStop = useCallback(async (orderId: string) => {
    const order = trailingStops.find(o => o.id === orderId);
    if (!order) return;

    try {
      // Execute as market order
      await createOrder({
        type: 'market',
        side: order.side,
        asset: order.asset,
        amount: order.remaining,
        fromAsset: order.metadata?.fromAsset
      });

      // Update order status
      order.status = 'filled';
      setTrailingStops(advancedOrderEngine.getTrailingStops());
      
      toast.success(`Trailing stop triggered at $${order.currentStopPrice.toFixed(2)}`);
    } catch (error: any) {
      toast.error(`Failed to trigger trailing stop: ${error.message}`);
    }
  }, [trailingStops, createOrder]);

  // Iceberg Order Functions
  const createIcebergOrder = useCallback(async (params: CreateIcebergParams) => {
    try {
      const icebergOrder = advancedOrderEngine.createIcebergOrder(params);
      
      // Start with first slice
      const firstSliceSize = advancedOrderEngine.getNextIcebergSlice(icebergOrder.id);
      await createOrder({
        type: params.price ? 'limit' : 'market',
        side: params.side,
        asset: params.asset,
        amount: firstSliceSize,
        price: params.price,
        timeInForce: params.timeInForce,
        fromAsset: params.fromAsset
      });

      setIcebergOrders(advancedOrderEngine.getIcebergOrders());
      toast.success(`Iceberg order created: ${params.displaySize} shown of ${params.totalAmount} total`);
      
      return { success: true, orderId: icebergOrder.id };
    } catch (error: any) {
      toast.error(`Failed to create iceberg order: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, [createOrder]);

  // TWAP Order Functions
  const createTWAPOrder = useCallback(async (params: CreateTWAPParams) => {
    try {
      const twapOrder = advancedOrderEngine.createTWAPOrder(params);
      setTWAPOrders(advancedOrderEngine.getTWAPOrders());
      
      toast.success(`TWAP order created: ${params.amount} ${params.asset} over ${params.executionPeriod} minutes`);
      
      return { success: true, orderId: twapOrder.id };
    } catch (error: any) {
      toast.error(`Failed to create TWAP order: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, []);

  const executeTWAPSlice = useCallback(async (orderId: string) => {
    const order = twapOrders.find(o => o.id === orderId);
    if (!order) return;

    const currentSlice = order.slices[order.currentSliceIndex];
    if (!currentSlice || currentSlice.status !== 'pending') return;

    try {
      currentSlice.status = 'executing';
      
      await createOrder({
        type: order.price ? 'limit' : 'market',
        side: order.side,
        asset: order.asset,
        amount: currentSlice.amount,
        price: order.price,
        fromAsset: order.metadata?.fromAsset
      });

      currentSlice.status = 'completed';
      order.currentSliceIndex++;
      order.filled += currentSlice.amount;
      order.remaining -= currentSlice.amount;

      if (order.currentSliceIndex >= order.slices.length) {
        order.status = 'filled';
      }

      setTWAPOrders(advancedOrderEngine.getTWAPOrders());
    } catch (error: any) {
      currentSlice.status = 'failed';
      toast.error(`TWAP slice execution failed: ${error.message}`);
    }
  }, [twapOrders, createOrder]);

  // VWAP Order Functions
  const createVWAPOrder = useCallback(async (params: CreateVWAPParams) => {
    try {
      const vwapOrder = advancedOrderEngine.createVWAPOrder(params);
      setVWAPOrders(advancedOrderEngine.getVWAPOrders());
      
      toast.success(`VWAP order created: ${(params.participationRate * 100).toFixed(1)}% participation rate`);
      
      return { success: true, orderId: vwapOrder.id };
    } catch (error: any) {
      toast.error(`Failed to create VWAP order: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, []);

  // Order Statistics
  const getAdvancedOrderStats = useCallback((): AdvancedOrderStats => {
    const allOrdersWithVolume = [
      ...trailingStops,
      ...icebergOrders,
      ...twapOrders,
      ...vwapOrders
    ];

    const totalVolume = allOrdersWithVolume.reduce((sum, order) => {
      return sum + order.filled * (order.averageFillPrice || ASSET_PRICES[order.asset] || 0);
    }, 0);

    return {
      ocoOrders: ocoOrders.length,
      trailingStopOrders: trailingStops.length,
      icebergOrders: icebergOrders.length,
      twapOrders: twapOrders.length,
      vwapOrders: vwapOrders.length,
      averageSlippage: 0.15, // Mock data
      executionQuality: 0.92, // Mock data
      totalVolume
    };
  }, [ocoOrders, trailingStops, icebergOrders, twapOrders, vwapOrders]);

  // Cancel order functions
  const cancelOCOOrder = useCallback(async (orderId: string) => {
    const order = ocoOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      setOCOOrders(advancedOrderEngine.getOCOOrders());
      toast.success('OCO order cancelled');
    }
  }, [ocoOrders]);

  const cancelAdvancedOrder = useCallback(async (orderId: string, type: string) => {
    switch (type) {
      case 'oco':
        await cancelOCOOrder(orderId);
        break;
      case 'trailing_stop':
        const trailingOrder = trailingStops.find(o => o.id === orderId);
        if (trailingOrder) {
          trailingOrder.status = 'cancelled';
          setTrailingStops(advancedOrderEngine.getTrailingStops());
          toast.success('Trailing stop cancelled');
        }
        break;
      case 'iceberg':
        const icebergOrder = icebergOrders.find(o => o.id === orderId);
        if (icebergOrder) {
          icebergOrder.status = 'cancelled';
          setIcebergOrders(advancedOrderEngine.getIcebergOrders());
          toast.success('Iceberg order cancelled');
        }
        break;
      case 'twap':
        const twapOrder = twapOrders.find(o => o.id === orderId);
        if (twapOrder) {
          twapOrder.status = 'cancelled';
          setTWAPOrders(advancedOrderEngine.getTWAPOrders());
          toast.success('TWAP order cancelled');
        }
        break;
      case 'vwap':
        const vwapOrder = vwapOrders.find(o => o.id === orderId);
        if (vwapOrder) {
          vwapOrder.status = 'cancelled';
          setVWAPOrders(advancedOrderEngine.getVWAPOrders());
          toast.success('VWAP order cancelled');
        }
        break;
    }
  }, [ocoOrders, trailingStops, icebergOrders, twapOrders, vwapOrders, cancelOCOOrder]);

  return {
    // State
    ocoOrders,
    trailingStops,
    icebergOrders,
    twapOrders,
    vwapOrders,
    
    // OCO functions
    createOCOOrder,
    cancelOCOOrder,
    
    // Trailing stop functions
    createTrailingStopOrder,
    triggerTrailingStop,
    
    // Iceberg functions
    createIcebergOrder,
    
    // TWAP functions
    createTWAPOrder,
    executeTWAPSlice,
    
    // VWAP functions
    createVWAPOrder,
    
    // Utilities
    getAdvancedOrderStats,
    cancelAdvancedOrder
  };
}