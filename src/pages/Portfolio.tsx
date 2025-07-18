import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Eye, ExternalLink } from "lucide-react";

export default function Portfolio() {
  const assets = [
    { symbol: "ETH", name: "Ethereum", amount: "2.5", value: "$5,000", change: "+5.2%", positive: true, chain: "Ethereum" },
    { symbol: "BTC", name: "Bitcoin", amount: "0.15", value: "$4,200", change: "-1.8%", positive: false, chain: "Bitcoin" },
    { symbol: "USDC", name: "USD Coin", amount: "1,500", value: "$1,500", change: "0.0%", positive: true, chain: "Polygon" },
    { symbol: "ARB", name: "Arbitrum", amount: "800", value: "$720", change: "+12.3%", positive: true, chain: "Arbitrum" },
  ];

  const transactions = [
    { type: "Buy", asset: "ETH", amount: "0.5", price: "$2,000", time: "2 hours ago", hash: "0x1234...5678" },
    { type: "Sell", asset: "BTC", amount: "0.02", price: "$42,000", time: "5 hours ago", hash: "0x5678...9abc" },
    { type: "Stake", asset: "USDC", amount: "1,000", price: "$1.00", time: "1 day ago", hash: "0x9abc...def0" },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Total Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold">$11,420</div>
            <div className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-green-500 font-medium">+3.2% ($350)</span>
              <span className="text-muted-foreground">24h</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Active Positions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold">4</div>
            <div className="text-lg text-muted-foreground">Across 3 chains</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Best Performer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">ARB</div>
            <div className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-green-500 font-medium">+12.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Your Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="font-semibold text-primary text-xl">{asset.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-xl">{asset.name}</p>
                        <p className="text-lg text-muted-foreground">{asset.chain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xl">{asset.amount} {asset.symbol}</p>
                      <p className="text-lg text-muted-foreground">{asset.value}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 ${asset.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.positive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        <span className="font-medium text-lg">{asset.change}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="lg" className="h-12 w-12">
                      <Eye className="h-6 w-6" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'Buy' ? 'bg-green-100 text-green-700' :
                        tx.type === 'Sell' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tx.type}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.amount} {tx.asset}</p>
                        <p className="text-sm text-muted-foreground">@ {tx.price}</p>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Performance chart will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}