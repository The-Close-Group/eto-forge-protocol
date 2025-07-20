
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Activity, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";
import { StakingPoolCard } from "@/components/StakingPoolCard";
import { StakingCalculator } from "@/components/StakingCalculator";

const STAKING_POOLS = [
  {
    id: "maang-usdc",
    name: "MAANG/USDC",
    apy: "24.8%",
    risk: "Medium" as const,
    lockPeriod: "90 days",
    minStake: "$1,000",
    totalStaked: "$4.2M",
    description: "Balanced pair with MAANG growth potential",
    autoCompound: true,
    rewards: "$127.50/day"
  },
  {
    id: "eto-usdc",
    name: "ETO/USDC",
    apy: "18.5%",
    risk: "Low" as const,
    lockPeriod: "30 days",
    minStake: "$500",
    totalStaked: "$12.8M",
    description: "Platform token staking with stability",
    autoCompound: true,
    rewards: "$85.20/day"
  },
  {
    id: "maang-solo",
    name: "MAANG Solo",
    apy: "15.2%",
    risk: "High" as const,
    lockPeriod: "180 days",
    minStake: "$2,000",
    totalStaked: "$8.7M",
    description: "Pure MAANG exposure for maximum growth",
    autoCompound: false,
    rewards: "$204.80/day"
  },
  {
    id: "usdc-solo",
    name: "USDC Solo",
    apy: "8.7%",
    risk: "Low" as const,
    lockPeriod: "7 days",
    minStake: "$100",
    totalStaked: "$21.5M",
    description: "Stable yield with USD backing",
    autoCompound: true,
    rewards: "$34.70/day"
  }
];

const USER_POSITIONS = [
  {
    pool: "ETO/USDC",
    amount: "$5,000",
    rewards: "$127.50",
    apy: "18.5%",
    unlockDate: "2024-08-15",
    autoCompound: true
  },
  {
    pool: "USDC Solo",
    amount: "$2,500",
    rewards: "$45.20",
    apy: "8.7%",
    unlockDate: "2024-07-28",
    autoCompound: true
  }
];

export default function Staking() {
  const [selectedPool, setSelectedPool] = useState<string>("maang-usdc");

  const handleStakePool = (poolId: string) => {
    console.log(`Staking in pool: ${poolId}`);
    // Handle staking logic here
  };

  const totalStaked = "$7,500";
  const totalRewards = "$172.70";
  const totalApy = "15.2%";

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold font-mono text-foreground">Staking</h1>
        <p className="text-muted-foreground">
          Advanced yield optimization and liquidity provision
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{totalStaked}</div>
            <div className="flex items-center gap-1 text-sm text-data-positive">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-data-positive">{totalRewards}</div>
            <div className="text-sm text-muted-foreground">Daily earnings</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Average APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-data-positive">{totalApy}</div>
            <div className="text-sm text-muted-foreground">Weighted average</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pools" className="font-mono">Pools</TabsTrigger>
          <TabsTrigger value="positions" className="font-mono">My Positions</TabsTrigger>
          <TabsTrigger value="calculator" className="font-mono">Calculator</TabsTrigger>
          <TabsTrigger value="analytics" className="font-mono">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAKING_POOLS.map((pool) => (
              <StakingPoolCard
                key={pool.id}
                pool={pool}
                onStake={handleStakePool}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-mono">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {USER_POSITIONS.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div className="space-y-1">
                      <div className="font-mono font-semibold">{position.pool}</div>
                      <div className="text-sm text-muted-foreground">
                        Unlocks: {position.unlockDate}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-mono font-bold">{position.amount}</div>
                      <div className="text-sm text-data-positive">
                        {position.rewards} rewards
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className="bg-data-positive/20 text-data-positive border-data-positive/20">
                        {position.apy}
                      </Badge>
                      {position.autoCompound && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          Auto-compound
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Claim
                      </Button>
                      <Button variant="outline" size="sm">
                        Unstake
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <StakingCalculator 
            selectedPool={selectedPool}
            onPoolChange={setSelectedPool}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Protocol Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Value Locked</span>
                    <span className="font-mono font-semibold">$47.2M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Stakers</span>
                    <span className="font-mono font-semibold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average APY</span>
                    <span className="font-mono font-semibold text-data-positive">16.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-data-positive" />
                    <span className="text-sm">Staking Protocol: Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-data-positive" />
                    <span className="text-sm">Reward Distribution: Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-sm">Bridge Maintenance: 2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
