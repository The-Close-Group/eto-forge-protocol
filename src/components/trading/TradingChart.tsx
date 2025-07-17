import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Maximize2 } from "lucide-react";

const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];

export const TradingChart = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  return (
    <div className="trading-panel">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold mono">BTC/USD</h3>
              <Badge variant="outline" className="text-xs mono">PERP</Badge>
            </div>
            
            <div className="text-2xl font-bold mono">$43,256.78</div>
            <div className="flex items-center text-data-positive text-sm mono">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.34% (+$987.45)
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex border border-border rounded-sm">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf)}
                  className="mono text-xs px-3 py-1 rounded-none first:rounded-l-sm last:rounded-r-sm"
                >
                  {tf}
                </Button>
              ))}
            </div>
            
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BarChart3 className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative h-96 bg-card">
        {/* Chart placeholder with grid */}
        <div className="absolute inset-0 grid-lines opacity-10"></div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <div className="text-lg font-semibold mono text-muted-foreground">Trading Chart</div>
            <div className="text-sm text-muted-foreground mono">Chart integration coming soon</div>
          </div>
        </div>
        
        {/* Price levels overlay */}
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-card to-transparent">
          <div className="p-2 space-y-8 text-xs mono text-muted-foreground">
            <div>43,500</div>
            <div>43,400</div>
            <div>43,300</div>
            <div>43,200</div>
            <div>43,100</div>
            <div>43,000</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-6 gap-4 text-xs mono">
          <div>
            <div className="text-muted-foreground">24h High</div>
            <div className="font-medium">$43,789.45</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Low</div>
            <div className="font-medium">$42,123.67</div>
          </div>
          <div>
            <div className="text-muted-foreground">Volume</div>
            <div className="font-medium">$1.2B</div>
          </div>
          <div>
            <div className="text-muted-foreground">Open Interest</div>
            <div className="font-medium">$890M</div>
          </div>
          <div>
            <div className="text-muted-foreground">Funding Rate</div>
            <div className="font-medium text-data-positive">0.0123%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Next Funding</div>
            <div className="font-medium">3h 45m</div>
          </div>
        </div>
      </div>
    </div>
  );
};