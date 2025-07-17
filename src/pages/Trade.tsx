import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Zap, Shield } from "lucide-react";

export default function Trade() {
  const [tradeType, setTradeType] = useState("buy");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState("USDC");
  const [toAsset, setToAsset] = useState("ETH");
  const [amount, setAmount] = useState("");

  return (
    <div className="p-6 pb-20 md:pb-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Trade</h1>
        <p className="text-muted-foreground">
          Execute cross-chain trades with optimal routing through our Dynamic Market Maker
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={tradeType} onValueChange={setTradeType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Chain Selection */}
              <div className="space-y-2">
                <Label>Select Chain</Label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    <SelectItem value="polygon">Polygon (MATIC)</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum (ARB)</SelectItem>
                    <SelectItem value="optimism">Optimism (OP)</SelectItem>
                    <SelectItem value="bsc">BSC (BNB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* From Asset */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <Select value={fromAsset} onValueChange={setFromAsset}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">Balance: 1,234.56 USDC</p>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center">
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Asset */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount ? (parseFloat(amount) * 0.0005).toFixed(6) : ""}
                      readOnly
                    />
                  </div>
                  <Select value={toAsset} onValueChange={setToAsset}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">≈ $1,234.56</p>
              </div>

              {/* Trade Summary */}
              <div className="space-y-2 p-4 bg-accent/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Exchange Rate</span>
                  <span>1 ETH = 2,000 USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Fee</span>
                  <span>~$5.20</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ETO Fee</span>
                  <span>0.3%</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>≈ $1,239.76</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Connect Wallet to Trade
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trading Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cross-Chain Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Dynamic Market Maker</p>
                  <p className="text-sm text-muted-foreground">
                    Optimal pricing through our advanced routing system
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Layer Zero Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Seamless cross-chain transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ETH Price</span>
                <span className="text-sm font-medium">$2,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">24h Change</span>
                <span className="text-sm font-medium text-green-500">+2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <span className="text-sm font-medium">$1.2M</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}