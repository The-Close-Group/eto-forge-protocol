
import { useState, useEffect } from "react";
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
  BarChart3,
  Plus
} from "lucide-react";
import { StakingPoolCard } from "@/components/StakingPoolCard";
import { StakingCalculator } from "@/components/StakingCalculator";
import { StakingWidget } from "@/components/StakingWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const STAKING_POOLS = [
  {
    id: "maang-usdc",
    name: "MAANG/USDC",
    apy: "24.8%",
    risk: "Medium" as const,
    lockPeriod: "90 days",
    minStake: "$1,000",
    totalStaked: "$0.00",
    description: "Balanced pair with MAANG growth potential",
    autoCompound: true,
    rewards: "$0.00/day"
  },
  {
    id: "eto-usdc",
    name: "ETO/USDC",
    apy: "18.5%",
    risk: "Low" as const,
    lockPeriod: "30 days",
    minStake: "$500",
    totalStaked: "$0.00",
    description: "Platform token staking with stability",
    autoCompound: true,
    rewards: "$0.00/day"
  },
  {
    id: "maang-solo",
    name: "MAANG Solo",
    apy: "15.2%",
    risk: "High" as const,
    lockPeriod: "180 days",
    minStake: "$2,000",
    totalStaked: "$0.00",
    description: "Pure MAANG exposure for maximum growth",
    autoCompound: false,
    rewards: "$0.00/day"
  },
  {
    id: "usdc-solo",
    name: "USDC Solo",
    apy: "8.7%",
    risk: "Low" as const,
    lockPeriod: "7 days",
    minStake: "$100",
    totalStaked: "$0.00",
    description: "Stable yield with USD backing",
    autoCompound: true,
    rewards: "$0.00/day"
  }
];

const USER_POSITIONS: any[] = [];

export default function Staking() {
  const [selectedPool, setSelectedPool] = useState<string>("maang-usdc");
  const [isStakingWidgetOpen, setIsStakingWidgetOpen] = useState(true); // Always visible by default
  const [selectedStakingPool, setSelectedStakingPool] = useState<any>(null);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);
  const [isIsolated, setIsIsolated] = useState(false);
  const isMobile = useIsMobile();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openWidget = urlParams.get('openWidget');
    const expand = urlParams.get('expand');
    const poolId = urlParams.get('pool');

    if (openWidget === 'true') {
      setIsStakingWidgetOpen(true);
      if (expand === 'true') {
        setIsWidgetExpanded(true);
      }
      if (poolId) {
        const pool = STAKING_POOLS.find(p => p.id === poolId);
        if (pool) {
          setSelectedStakingPool(pool);
        }
      }
    }
  }, []);

  const handleStakePool = (poolId: string) => {
    const pool = STAKING_POOLS.find(p => p.id === poolId);
    setSelectedStakingPool(pool);
    setIsStakingWidgetOpen(true);
    setIsWidgetExpanded(true);
  };


  const handleToggleWidget = () => {
    if (!isStakingWidgetOpen) {
      setIsStakingWidgetOpen(true);
    }
    setIsWidgetExpanded(!isWidgetExpanded);
  };

  const handleStakeNow = () => {
    setIsIsolated(true);
  };

  const handleCloseWidget = () => {
    setIsStakingWidgetOpen(false);
    setIsWidgetExpanded(false);
    setIsIsolated(false);
  };

  const totalStaked = "$0.00";
  const totalRewards = "$0.00";
  const totalApy = "0.0%";

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold font-mono text-foreground">Staking</h1>
        <p className="text-muted-foreground">
          Advanced yield optimization and liquidity provision
        </p>
      </div>

      {/* Staking Widget - Embedded at top */}
      <StakingWidget
        isOpen={isStakingWidgetOpen}
        onClose={handleCloseWidget}
        selectedPool={selectedStakingPool}
        isExpanded={isWidgetExpanded}
        onToggleExpanded={handleToggleWidget}
        isIsolated={isIsolated}
        onStakeNow={handleStakeNow}
      />

      {/* Portfolio Overview */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-4 gap-4 transition-opacity duration-300",
        isIsolated && "hidden"
      )}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{totalStaked}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>No positions yet</span>
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
            <div className="text-2xl font-mono font-bold">{totalRewards}</div>
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
            <div className="text-2xl font-mono font-bold">{totalApy}</div>
            <div className="text-sm text-muted-foreground">Weighted average</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{STAKING_POOLS.length}</div>
            <div className="text-sm text-muted-foreground">Available staking options</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className={cn(
        "w-full transition-opacity duration-300",
        isIsolated && "hidden"
      )}>
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
                {USER_POSITIONS.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground font-mono text-lg mb-2">No Active Positions</div>
                    <div className="text-sm text-muted-foreground">
                      Start staking to see your positions here
                    </div>
                  </div>
                ) : (
                  USER_POSITIONS.map((position, index) => (
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
                        <Button variant="outline" size="sm" className="font-mono">
                          Claim
                        </Button>
                        <Button variant="outline" size="sm" className="font-mono">
                          Unstake
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
                    <span className="font-mono font-semibold">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Stakers</span>
                    <span className="font-mono font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average APY</span>
                    <span className="font-mono font-semibold">16.8%</span>
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
