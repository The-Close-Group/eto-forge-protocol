
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Eye, ExternalLink, Plus, Activity } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useNavigate } from "react-router-dom";

export default function Portfolio() {
  const { assets, totalValue, totalInvested, totalProfitLoss, totalProfitLossPercent } = usePortfolio();
  const navigate = useNavigate();

  const handleStartTrading = () => {
    navigate('/trade');
  };

  // Mock recent transactions (this would come from actual trade history)
  const transactions = [
    { type: "Swap", fromAsset: "USDC", toAsset: "ETH", amount: "500", time: "2 hours ago", hash: "0x1234...5678" },
    { type: "Swap", fromAsset: "ETH", toAsset: "MAANG", amount: "0.1", time: "5 hours ago", hash: "0x5678...9abc" },
    { type: "Swap", fromAsset: "USDC", toAsset: "AVAX", amount: "1000", time: "1 day ago", hash: "0x9abc...def0" },
  ];

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground">
          Track your assets across all connected chains
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold leading-tight">
              ${totalValue.toFixed(2)}
            </div>
            {totalValue > 0 ? (
              <div className={`flex items-center gap-1 text-sm leading-relaxed ${
                totalProfitLoss >= 0 ? 'text-data-positive' : 'text-data-negative'
              }`}>
                {totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                <span className="truncate">{totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)} ({totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(1)}%)</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground leading-relaxed">No positions yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold leading-tight">{assets.length}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {assets.length > 0 ? `Across multiple chains` : 'Start trading to build your portfolio'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              (() => {
                const bestPerformer = assets.reduce((best, current) => 
                  current.profitLossPercent > best.profitLossPercent ? current : best
                );
                return (
                  <div>
                    <div 
                      className="text-lg lg:text-xl font-bold leading-tight cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={() => navigate(`/asset/${bestPerformer.symbol}`)}
                    >
                      {bestPerformer.symbol}
                    </div>
                    <div className={`flex items-center gap-1 text-sm leading-relaxed ${
                      bestPerformer.profitLossPercent >= 0 ? 'text-data-positive' : 'text-data-negative'
                    }`}>
                      {bestPerformer.profitLossPercent >= 0 ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                      <span className="truncate">{bestPerformer.profitLossPercent >= 0 ? '+' : ''}{bestPerformer.profitLossPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>
                <div className="text-lg lg:text-xl font-bold text-muted-foreground leading-tight">--</div>
                <div className="text-sm text-muted-foreground leading-relaxed">No trades yet</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-sm">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-primary">{asset.symbol.slice(0, 2)}</span>
                        </div>
                        <div className="min-w-0">
                          <p 
                            className="font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                            onClick={() => navigate(`/asset/${asset.symbol}`)}
                          >
                            {asset.name}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed truncate">
                            {asset.amount.toFixed(4)} {asset.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="font-semibold leading-relaxed truncate">${asset.currentValue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed truncate">
                          Avg: ${asset.averagePrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right min-w-0">
                        <div className={`flex items-center gap-1 justify-end ${
                          asset.profitLoss >= 0 ? 'text-data-positive' : 'text-data-negative'
                        }`}>
                          {asset.profitLoss >= 0 ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                          <span className="font-medium leading-relaxed truncate">
                            {asset.profitLoss >= 0 ? '+' : ''}${asset.profitLoss.toFixed(2)}
                          </span>
                        </div>
                        <div className={`text-sm leading-relaxed text-right ${
                          asset.profitLossPercent >= 0 ? 'text-data-positive' : 'text-data-negative'
                        }`}>
                          {asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(1)}%
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => navigate(`/asset/${asset.symbol}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Assets Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start trading to build your portfolio and track your assets
                  </p>
                  <Button onClick={handleStartTrading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-sm">
                      <div className="flex items-center gap-4">
                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {tx.type}
                        </div>
                        <div>
                          <p className="font-semibold">{tx.fromAsset} → {tx.toAsset}</p>
                          <p className="text-sm text-muted-foreground">{tx.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tx.time}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{tx.hash}</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your trading history will appear here after you execute trades
                  </p>
                  <Button onClick={handleStartTrading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {totalValue > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-sm">
                      <p className="text-xl lg:text-2xl font-bold leading-tight">${totalInvested.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">Total Invested</p>
                    </div>
                    <div className="text-center p-4 border rounded-sm">
                      <p className={`text-xl lg:text-2xl font-bold leading-tight ${
                        totalProfitLoss >= 0 ? 'text-data-positive' : 'text-data-negative'
                      }`}>
                        {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">Total P&L</p>
                    </div>
                  </div>
                  <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-sm">
                    Performance chart will be implemented here
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Execute some trades to see your portfolio performance analytics
                  </p>
                  <Button onClick={handleStartTrading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
