
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp } from "lucide-react";

interface StakingCalculatorProps {
  selectedPool?: string;
  onPoolChange: (poolId: string) => void;
}

const POOLS = [
  { id: "maang-usdc", name: "MAANG/USDC", apy: 24.8 },
  { id: "eto-usdc", name: "ETO/USDC", apy: 18.5 },
  { id: "maang-solo", name: "MAANG Solo", apy: 15.2 },
  { id: "usdc-solo", name: "USDC Solo", apy: 8.7 },
];

export function StakingCalculator({ selectedPool, onPoolChange }: StakingCalculatorProps) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("365");

  const selectedPoolData = POOLS.find(p => p.id === selectedPool);
  const stakingAmount = parseFloat(amount) || 0;
  const days = parseInt(duration) || 365;
  const apy = selectedPoolData?.apy || 0;

  const dailyReward = (stakingAmount * (apy / 100)) / 365;
  const totalReward = dailyReward * days;
  const finalAmount = stakingAmount + totalReward;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono">
          <Calculator className="h-5 w-5" />
          Staking Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Pool</Label>
            <Select value={selectedPool} onValueChange={onPoolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pool" />
              </SelectTrigger>
              <SelectContent>
                {POOLS.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name} - {pool.apy}% APY
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount to Stake</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Staking Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">180 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stakingAmount > 0 && selectedPoolData && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-accent/20 rounded-sm">
                <p className="text-sm text-muted-foreground">Daily Rewards</p>
                <p className="text-lg font-mono font-bold text-data-positive">
                  ${dailyReward.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-3 bg-accent/20 rounded-sm">
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-lg font-mono font-bold text-data-positive">
                  ${totalReward.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-primary/10 rounded-sm border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-data-positive" />
                <p className="text-sm text-muted-foreground">Final Amount</p>
              </div>
              <p className="text-2xl font-mono font-bold text-data-positive">
                ${finalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalReward / stakingAmount) * 100).toFixed(1)}% return
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
