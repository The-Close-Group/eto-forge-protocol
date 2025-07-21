
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, Layers } from "lucide-react";

export default function Assets() {
  const navigate = useNavigate();

  const assets = [
    { 
      symbol: "MAANG", 
      name: "MAANG Token", 
      price: "$47.32", 
      change: "+5.24%", 
      changeType: "up",
      marketCap: "$12.4M",
      volume24h: "$2.1M"
    },
    { 
      symbol: "USDC", 
      name: "USD Coin", 
      price: "$1.00", 
      change: "0.00%", 
      changeType: "neutral",
      marketCap: "$28.2B",
      volume24h: "$4.1B"
    },
    { 
      symbol: "BTC", 
      name: "Bitcoin", 
      price: "$43,521.45", 
      change: "-1.23%", 
      changeType: "down",
      marketCap: "$851.2B",
      volume24h: "$15.2B"
    },
    { 
      symbol: "ETH", 
      name: "Ethereum", 
      price: "$2,587.32", 
      change: "+3.45%", 
      changeType: "up",
      marketCap: "$310.8B",
      volume24h: "$8.7B"
    },
  ];

  const handleBuyAsset = (symbol: string) => {
    navigate(`/trade?from=USDC&to=${symbol}&amount=100`);
  };

  const handleTradeAsset = (symbol: string) => {
    navigate(`/asset/${symbol}`);
  };

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-mono text-foreground">Assets</h1>
        <p className="text-muted-foreground">
          Available assets for trading and staking
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search assets..." 
          className="pl-9 font-mono"
        />
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset, index) => (
          <Card key={index} className="hover:bg-accent/5 transition-colors border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-mono">{asset.symbol}</CardTitle>
                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono font-bold">{asset.price}</span>
                <div className={`flex items-center gap-1 text-sm font-mono ${
                  asset.changeType === "up" ? "text-data-positive" : 
                  asset.changeType === "down" ? "text-data-negative" : "text-muted-foreground"
                }`}>
                  {asset.changeType === "up" && <TrendingUp className="h-4 w-4" />}
                  {asset.changeType === "down" && <TrendingDown className="h-4 w-4" />}
                  {asset.change}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-mono">{asset.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-mono">{asset.volume24h}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 font-mono"
                  onClick={() => handleBuyAsset(asset.symbol)}
                >
                  Buy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 font-mono"
                  onClick={() => handleTradeAsset(asset.symbol)}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
