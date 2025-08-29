// Advanced Order Execution Engine
// Handles OCO, Trailing Stop, Iceberg, TWAP, and VWAP orders

import { 
  OCOOrder, 
  TrailingStopOrder, 
  IcebergOrder, 
  TWAPOrder, 
  VWAPOrder,
  TWAPSlice,
  VWAPSlice,
  CreateOCOParams,
  CreateTrailingStopParams,
  CreateIcebergParams,
  CreateTWAPParams,
  CreateVWAPParams
} from '@/types/advancedOrder';
import { Order, OrderFill, CreateOrderParams } from '@/types/order';
import { ASSET_PRICES } from '@/lib/orderMath';

export class AdvancedOrderEngine {
  private ocoOrders: Map<string, OCOOrder> = new Map();
  private trailingStops: Map<string, TrailingStopOrder> = new Map();
  private icebergOrders: Map<string, IcebergOrder> = new Map();
  private twapOrders: Map<string, TWAPOrder> = new Map();
  private vwapOrders: Map<string, VWAPOrder> = new Map();

  // OCO Order Management
  createOCOOrder(params: CreateOCOParams): OCOOrder {
    const id = `oco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const primaryOrder: Order = {
      id: `${id}_primary`,
      type: 'limit',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      price: params.takeProfitPrice,
      timeInForce: params.timeInForce || 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.amount * params.takeProfitPrice,
      requiredBalance: params.amount * params.takeProfitPrice,
      metadata: {
        fromAsset: params.fromAsset || 'USDC',
        linkedOrderId: `${id}_secondary`
      }
    };

    const secondaryOrder: Order = {
      id: `${id}_secondary`,
      type: 'stop',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      stopPrice: params.stopLossPrice,
      timeInForce: params.timeInForce || 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.amount * params.stopLossPrice,
      requiredBalance: params.amount * params.stopLossPrice,
      metadata: {
        fromAsset: params.fromAsset || 'USDC',
        linkedOrderId: `${id}_primary`
      }
    };

    const ocoOrder: OCOOrder = {
      id,
      primaryOrder,
      secondaryOrder,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.ocoOrders.set(id, ocoOrder);
    return ocoOrder;
  }

  triggerOCOOrder(ocoId: string, triggeredOrderId: string): boolean {
    const oco = this.ocoOrders.get(ocoId);
    if (!oco || oco.status !== 'active') return false;

    oco.status = 'triggered';
    oco.triggeredOrderId = triggeredOrderId;
    oco.updatedAt = new Date();

    // Cancel the other order
    const otherOrderId = triggeredOrderId === oco.primaryOrder.id 
      ? oco.secondaryOrder.id 
      : oco.primaryOrder.id;
    
    if (triggeredOrderId === oco.primaryOrder.id) {
      oco.secondaryOrder.status = 'cancelled';
    } else {
      oco.primaryOrder.status = 'cancelled';
    }

    return true;
  }

  // Trailing Stop Order Management
  createTrailingStopOrder(params: CreateTrailingStopParams): TrailingStopOrder {
    const currentPrice = ASSET_PRICES[params.asset];
    const initialStopPrice = params.trailAmount 
      ? currentPrice - params.trailAmount
      : currentPrice * (1 - (params.trailPercent || 0.05));

    const order: TrailingStopOrder = {
      id: `trailing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'trailing_stop',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      timeInForce: params.timeInForce || 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.amount * currentPrice,
      requiredBalance: params.amount * currentPrice,
      trailAmount: params.trailAmount,
      trailPercent: params.trailPercent,
      peakPrice: currentPrice,
      initialStopPrice,
      currentStopPrice: initialStopPrice,
      metadata: {
        fromAsset: params.fromAsset || 'USDC'
      }
    };

