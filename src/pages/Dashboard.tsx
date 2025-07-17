import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, Activity, Coins } from "lucide-react";
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345</div>
            <p className="text-xs text-muted-foreground">+2.5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Across 3 chains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$456</div>
            <p className="text-xs text-muted-foreground">12.5% APY</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89.2K</div>
            <p className="text-xs text-muted-foreground">+15.3% from yesterday</p>
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
                <p className="font-medium">Buy ETH</p>
                <p className="text-sm text-muted-foreground">Ethereum • 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">+0.5 ETH</p>
                <p className="text-sm text-muted-foreground">$1,234</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Stake USDC</p>
                <p className="text-sm text-muted-foreground">Polygon • 5 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">+1,000 USDC</p>
                <p className="text-sm text-muted-foreground">12.5% APY</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Sell BTC</p>
                <p className="text-sm text-muted-foreground">Arbitrum • 1 day ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">-0.02 BTC</p>
                <p className="text-sm text-muted-foreground">$890</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}