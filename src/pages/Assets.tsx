
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
      name: "Meta AI & Analytics Next Generation", 
      price: "$238.00", 
      change: "+2.5%", 
      changeType: "up",
      marketCap: "$5.2B",
      volume24h: "$124M"
    },
    { 
      symbol: "USDC", 
      name: "USD Coin", 
      price: "$1.00", 
      change: "+0.1%", 
      changeType: "up",
      marketCap: "$32.8B",
      volume24h: "$3.2B"
    },
    { 
      symbol: "BTC", 
      name: "Bitcoin", 
      price: "$45,000.00", 
      change: "+1.2%", 
      changeType: "up",
      marketCap: "$880B",
      volume24h: "$28B"
    },
    { 
      symbol: "ETH", 
      name: "Ethereum", 
      price: "$3,567.00", 
      change: "+1.8%", 
      changeType: "up",
      marketCap: "$429B",
      volume24h: "$12.8B"
    },
    { 
      symbol: "AVAX", 
      name: "Avalanche", 
      price: "$26.00", 
      change: "+3.2%", 
      changeType: "up",
      marketCap: "$10.1B",
      volume24h: "$284M"
    },
    { 
      symbol: "ARB", 
      name: "Arbitrum", 
      price: "$0.90", 
      change: "+8.7%", 
      changeType: "up",
      marketCap: "$3.4B",
      volume24h: "$458M"
    },
    { 
      symbol: "OP", 
      name: "Optimism", 
      price: "$1.85", 
      change: "+3.1%", 
      changeType: "up",
      marketCap: "$2.9B",
      volume24h: "$312M"
    },
    { 
      symbol: "MATIC", 
      name: "Polygon", 
      price: "$0.75", 
      change: "-0.8%", 
      changeType: "down",
      marketCap: "$7.1B",
      volume24h: "$298M"
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle 
                    className="text-lg cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => handleTradeAsset(asset.symbol)}
                  >
                    {asset.symbol}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xl lg:text-2xl font-bold leading-tight truncate">{asset.price}</span>
                <div className={`flex items-center gap-1 text-sm ${
                  asset.changeType === "up" ? "text-data-positive" : 
                  asset.changeType === "down" ? "text-data-negative" : "text-muted-foreground"
                }`}>
                  {asset.changeType === "up" && <TrendingUp className="h-4 w-4 flex-shrink-0" />}
                  {asset.changeType === "down" && <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                  <span className="truncate">{asset.change}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium text-right truncate">{asset.marketCap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-medium text-right truncate">{asset.volume24h}</span>
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
