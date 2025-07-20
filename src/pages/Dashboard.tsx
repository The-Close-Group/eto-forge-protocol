
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Percent, Activity, TrendingUp, Wallet, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      {/* Total Portfolio Value - Empty State */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Total Portfolio Value</CardTitle>
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-mono">$0.00</div>
          <div className="flex items-center mt-2">
            <span className="text-muted-foreground">No assets yet</span>
          </div>
          <div className="mt-4">
            <Button asChild className="gap-2">
              <Link to="/wallet">
                <Plus className="h-4 w-4" />
                Get Started
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - All Zero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">$0.00</div>
            <p className="text-xs text-muted-foreground">No staked assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Staked APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-muted-foreground">0.0%</div>
            <p className="text-xs text-muted-foreground">No active stakes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">$0.00</div>
            <p className="text-xs text-muted-foreground">No rewards earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Pool Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">0</div>
            <p className="text-xs text-muted-foreground">No LP transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Get Started Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buy Your First Asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start by purchasing digital assets with credit card or bank transfer
            </p>
            <Button asChild className="w-full">
              <Link to="/trade">Buy Assets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explore Available Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Browse and research available tokens and their market performance
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/assets">View Assets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Empty Activity State */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/30 rounded-sm flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No activity yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Your transactions and activities will appear here
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/wallet">
                View Wallet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
