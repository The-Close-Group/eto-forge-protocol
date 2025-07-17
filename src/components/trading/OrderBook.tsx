import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const bids = [
  { price: "43,245.67", size: "0.2456", total: "10.62" },
  { price: "43,234.89", size: "0.1234", total: "5.33" },
  { price: "43,223.45", size: "0.5678", total: "24.55" },
  { price: "43,212.12", size: "0.3456", total: "14.92" },
  { price: "43,201.78", size: "0.7890", total: "34.11" },
];

const asks = [
  { price: "43,267.89", size: "0.3456", total: "14.95" },
  { price: "43,278.12", size: "0.1234", total: "5.34" },
  { price: "43,289.45", size: "0.6789", total: "29.38" },
  { price: "43,300.67", size: "0.2345", total: "10.15" },
  { price: "43,312.90", size: "0.8901", total: "38.53" },
];

export const OrderBook = () => {
  return (
    <div className="trading-panel">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold mono">Order Book</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs mono">BTC/USD</Badge>
            <Button variant="ghost" size="sm" className="mono text-xs">
              0.01
            </Button>
          </div>
        </div>
      </div>

      <div className="data-table">
        <div className="grid grid-cols-3 text-xs mono text-muted-foreground p-3 border-b border-border">
          <div>Price (USD)</div>
          <div className="text-right">Size (BTC)</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (sells) */}
        <div className="space-y-0">
          {asks.reverse().map((ask, index) => (
            <div
              key={index}
              className="grid grid-cols-3 text-xs mono px-3 py-1 hover:bg-muted/20 cursor-pointer relative"
            >
              <div 
                className="absolute inset-y-0 right-0 bg-destructive/10"
                style={{ width: `${Math.min(parseFloat(ask.total) * 2, 100)}%` }}
              ></div>
              <div className="relative z-10 text-data-negative">${ask.price}</div>
              <div className="relative z-10 text-right">{ask.size}</div>
              <div className="relative z-10 text-right text-muted-foreground">{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-3 py-2 border-y border-border bg-muted/20">
          <div className="flex justify-center items-center space-x-2 text-xs mono">
            <span className="text-muted-foreground">Spread:</span>
            <span className="font-medium">$22.22</span>
            <span className="text-muted-foreground">(0.05%)</span>
          </div>
        </div>

        {/* Bids (buys) */}
        <div className="space-y-0">
          {bids.map((bid, index) => (
            <div
              key={index}
              className="grid grid-cols-3 text-xs mono px-3 py-1 hover:bg-muted/20 cursor-pointer relative"
            >
              <div 
                className="absolute inset-y-0 right-0 bg-success/10"
                style={{ width: `${Math.min(parseFloat(bid.total) * 2, 100)}%` }}
              ></div>
              <div className="relative z-10 text-data-positive">${bid.price}</div>
              <div className="relative z-10 text-right">{bid.size}</div>
              <div className="relative z-10 text-right text-muted-foreground">{bid.total}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-xs mono">
          <div>
            <div className="text-muted-foreground">Bid Size</div>
            <div className="font-medium text-data-positive">2.34 BTC</div>
          </div>
          <div>
            <div className="text-muted-foreground">Ask Size</div>
            <div className="font-medium text-data-negative">1.89 BTC</div>
          </div>
        </div>
      </div>
    </div>
  );
};