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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Portfolio Value</CardTitle>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-bold">$12,345</div>
            <p className="text-base text-muted-foreground">+2.5% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Active Trades</CardTitle>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-bold">7</div>
            <p className="text-base text-muted-foreground">Across 3 chains</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Staking Rewards</CardTitle>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Coins className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-bold">$456</div>
            <p className="text-base text-muted-foreground">12.5% APY</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">24h Volume</CardTitle>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold">$89.2K</div>
            <p className="text-base text-muted-foreground">+15.3% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full h-14 text-lg" size="lg">
              <Link to="/trade">Start Trading</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-14 text-lg" size="lg">
              <Link to="/staking">View Staking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>


      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-lg">Buy ETH</p>
                <p className="text-base text-muted-foreground">Ethereum • 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">+0.5 ETH</p>
                <p className="text-base text-muted-foreground">$1,234</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-lg">Stake USDC</p>
                <p className="text-base text-muted-foreground">Polygon • 5 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">+1,000 USDC</p>
                <p className="text-base text-muted-foreground">12.5% APY</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-lg">Sell BTC</p>
                <p className="text-base text-muted-foreground">Arbitrum • 1 day ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">-0.02 BTC</p>
                <p className="text-base text-muted-foreground">$890</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}