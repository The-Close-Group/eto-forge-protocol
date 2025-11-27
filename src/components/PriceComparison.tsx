import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";

export function PriceComparison() {
  const {
    oraclePrice,
    dmmPrice,
    isLoading,
    priceComparison,
    isPriceDeviationHigh,
    formattedOraclePrice,
    formattedDmmPrice,
    formattedDifference,
    maangMetrics,
  } = useDeFiPrices();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Price Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isHighDeviation = isPriceDeviationHigh(3); // 3% threshold
  const isDmmHigher = dmmPrice > oraclePrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          MAANG Price Comparison
          {isHighDeviation && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Deviation
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Oracle Price</div>
            <div className="text-2xl font-bold text-emerald-500">
              ${formattedOraclePrice}
            </div>
            <Badge variant="secondary" className="text-xs">
              Official Feed
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">DMM Price</div>
            <div className="text-2xl font-bold text-lime-400">
              ${formattedDmmPrice}
            </div>
            <Badge variant="secondary" className="text-xs">
              Market Maker
            </Badge>
          </div>
        </div>

        {/* Price Difference */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Price Difference</span>
            <div className="flex items-center gap-2">
              {isDmmHigher ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-mono ${isHighDeviation ? 'text-red-600' : 'text-muted-foreground'}`}>
                ${formattedDifference}
              </span>
            </div>
          </div>
          
          {priceComparison && (
            <div className="text-xs text-muted-foreground">
              {priceComparison.percentageDiff.toFixed(2)}% deviation
              {isDmmHigher ? " (DMM higher)" : " (Oracle higher)"}
            </div>
          )}
        </div>

        {/* Token Metrics */}
        {maangMetrics && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Token Metrics</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Supply:</span>
                <div className="font-mono">{maangMetrics.totalSupply} MAANG</div>
              </div>
              <div>
                <span className="text-muted-foreground">Contract:</span>
                <div className="font-mono text-xs">
                  {maangMetrics.address.slice(0, 6)}...{maangMetrics.address.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arbitrage Opportunity */}
        {isHighDeviation && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Arbitrage Opportunity</span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Price difference exceeds 3%. Consider arbitrage trading.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
