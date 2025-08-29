// Order Management Type Definitions
// Comprehensive order system interfaces

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'take_profit' | 'oco' | 'trailing_stop' | 'iceberg' | 'twap' | 'vwap';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'rejected' | 'expired';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'DAY';
export type Priority = 'slow' | 'standard' | 'fast';

export interface OrderFill {
  id: string;
  orderId: string;
  timestamp: Date;
  amount: number;
  price: number;
  fee: number;
  txHash?: string;
}

export interface Order {
  id: string;
  userId?: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  asset: string;
  amount: number;
  filled: number;
  remaining: number;
  price?: number; // For limit orders
  stopPrice?: number; // For stop orders
  timeInForce: TimeInForce;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  fills: OrderFill[];
  totalFees: number;
  averageFillPrice: number;
  slippageTolerance: number;
  estimatedCost: number;
  requiredBalance: number;
  metadata?: {
    fromAsset?: string;
    originalAmount?: number;
    estimatedGas?: number;
    priceImpact?: number;
    marketImpact?: number;
    // OCO specific
    linkedOrderId?: string;
    // Trailing stop specific
    trailAmount?: number;
    trailPercent?: number;
    peakPrice?: number;
    // Iceberg specific
    displaySize?: number;
    totalSize?: number;
    executedSize?: number;
    // TWAP/VWAP specific
    executionPeriod?: number;
    intervalDuration?: number;
    startTime?: Date;
    endTime?: Date;
    participationRate?: number;
    volumeProfile?: number[];
  };
}

export interface OrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredBalance: number;
  estimatedCost: number;
  priceImpact: number;
  slippage: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  orders: number;
}

export interface OrderBook {
  asset: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  midPrice: number;
  lastUpdate: Date;
}

export interface CreateOrderParams {
  type: OrderType;
  side: OrderSide;
  asset: string;
  amount: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  priority?: Priority;
  slippageTolerance?: number;
  fromAsset?: string;
}

export interface OrderExecutionResult {
  success: boolean;
  orderId?: string;
  error?: string;
  fills?: OrderFill[];
  remainingAmount?: number;
  totalCost?: number;
}

export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  totalVolume: number;
  averageFillTime: number;
}