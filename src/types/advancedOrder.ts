// Advanced Order Type Definitions
// Specialized interfaces for complex order types

import { Order, OrderType, OrderSide, TimeInForce, Priority } from './order';

export interface OCOOrder {
  id: string;
  primaryOrder: Order;
  secondaryOrder: Order;
  status: 'active' | 'triggered' | 'cancelled';
  triggeredOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrailingStopOrder extends Order {
  type: 'trailing_stop';
  trailAmount?: number;
  trailPercent?: number;
  peakPrice: number;
  initialStopPrice: number;
  currentStopPrice: number;
}

export interface IcebergOrder extends Order {
  type: 'iceberg';
  displaySize: number;
  totalSize: number;
  executedSize: number;
  currentSlice: number;
  sliceCount: number;
}

export interface TWAPOrder extends Order {
  type: 'twap';
  executionPeriod: number; // in minutes
  intervalDuration: number; // in minutes
  startTime: Date;
  endTime: Date;
  slices: TWAPSlice[];
  currentSliceIndex: number;
}

export interface VWAPOrder extends Order {
  type: 'vwap';
  participationRate: number; // percentage of volume
  executionPeriod: number;
  volumeProfile: number[];
  benchmarkVWAP?: number;
  slices: VWAPSlice[];
}

export interface TWAPSlice {
  id: string;
  orderId: string;
  sliceNumber: number;
  amount: number;
  scheduledTime: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executedAmount?: number;
  averagePrice?: number;
  fills: Array<{ amount: number; price: number; fee?: number }>;
}

export interface VWAPSlice extends TWAPSlice {
  targetVolume: number;
  marketVolume: number;
  participationAchieved: number;
}

export interface CreateOCOParams {
  asset: string;
  side: OrderSide;
  amount: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  timeInForce?: TimeInForce;
  fromAsset?: string;
}

export interface CreateTrailingStopParams {
  asset: string;
  side: OrderSide;
  amount: number;
  trailAmount?: number;
  trailPercent?: number;
  timeInForce?: TimeInForce;
  fromAsset?: string;
}

export interface CreateIcebergParams {
  asset: string;
  side: OrderSide;
  totalAmount: number;
  displaySize: number;
  price?: number;
  timeInForce?: TimeInForce;
  fromAsset?: string;
}

export interface CreateTWAPParams {
  asset: string;
  side: OrderSide;
  amount: number;
  executionPeriod: number; // minutes
  intervalDuration?: number; // minutes
  startTime?: Date;
  priceLimit?: number;
  fromAsset?: string;
}

export interface CreateVWAPParams {
  asset: string;
  side: OrderSide;
  amount: number;
  participationRate: number; // 0.1 = 10%
  executionPeriod: number;
  priceLimit?: number;
  fromAsset?: string;
}

export interface AdvancedOrderStats {
  ocoOrders: number;
  trailingStopOrders: number;
  icebergOrders: number;
  twapOrders: number;
  vwapOrders: number;
  averageSlippage: number;
  executionQuality: number;
  totalVolume: number;
}