    this.trailingStops.set(order.id, order);
    return order;
  }

  updateTrailingStop(orderId: string, currentPrice: number): boolean {
    const order = this.trailingStops.get(orderId);
    if (!order || order.status !== 'open') return false;

    // Update peak price if current price is higher
    if (currentPrice > order.peakPrice) {
      order.peakPrice = currentPrice;
      
      // Recalculate stop price
      const newStopPrice = order.trailAmount
        ? order.peakPrice - order.trailAmount
        : order.peakPrice * (1 - (order.trailPercent || 0.05));
      
      if (newStopPrice > order.currentStopPrice) {
        order.currentStopPrice = newStopPrice;
        order.updatedAt = new Date();
      }
    }

    return true;
  }

  // Iceberg Order Management
  createIcebergOrder(params: CreateIcebergParams): IcebergOrder {
    const sliceCount = Math.ceil(params.totalAmount / params.displaySize);
    
    const order: IcebergOrder = {
      id: `iceberg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'iceberg',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.totalAmount,
      filled: 0,
      remaining: params.totalAmount,
      price: params.price,
      timeInForce: params.timeInForce || 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.totalAmount * (params.price || ASSET_PRICES[params.asset]),
      requiredBalance: params.totalAmount * (params.price || ASSET_PRICES[params.asset]),
      displaySize: params.displaySize,
      totalSize: params.totalAmount,
      executedSize: 0,
      currentSlice: 1,
      sliceCount,
      metadata: {
        fromAsset: params.fromAsset || 'USDC',
        displaySize: params.displaySize,
        totalSize: params.totalAmount
      }
    };

    this.icebergOrders.set(order.id, order);
    return order;
  }

  getNextIcebergSlice(orderId: string): number {
    const order = this.icebergOrders.get(orderId);
    if (!order || order.status !== 'open') return 0;

    const remainingAmount = order.totalSize - order.executedSize;
    return Math.min(order.displaySize, remainingAmount);
  }

  // TWAP Order Management
  createTWAPOrder(params: CreateTWAPParams): TWAPOrder {
    const startTime = params.startTime || new Date();
    const endTime = new Date(startTime.getTime() + params.executionPeriod * 60 * 1000);
    const intervalDuration = params.intervalDuration || Math.max(1, params.executionPeriod / 10);
    const sliceCount = Math.ceil(params.executionPeriod / intervalDuration);
    const amountPerSlice = params.amount / sliceCount;

    const slices: TWAPSlice[] = [];
    for (let i = 0; i < sliceCount; i++) {
      const sliceTime = new Date(startTime.getTime() + i * intervalDuration * 60 * 1000);
      slices.push({
        id: `slice_${i}`,
        orderId: '',
        sliceNumber: i + 1,
        amount: amountPerSlice,
        scheduledTime: sliceTime,
        status: 'pending',
        fills: []
      });
    }

    const order: TWAPOrder = {
      id: `twap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'twap',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      price: params.priceLimit,
      timeInForce: 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.amount * ASSET_PRICES[params.asset],
      requiredBalance: params.amount * ASSET_PRICES[params.asset],
      executionPeriod: params.executionPeriod,
      intervalDuration,
      startTime,
      endTime,
      slices,
      currentSliceIndex: 0,
      metadata: {
        fromAsset: params.fromAsset || 'USDC',
        executionPeriod: params.executionPeriod,
        intervalDuration
      }
    };

    // Update slice order IDs
    slices.forEach(slice => slice.orderId = order.id);

    this.twapOrders.set(order.id, order);
    return order;
  }

  // VWAP Order Management
  createVWAPOrder(params: CreateVWAPParams): VWAPOrder {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + params.executionPeriod * 60 * 1000);
    
    // Mock volume profile (normally would be historical data)
    const volumeProfile = this.generateVolumeProfile(params.executionPeriod);
    const sliceCount = volumeProfile.length;
    const baseAmountPerSlice = params.amount / sliceCount;

    const slices: VWAPSlice[] = volumeProfile.map((volumeWeight, i) => ({
      id: `vwap_slice_${i}`,
      orderId: '',
      sliceNumber: i + 1,
      amount: baseAmountPerSlice * volumeWeight,
      scheduledTime: new Date(startTime.getTime() + (i * params.executionPeriod * 60 * 1000) / sliceCount),
      status: 'pending',
      fills: [],
      targetVolume: volumeWeight * 1000, // Mock target volume
      marketVolume: 0,
      participationAchieved: 0
    }));

    const order: VWAPOrder = {
      id: `vwap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'vwap',
      side: params.side,
      status: 'open',
      asset: params.asset,
      amount: params.amount,
      filled: 0,
      remaining: params.amount,
      price: params.priceLimit,
      timeInForce: 'GTC',
      priority: 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      fills: [],
      totalFees: 0,
      averageFillPrice: 0,
      slippageTolerance: 0.005,
      estimatedCost: params.amount * ASSET_PRICES[params.asset],
      requiredBalance: params.amount * ASSET_PRICES[params.asset],
      participationRate: params.participationRate,
      executionPeriod: params.executionPeriod,
      volumeProfile,
      slices,
      metadata: {
        fromAsset: params.fromAsset || 'USDC',
        participationRate: params.participationRate,
        executionPeriod: params.executionPeriod
      }
    };

    // Update slice order IDs
    slices.forEach(slice => slice.orderId = order.id);

    this.vwapOrders.set(order.id, order);
    return order;
  }

  private generateVolumeProfile(periods: number): number[] {
    // Generate a realistic volume profile (higher at market open/close)
    const profile: number[] = [];
    for (let i = 0; i < periods; i++) {
      const timeRatio = i / periods;
      // U-shaped volume pattern (higher at start and end)
      const volumeWeight = 0.5 + 0.5 * Math.cos(timeRatio * Math.PI);
      profile.push(Math.max(0.3, volumeWeight)); // Minimum 30% of average
    }
    
    // Normalize to sum to periods
    const sum = profile.reduce((a, b) => a + b, 0);
    return profile.map(v => (v / sum) * periods);
  }

  // Getters for order management
  getOCOOrders(): OCOOrder[] {
    return Array.from(this.ocoOrders.values());
  }

  getTrailingStops(): TrailingStopOrder[] {
    return Array.from(this.trailingStops.values());
  }

  getIcebergOrders(): IcebergOrder[] {
    return Array.from(this.icebergOrders.values());
  }

  getTWAPOrders(): TWAPOrder[] {
    return Array.from(this.twapOrders.values());
  }

  getVWAPOrders(): VWAPOrder[] {
    return Array.from(this.vwapOrders.values());
  }

  // Clean up completed orders
  cleanup(): void {
    // Remove completed OCO orders after 24 hours
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const [id, order] of this.ocoOrders.entries()) {
      if (order.status !== 'active' && order.updatedAt.getTime() < cutoffTime) {
        this.ocoOrders.delete(id);
      }
    }
    
    // Similar cleanup for other order types
    for (const [id, order] of this.trailingStops.entries()) {
      if (order.status !== 'open' && order.updatedAt.getTime() < cutoffTime) {
        this.trailingStops.delete(id);
      }
    }
  }
}

// Singleton instance
export const advancedOrderEngine = new AdvancedOrderEngine();