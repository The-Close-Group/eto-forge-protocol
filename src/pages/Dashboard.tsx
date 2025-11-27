
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Activity, TrendingUp, CheckCircle2, AlertTriangle, Server, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserState } from "@/contexts/UserStateContext";
import { useAuth } from "@/contexts/AuthContext";
import { USDCFaucet } from "@/components/USDCFaucet";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { usePrices } from "@/hooks/usePrices";
import { PriceComparison } from "@/components/PriceComparison";
import { OracleDMMChart } from "@/components/charts/OracleDMMChart";
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
import { Badge } from "@/components/ui/badge";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

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
  
  // Get protocol stats (TVL, health, etc.)
  const { data: protocolStats, isLoading: isLoadingProtocol } = useProtocolStats();
  
  // Get protocol activity (drips, syncs, etc.)
  const { data: protocolActivity, isLoading: isLoadingActivity } = useProtocolActivity();
  
  // Combine loading states
  const isLoading = isLoadingBlockchain || isLoadingUser;
  
  // Use blockchain balances if wallet is connected, otherwise show user balances
  const hasWallet = !!account?.address;
  const balances = hasWallet ? blockchainBalances : userBalances;
  const getTotalPortfolioValue = hasWallet ? getTotalPortfolioValueWithBlockchain : () => {
    return userBalances?.reduce((total, balance) => total + balance.usd_value, 0) || 0;
  };

  const trendingAssets = [
    { symbol: "MAANG", change: "+0.0%", positive: true },
    { symbol: "mUSDC", change: "~$1.00", positive: true },
    { symbol: "sMAANG", change: "LP Shares", positive: true },
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
                {hasWallet ? (
                  <Button asChild size="sm">
                    <Link to="/trade">Start Trading</Link>
                  </Button>
                ) : (
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={etoMainnet}
                    chains={supportedChains}
                    connectModal={{ size: "compact" }}
                    connectButton={{
                      label: "Connect Wallet",
                      style: {
                        height: "36px",
                        fontSize: "14px",
                      },
                    }}
                  />
                )}
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

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Protocol Status
                {protocolStats && (
                  <Badge variant={protocolStats.isHealthy ? "default" : "destructive"} className="ml-auto">
                    {protocolStats.isHealthy ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Healthy</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Warning</>
                    )}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Value Locked</span>
                  <span className="font-medium leading-relaxed text-right">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-20" /> : 
                      `$${(protocolStats?.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">DRI Price (DMM)</span>
                  <span className="font-medium leading-relaxed text-right">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-20" /> : 
                      `$${(protocolStats?.dmmPrice || 0).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price Deviation</span>
                  <span className={`font-medium leading-relaxed text-right ${
                    Math.abs(protocolStats?.priceDeviation || 0) < 10 ? 'text-data-positive' : 'text-data-negative'
                  }`}>
                    {isLoadingProtocol ? <Skeleton className="h-4 w-16" /> : 
                      `${(protocolStats?.priceDeviation || 0).toFixed(2)} bps`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Vault Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <span className="font-medium leading-relaxed text-right">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-20" /> : 
                      `${(protocolStats?.vaultTotalAssets || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} DRI`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Share Price</span>
                  <span className="font-medium leading-relaxed text-right">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-16" /> : 
                      `${(protocolStats?.vaultSharePrice || 1).toFixed(4)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">DMM Liquidity</span>
                  <span className="font-medium leading-relaxed text-right">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-20" /> : 
                      `${(protocolStats?.totalLiquidity || 0).toFixed(2)} LP`
                    }
                  </span>
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

        {/* Protocol Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Protocol Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingActivity ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : protocolActivity && protocolActivity.length > 0 ? (
                protocolActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-sm hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        activity.type === 'drip_execute' ? 'bg-data-positive/20 text-data-positive' :
                        activity.type === 'drip_commit' ? 'bg-primary/20 text-primary' :
                        activity.type === 'deposit' ? 'bg-blue-500/20 text-blue-500' :
                        activity.type === 'withdraw' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {activity.type === 'drip_execute' ? 'D' :
                         activity.type === 'drip_commit' ? 'C' :
                         activity.type === 'deposit' ? '+' :
                         activity.type === 'withdraw' ? '-' :
                         activity.type === 'sync' ? 'S' : '?'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{activity.description}</div>
                        {activity.amount && (
                          <div className="text-xs text-muted-foreground">{activity.amount}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">{activity.timeAgo}</div>
                        <div className="text-xs text-muted-foreground">Block #{activity.blockNumber}</div>
                      </div>
                      {activity.txHash && (
                        <a 
                          href={`https://eto-explorer.ash.center/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent protocol activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
