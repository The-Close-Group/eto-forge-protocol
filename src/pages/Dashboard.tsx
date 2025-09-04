
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Activity, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserState } from "@/contexts/UserStateContext";
import { useAuth } from "@/contexts/AuthContext";
import { USDCFaucet } from "@/components/USDCFaucet";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import { usePrices } from "@/hooks/usePrices";
import { PriceComparison } from "@/components/PriceComparison";
import { OracleDMMChart } from "@/components/charts/OracleDMMChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const account = useActiveAccount();
  
  // Get blockchain balances
  const { 
    blockchainBalances, 
    isLoadingBlockchain, 
    getTotalPortfolioValueWithBlockchain 
  } = useBalances();
  
  // Get user state (for database balances)
  const { 
    balances: userBalances, 
    isLoading: isLoadingUser, 
    isNewUser 
  } = useUserState();
  
  // Get price data
  const { getTokenPrice } = usePrices();
  
  // Combine loading states
  const isLoading = isLoadingBlockchain || isLoadingUser;
  
  // Use blockchain balances if wallet is connected, otherwise show user balances
  const hasWallet = !!account?.address;
  const balances = hasWallet ? blockchainBalances : userBalances;
  const getTotalPortfolioValue = hasWallet ? getTotalPortfolioValueWithBlockchain : () => {
    return userBalances?.reduce((total, balance) => total + balance.usd_value, 0) || 0;
  };

  const trendingAssets = [
    { symbol: "ARB", change: "+8.7%", positive: true },
    { symbol: "OP", change: "+3.1%", positive: true },
    { symbol: "AVAX", change: "+3.2%", positive: true },
  ];

  const handleAssetClick = (symbol: string) => {
    // Asset details page removed - redirect to trade instead
    navigate("/trade");
  };

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isNewUser ? 'Welcome! Connect your wallet to get started' : 'Overview of your portfolio and trading activity'}
          </p>
        </div>

        {/* mUSDC Faucet - Show when wallet is connected */}
        {!isNewUser && (
          <div className="mb-6">
            <USDCFaucet />
          </div>
        )}

        {/* Total Value & Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Portfolio value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                   {(() => {
                     if (isLoading) return (
                       <div className="space-y-2">
                         <Skeleton className="h-8 w-40" />
                         <Skeleton className="h-4 w-64" />
                       </div>
                     );
                     
                     const hasBalances = balances && balances.length > 0;
                     const totalValue = getTotalPortfolioValue();
                     
                    return (
                      <>
                        <div className="text-2xl lg:text-3xl font-bold leading-tight">
                          ${hasBalances ? totalValue.toFixed(2) : '0.00'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground leading-relaxed">
                          <TrendingUp className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {!hasWallet 
                              ? 'Connect wallet to start trading'
                              : hasBalances 
                                ? 'Portfolio active' 
                                : 'No assets yet'
                            }
                          </span>
                        </div>
                        {hasBalances && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            {balances.slice(0, 3).map((balance, index) => (
                              <div key={hasWallet ? balance.symbol : balance.asset_symbol} className="p-3 border border-border rounded-sm">
                                <div className="text-xs text-muted-foreground">
                                  {hasWallet ? balance.symbol : balance.asset_symbol}
                                </div>
                                <div className="font-mono text-sm">
                                  {hasWallet 
                                    ? parseFloat(balance.balance).toFixed(4)
                                    : balance.balance.toFixed(4)
                                  }
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${hasWallet ? balance.usdValue : balance.usd_value.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <Button asChild size="sm">
                  <Link to="/trade">{hasWallet ? 'Start Trading' : 'Connect Wallet'}</Link>
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
                <Link to="/staking">
                  <Coins className="h-4 w-4" />
                  View staking
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
                  <span className="font-medium leading-relaxed text-right">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current APY</span>
                  <span className="font-medium leading-relaxed text-right">0.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total rewards</span>
                  <span className="font-medium leading-relaxed text-right">$0.00</span>
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
                  <span className="font-medium leading-relaxed text-right">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">LP trades</span>
                  <span className="font-medium leading-relaxed text-right">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-medium leading-relaxed text-right">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DeFi Price Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceComparison />
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingAssets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-sm hover:bg-accent/50 transition-colors">
                    <span 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleAssetClick(asset.symbol)}
                    >
                      {asset.symbol}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${
                      asset.positive ? 'text-data-positive' : 'text-data-negative'
                    }`}>
                      {asset.positive ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingUp className="h-4 w-4 flex-shrink-0 rotate-180" />}
                      <span className="font-medium">{asset.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price History Chart */}
        <OracleDMMChart />

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
                <Link to="/dashboard">View dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
