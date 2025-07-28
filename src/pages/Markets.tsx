
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react";
import { BlockchainSelector } from "@/components/BlockchainSelector";
import { useNavigate } from "react-router-dom";

export default function Markets() {
  const navigate = useNavigate();
  
  const markets = [
    { symbol: "ETH/USDC", asset: "ETH", price: "$3,567.00", change: "+1.8%", volume: "$12.8B", positive: true },
    { symbol: "BTC/USDC", asset: "BTC", price: "$45,000.00", change: "+1.2%", volume: "$28B", positive: true },
    { symbol: "ARB/USDC", asset: "ARB", price: "$0.90", change: "+8.7%", volume: "$458M", positive: true },
    { symbol: "OP/USDC", asset: "OP", price: "$1.85", change: "+3.1%", volume: "$312M", positive: true },
    { symbol: "MATIC/USDC", asset: "MATIC", price: "$0.75", change: "-0.8%", volume: "$298M", positive: false },
  ];

  const handleAssetClick = (asset: string) => {
    navigate(`/asset/${asset}`);
  };

  const gainers = [
    { symbol: "ARB/USDC", change: "+8.7%" },
    { symbol: "OP/USDC", change: "+3.1%" },
    { symbol: "ETH/USDC", change: "+2.5%" },
  ];

  const losers = [
    { symbol: "BTC/USDC", change: "-1.2%" },
    { symbol: "MATIC/USDC", change: "-0.8%" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Blockchain Selector */}
      <BlockchainSelector />
      
      {/* Main Content */}
      <div className="flex-1 p-6 pb-20 md:pb-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-mono text-foreground">Markets</h1>
          <p className="text-muted-foreground">
            Explore trading opportunities across all supported chains
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-mono">Total Volume 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold leading-tight">$171.6M</div>
              <p className="text-xs text-data-positive leading-relaxed">+12.5% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-mono">Active Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold leading-tight">24</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Across 5 chains</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-mono">Top Gainer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold leading-tight cursor-pointer hover:text-primary transition-colors" onClick={() => handleAssetClick('ARB')}>ARB/USDC</div>
              <p className="text-xs text-data-positive leading-relaxed">+8.7%</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-mono">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold leading-tight">$2.4T</div>
              <p className="text-xs text-data-positive leading-relaxed">+0.8%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all" className="font-mono">All Markets</TabsTrigger>
              <TabsTrigger value="gainers" className="font-mono">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers" className="font-mono">Top Losers</TabsTrigger>
              <TabsTrigger value="watchlist" className="font-mono">Watchlist</TabsTrigger>
            </TabsList>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search markets..." className="pl-9 font-mono" />
            </div>
          </div>

          <TabsContent value="all">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono">All Markets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 pb-2 text-sm font-medium text-muted-foreground border-b font-mono">
                    <span>Market</span>
                    <span>Price</span>
                    <span>24h Change</span>
                    <span>Volume</span>
                    <span>Action</span>
                  </div>
                  {markets.map((market, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 py-3 items-center hover:bg-accent/50 rounded-sm px-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                          <Star className="h-4 w-4" />
                        </Button>
                        <span 
                          className="font-medium cursor-pointer hover:text-primary transition-colors truncate"
                          onClick={() => handleAssetClick(market.asset)}
                        >
                          {market.symbol}
                        </span>
                      </div>
                      <span className="font-medium leading-relaxed text-right truncate">{market.price}</span>
                      <div className={`flex items-center gap-1 justify-end ${market.positive ? 'text-data-positive' : 'text-data-negative'}`}>
                        {market.positive ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                        <span className="font-medium truncate">{market.change}</span>
                      </div>
                      <span className="text-muted-foreground text-right truncate">{market.volume}</span>
                      <Button size="sm" className="flex-shrink-0">Trade</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gainers">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono">Top Gainers (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gainers.map((gainer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-sm">
                      <span className="font-medium font-mono">{gainer.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-data-positive font-medium font-mono">{gainer.change}</span>
                        <Button size="sm" className="font-mono">Trade</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="losers">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono">Top Losers (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {losers.map((loser, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-sm">
                      <span className="font-medium font-mono">{loser.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-data-negative font-medium font-mono">{loser.change}</span>
                        <Button size="sm" className="font-mono">Trade</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono">Your Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No markets in your watchlist yet.</p>
                  <p className="text-sm">Click the star icon next to any market to add it here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
