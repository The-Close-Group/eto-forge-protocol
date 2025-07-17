import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Lock, Unlock } from "lucide-react";

export default function Staking() {
  const stakingPools = [
    { 
      name: "ETO Staking", 
      apy: "18.5%", 
      asset: "ETO", 
      tvl: "$2.4M", 
      minStake: "100 ETO",
      lockPeriod: "30 days"
    },
    { 
      name: "USDC Pool", 
      apy: "12.3%", 
      asset: "USDC", 
      tvl: "$1.8M", 
      minStake: "1,000 USDC",
      lockPeriod: "14 days"
    },
    { 
      name: "ETH Validator", 
      apy: "8.7%", 
      asset: "ETH", 
      tvl: "$5.2M", 
      minStake: "0.1 ETH",
      lockPeriod: "90 days"
    },
  ];

  const activeStakes = [
    { pool: "ETO Staking", amount: "5,000 ETO", rewards: "45.2 ETO", apy: "18.5%", unlockDate: "2024-02-15" },
    { pool: "USDC Pool", amount: "2,500 USDC", rewards: "15.8 USDC", apy: "12.3%", unlockDate: "2024-01-28" },
  ];

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Staking</h1>
        <p className="text-muted-foreground">
          Earn rewards by staking your assets in our protocol
        </p>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,500</div>
            <p className="text-xs text-muted-foreground">Across 2 pools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$156.40</div>
            <p className="text-xs text-muted-foreground">+$12.30 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.4%</div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList>
          <TabsTrigger value="pools">Available Pools</TabsTrigger>
          <TabsTrigger value="active">My Stakes</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stakingPools.map((pool, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pool.name}</span>
                    <span className="text-green-500 font-bold">{pool.apy}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVL</span>
                      <span className="font-medium">{pool.tvl}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Stake</span>
                      <span className="font-medium">{pool.minStake}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lock Period</span>
                      <span className="font-medium">{pool.lockPeriod}</span>
                    </div>
                  </div>
                  <Button className="w-full">Stake {pool.asset}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Stakes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeStakes.map((stake, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{stake.pool}</h3>
                        <p className="text-sm text-muted-foreground">APY: {stake.apy}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{stake.amount}</p>
                        <p className="text-sm text-green-500">+{stake.rewards}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Unlocks: {stake.unlockDate}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Unlock className="h-4 w-4 mr-1" />
                        Claim Rewards
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staking Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stake Amount</Label>
                  <Input type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Asset</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>ETO</option>
                    <option>USDC</option>
                    <option>ETH</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-accent/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Daily Rewards:</span>
                  <span className="font-semibold">$2.47</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Rewards:</span>
                  <span className="font-semibold">$74.10</span>
                </div>
                <div className="flex justify-between">
                  <span>Yearly Rewards:</span>
                  <span className="font-semibold">$889.20</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}