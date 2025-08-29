
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Shield, Zap } from "lucide-react";

interface StakingPoolCardProps {
  pool: {
    id: string;
    name: string;
    apy: string;
    risk: "Low" | "Medium" | "High";
    lockPeriod: string;
    minStake: string;
    totalStaked: string;
    description: string;
    autoCompound: boolean;
    rewards: string;
  };
  onStake: (poolId: string) => void;
}

export function StakingPoolCard({ pool, onStake }: StakingPoolCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-data-positive/20 text-data-positive border-data-positive/20";
      case "Medium": return "bg-warning/20 text-warning border-warning/20";
      case "High": return "bg-destructive/20 text-destructive border-destructive/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{pool.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{pool.description}</p>
          </div>
          <Badge className={`${getRiskColor(pool.risk)} text-xs px-2 py-1`}>
            {pool.risk}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-data-positive" />
              <span className="text-sm text-muted-foreground">APY</span>
            </div>
            <div className="text-2xl font-mono font-bold text-data-positive">{pool.apy}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Lock Period</span>
            </div>
            <div className="text-lg font-mono font-medium">{pool.lockPeriod}</div>
          </div>
        </div>

        <div className="space-y-3 py-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Min Stake</span>
            <span className="font-mono font-medium">{pool.minStake}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Staked</span>
            <span className="font-mono font-medium">{pool.totalStaked}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rewards</span>
            <span className="font-mono font-medium text-data-positive">{pool.rewards}</span>
          </div>
        </div>

        {pool.autoCompound && (
          <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-sm border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Auto-Compound Enabled</span>
          </div>
        )}

        <Button 
          onClick={() => onStake(pool.id)}
          className="w-full font-medium"
        >
          Stake Now
        </Button>
      </CardContent>
    </Card>
  );
}
