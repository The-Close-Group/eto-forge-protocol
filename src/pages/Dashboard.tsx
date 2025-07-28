
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Percent, Activity, TrendingUp, Wallet, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-6 pb-20 md:pb-6 space-y-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground leading-relaxed">Overview of your portfolio and trading activity</p>
        </div>

        {/* Total Value & Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Portfolio value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="text-3xl font-bold font-mono">$0.00</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>No assets yet</span>
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link to="/wallet">Get started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Quick action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/trade">
                  <TrendingUp className="h-4 w-4" />
                  Start trading
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/assets">
                  <Coins className="h-4 w-4" />
                  View assets
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Staking overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total staked</span>
                  <span className="font-mono font-medium">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current APY</span>
                  <span className="font-mono font-medium">0.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total rewards</span>
                  <span className="font-mono font-medium">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Trading activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total trades</span>
                  <span className="font-mono font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">LP trades</span>
                  <span className="font-mono font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-mono font-medium">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="font-medium">No activity yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your trading activity will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/wallet">View wallet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
