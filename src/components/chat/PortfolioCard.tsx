import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp } from "lucide-react";
import CoinIcon from "@/components/CoinIcon";

interface Balance {
  asset: string;
  balance: number;
  available_balance: number;
  usd_value: number;
}

interface PortfolioCardProps {
  balances: Balance[];
}

export function PortfolioCard({ balances }: PortfolioCardProps) {
  const totalValue = balances.reduce((sum, b) => sum + (b.usd_value || 0), 0);
  const topAssets = balances
    .sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0))
    .slice(0, 4);

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 border-accent/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-accent" />
          <span className="font-semibold text-sm">Your Portfolio</span>
        </div>
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs font-medium">+12.4%</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">Total Value</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ${totalValue.toFixed(2)}
        </p>
      </div>
      
      <div className="space-y-2">
        {topAssets.map((balance) => (
          <div key={balance.asset} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
            <div className="flex items-center gap-2">
              <CoinIcon symbol={balance.asset} className="h-6 w-6" />
              <div>
                <p className="font-medium text-sm">{balance.asset}</p>
                <p className="text-xs text-muted-foreground">{balance.balance.toFixed(4)}</p>
              </div>
            </div>
            <p className="font-semibold text-sm">${balance.usd_value?.toFixed(2) || '0.00'}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
