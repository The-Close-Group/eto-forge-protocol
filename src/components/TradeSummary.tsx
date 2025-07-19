
import { Clock, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface TradeSummaryProps {
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  exchangeRate: string;
  networkFee: string;
  platformFee: string;
  priceImpact: number;
  estimatedTime: string;
  totalCost: string;
  showWarning?: boolean;
}

export function TradeSummary({
  fromAsset,
  toAsset,
  fromAmount,
  toAmount,
  exchangeRate,
  networkFee,
  platformFee,
  priceImpact,
  estimatedTime,
  totalCost,
  showWarning = false
}: TradeSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Trade Overview */}
      <div className="p-4 bg-accent/30 rounded-sm border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">You're trading</span>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-data-positive" />
            <span className="text-xs bg-data-positive/20 text-data-positive px-2 py-1 rounded">SECURE</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">{fromAmount} {fromAsset}</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-lg font-medium">{toAmount} {toAsset}</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Rate: {exchangeRate}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3 p-4 bg-accent/50 rounded-sm">
        <div className="flex justify-between text-sm">
          <span>Exchange Rate</span>
          <span className="font-mono">{exchangeRate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Network Fee</span>
          <span className="font-mono">{networkFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>ETO Fee</span>
          <span className="font-mono">{platformFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Price Impact</span>
          <span className={`font-mono ${
            priceImpact >= 0 ? 'text-data-positive' : 'text-data-negative'
          }`}>
            {priceImpact >= 0 ? '+' : ''}{priceImpact}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Est. Time
          </span>
          <span className="font-mono">{estimatedTime}</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Total Cost</span>
          <span className="font-mono">{totalCost}</span>
        </div>
      </div>

      {/* Price Impact Warning */}
      {showWarning && (
        <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-sm">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">High Price Impact</p>
            <p className="text-muted-foreground">Large trade may affect market price</p>
          </div>
        </div>
      )}
    </div>
  );
}
