
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Percent, Activity, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome to ETO</h1>
        <p className="text-muted-foreground">
          Cross-chain trading powered by Layer Zero with Dynamic Market Making
        </p>
      </div>

      {/* Total Portfolio Value Widget */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Total Portfolio Value</CardTitle>
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold">$123,456.78</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+2.4%</span>
              </div>
              <span className="text-sm text-muted-foreground">+$2,891.34 (24h)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,678</div>
            <p className="text-xs text-muted-foreground">Across all pools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Staked APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$456</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Pool Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Total LP transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Execute trades across multiple chains with our Dynamic Market Maker
            </p>
            <Button asChild className="w-full">
              <Link to="/trade">Start Trading</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staking Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Earn rewards by staking your assets in our protocol
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/staking">View Staking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Stake ETH</p>
                <p className="text-sm text-muted-foreground">Ethereum Pool • 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">+2.5 ETH</p>
                <p className="text-sm text-muted-foreground">$4,567</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Claim Rewards</p>
                <p className="text-sm text-muted-foreground">USDC Pool • 5 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">+45 USDC</p>
                <p className="text-sm text-muted-foreground">Staking rewards</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">LP Trade</p>
                <p className="text-sm text-muted-foreground">BTC-ETH Pool • 1 day ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Fee earned</p>
                <p className="text-sm text-muted-foreground">$12.30</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
