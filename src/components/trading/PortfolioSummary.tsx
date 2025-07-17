import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Eye } from "lucide-react";

const positions = [
  { 
    token: "BTC", 
    amount: "0.2456", 
    value: "$10,623.45", 
    pnl: "+$1,234.56", 
    pnlPercent: "+13.2%", 
    positive: true 
  },
  { 
    token: "ETH", 
    amount: "5.789", 
    value: "$13,554.23", 
    pnl: "+$567.89", 
    pnlPercent: "+4.4%", 
    positive: true 
  },
  { 
    token: "SOL", 
    amount: "45.23", 
    value: "$4,454.67", 
    pnl: "-$123.45", 
    pnlPercent: "-2.7%", 
    positive: false 
  },
];

export const PortfolioSummary = () => {
  return (
    <div className="trading-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold mono">Portfolio</h2>
        <Button variant="outline" size="sm" className="mono">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold mono">$28,632.35</div>
          <div className="text-xs text-muted-foreground mono">Total Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold mono text-data-positive">+$1,678.00</div>
          <div className="text-xs text-muted-foreground mono">Total P&L</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold mono text-data-positive">+6.22%</div>
          <div className="text-xs text-muted-foreground mono">24h Return</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {positions.map((position) => (
          <div key={position.token} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold mono">{position.token}</span>
              </div>
              <div>
                <div className="font-medium mono text-sm">{position.amount} {position.token}</div>
                <div className="text-xs text-muted-foreground mono">{position.value}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-medium mono text-sm ${
                position.positive ? 'text-data-positive' : 'text-data-negative'
              }`}>
                {position.pnl}
              </div>
              <div className={`text-xs mono ${
                position.positive ? 'text-data-positive' : 'text-data-negative'
              }`}>
                {position.pnlPercent}
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};