import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const marketData = [
  { symbol: "BTC/USD", price: "43,256.78", change: "+2.34%", positive: true },
  { symbol: "ETH/USD", price: "2,341.67", change: "+1.87%", positive: true },
  { symbol: "SOL/USD", price: "98.45", change: "-0.92%", positive: false },
  { symbol: "AVAX/USD", price: "36.21", change: "+5.67%", positive: true },
  { symbol: "MATIC/USD", price: "0.89", change: "-1.23%", positive: false },
];

export const MarketOverview = () => {
  return (
    <div className="trading-panel p-6">
      <h2 className="text-lg font-semibold mb-4 mono">Market Overview</h2>
      
      <div className="space-y-3">
        {marketData.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold mono">{item.symbol.split('/')[0].slice(0, 2)}</span>
              </div>
              <div>
                <span className="font-medium mono text-sm">{item.symbol}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium mono text-sm">${item.price}</div>
              <div className={`flex items-center text-xs mono ${
                item.positive ? 'text-data-positive' : 'text-data-negative'
              }`}>
                {item.positive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground mono">
          <span>Total Market Cap</span>
          <span>$1.87T</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mono mt-1">
          <span>24h Volume</span>
          <span>$89.4B</span>
        </div>
      </div>
    </div>
  );
};