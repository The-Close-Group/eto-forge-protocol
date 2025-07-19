
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Zap, Shield, TrendingUp, RefreshCw } from "lucide-react";
import { ChainSelectionMode } from "@/components/ChainSelectionMode";
import { AssetSelector } from "@/components/AssetSelector";
import { TradeSummary } from "@/components/TradeSummary";

export default function Trade() {
  const [chainMode, setChainMode] = useState<"auto" | "manual">("auto");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState("USDC");
  const [toAsset, setToAsset] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const recommendedChain = "Arbitrum";

  // Calculate toAmount based on fromAmount (simplified)
  const calculateToAmount = (amount: string) => {
    if (!amount) return "";
    const rate = fromAsset === "USDC" && toAsset === "ETH" ? 0.0005 : 2000;
    return (parseFloat(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    setToAmount(calculateToAmount(amount));
  };

  const handleSwapAssets = () => {
    const tempAsset = fromAsset;
    const tempAmount = fromAmount;
    
    setFromAsset(toAsset);
    setToAsset(tempAsset);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const showPriceImpactWarning = fromAmount && parseFloat(fromAmount) > 10000;

  return (
    <div className="p-6 pb-20 md:pb-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Trade</h1>
        <p className="text-muted-foreground">
          Search and select assets, then execute cross-chain trades with optimal routing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trading Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Selection & Swap Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Asset Selection & Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Asset */}
              <AssetSelector
                label="From"
                selectedAsset={fromAsset}
                onAssetChange={setFromAsset}
                amount={fromAmount}
                onAmountChange={handleFromAmountChange}
                balance="1,234.56"
                showBalance={true}
              />

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSwapAssets}
                  className="hover:bg-accent transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* To Asset */}
              <AssetSelector
                label="To"
                selectedAsset={toAsset}
                onAssetChange={setToAsset}
                amount={toAmount}
                readOnly={true}
              />

              {/* Smart Chain Selection */}
              <div className="pt-4 border-t">
                <ChainSelectionMode 
                  mode={chainMode}
                  onModeChange={setChainMode}
                  recommendedChain={`${recommendedChain} (Best for ${fromAsset}→${toAsset})`}
                />

                {/* Manual Chain Selection */}
                {chainMode === "manual" && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { id: "ethereum", name: "Ethereum", icon: "🔵", fee: "$25.80", slow: true },
                        { id: "arbitrum", name: "Arbitrum", icon: "🔴", fee: "$2.50", recommended: true },
                        { id: "polygon", name: "Polygon", icon: "🟣", fee: "$0.05", fast: true },
                        { id: "optimism", name: "Optimism", icon: "🔴", fee: "$3.20" },
                        { id: "bsc", name: "BSC", icon: "🟡", fee: "$0.20" },
                      ].map((chain) => (
                        <Button
                          key={chain.id}
                          variant={selectedChain === chain.id ? "default" : "outline"}
                          className="flex flex-col gap-1 h-auto p-3 text-xs"
                          onClick={() => setSelectedChain(chain.id)}
                        >
                          <span className="text-lg">{chain.icon}</span>
                          <span className="font-medium">{chain.name}</span>
                          <span className="font-mono">{chain.fee}</span>
                          {chain.recommended && (
                            <span className="bg-data-positive/20 text-data-positive px-1 rounded text-xs">
                              OPTIMAL
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trade Summary */}
          {fromAmount && toAmount && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trade Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <TradeSummary
                  fromAsset={fromAsset}
                  toAsset={toAsset}
                  fromAmount={fromAmount}
                  toAmount={toAmount}
                  exchangeRate={`1 ${toAsset} = 2,000 ${fromAsset}`}
                  networkFee="~$2.50"
                  platformFee="0.3%"
                  priceImpact={0.12}
                  estimatedTime="~15s"
                  totalCost={`≈ $${(parseFloat(fromAmount) * 1.003 + 2.5).toFixed(2)}`}
                  showWarning={showPriceImpactWarning}
                />
              </CardContent>
            </Card>
          )}

          {/* Execute Trade */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                size="lg"
                disabled={!fromAmount || !toAmount}
              >
                {fromAmount && toAmount ? `Swap ${fromAmount} ${fromAsset} for ${toAmount} ${toAsset}` : 'Enter amounts to trade'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-4">
          {/* Trading Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cross-Chain Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-data-positive mt-0.5" />
                <div>
                  <p className="font-medium">Dynamic Market Maker</p>
                  <p className="text-sm text-muted-foreground">
                    Optimal pricing through advanced routing
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
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-data-positive mt-0.5" />
                <div>
                  <p className="font-medium">Auto-Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Best rates across all supported chains
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Info for Selected Assets */}
          {fromAsset && toAsset && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{fromAsset}/{toAsset} Market</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Rate</span>
                  <span className="text-sm font-medium font-mono">2,000 {fromAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span className="text-sm font-medium font-mono text-data-positive">+2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-sm font-medium font-mono">$1.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Liquidity</span>
                  <span className="text-sm font-medium font-mono text-data-positive">High</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chain Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chain Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Arbitrum</span>
                  <span className="text-data-positive font-medium">$2.50</span>
                </div>
                <div className="w-full bg-muted h-1 rounded">
                  <div className="bg-data-positive h-1 rounded w-[20%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Polygon</span>
                  <span className="text-data-positive font-medium">$0.05</span>
                </div>
                <div className="w-full bg-muted h-1 rounded">
                  <div className="bg-data-positive h-1 rounded w-[2%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ethereum</span>
                  <span className="text-muted-foreground font-medium">$25.80</span>
                </div>
                <div className="w-full bg-muted h-1 rounded">
                  <div className="bg-muted-foreground h-1 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
