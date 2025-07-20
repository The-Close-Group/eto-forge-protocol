
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Zap, Shield, TrendingUp, RefreshCw, CreditCard, Wallet as WalletIcon, Search } from "lucide-react";
import { ChainSelectionMode } from "@/components/ChainSelectionMode";
import { AssetSelector } from "@/components/AssetSelector";
import { TradeSummary } from "@/components/TradeSummary";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { TransactionStatus } from "@/components/TransactionStatus";
import { useTrade } from "@/hooks/useTrade";
import { useAuth } from "@/contexts/AuthContext";

// Asset pricing data
const ASSET_PRICES = {
  MAANG: 238.00,
  USDC: 1.00,
  ETH: 3567.00,
  AVAX: 26.00,
  BTC: 45000.00
};

export default function Trade() {
  const [chainMode, setChainMode] = useState<"auto" | "manual">("auto");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState("USDC");
  const [toAsset, setToAsset] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated } = useAuth();
  const {
    isConfirmationOpen,
    isTransactionOpen,
    transactionStatus,
    currentStep,
    transactionHash,
    error,
    openConfirmation,
    closeConfirmation,
    executeTransaction,
    closeTransaction
  } = useTrade();

  const recommendedChain = "Arbitrum";

  // Calculate exchange rates based on real asset prices
  const calculateExchangeRate = (from: string, to: string) => {
    const fromPrice = ASSET_PRICES[from as keyof typeof ASSET_PRICES] || 1;
    const toPrice = ASSET_PRICES[to as keyof typeof ASSET_PRICES] || 1;
    return fromPrice / toPrice;
  };

  // Calculate toAmount based on fromAmount with real pricing
  const calculateToAmount = (amount: string) => {
    if (!amount) return "";
    const rate = calculateExchangeRate(fromAsset, toAsset);
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

  const handleQuickBuy = (asset: string, usdAmount: string) => {
    setFromAsset("USDC");
    setToAsset(asset);
    setFromAmount(usdAmount);
    setToAmount(calculateToAmount(usdAmount));
  };

  const handleAssetSearch = (asset: string) => {
    setToAsset(asset);
    setFromAsset("USDC");
    if (fromAmount) {
      setToAmount(calculateToAmount(fromAmount));
    }
    setSearchQuery("");
  };

  const showPriceImpactWarning = fromAmount && parseFloat(fromAmount) > 10000;
  const canTrade = fromAmount && toAmount && isAuthenticated;

  // Popular assets for search suggestions
  const popularAssets = ["BTC", "ETH", "AVAX", "MAANG", "USDC"];
  const filteredAssets = popularAssets.filter(asset => 
    asset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trade summary data with real pricing
  const exchangeRate = `1 ${toAsset} = ${calculateExchangeRate(toAsset, fromAsset).toFixed(2)} ${fromAsset}`;
  const tradeSummaryData = {
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    exchangeRate,
    networkFee: "~$2.50",
    platformFee: "0.3%",
    priceImpact: 0.12,
    estimatedTime: "~15s",
    totalCost: `≈ $${(parseFloat(fromAmount || "0") * 1.003 + 2.5).toFixed(2)}`
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trade</h1>
        <p className="text-muted-foreground">
          Discover and trade assets with optimal cross-chain routing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trading Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Buy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Quick Buy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { asset: "MAANG", price: ASSET_PRICES.MAANG, amounts: ["100", "500"] },
                  { asset: "USDC", price: ASSET_PRICES.USDC, amounts: ["1000", "5000"] },
                  { asset: "ETH", price: ASSET_PRICES.ETH, amounts: ["1000", "2500"] },
                  { asset: "AVAX", price: ASSET_PRICES.AVAX, amounts: ["500", "1000"] }
                ].map((quick, index) => (
                  <div key={quick.asset} className="space-y-2">
                    <div className="text-center p-3 bg-accent/30 rounded-sm border">
                      <div className="font-medium text-lg">{quick.asset}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        ${quick.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {quick.amounts.map((amount, amountIndex) => (
                        <Button
                          key={amountIndex}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => handleQuickBuy(quick.asset, amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Asset Discovery Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Discover New Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for assets to trade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && filteredAssets.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-sm mt-1 z-10 shadow-lg">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset}
                        className="w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between border-b last:border-b-0"
                        onClick={() => handleAssetSearch(asset)}
                      >
                        <div>
                          <div className="font-medium">{asset}</div>
                          <div className="text-sm text-muted-foreground">
                            ${ASSET_PRICES[asset as keyof typeof ASSET_PRICES]?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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

              {/* Advanced Settings */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slippage Tolerance</span>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1.0"].map((value) => (
                      <Button
                        key={value}
                        variant={slippageTolerance === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippageTolerance(value)}
                        className="text-xs"
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Smart Chain Selection */}
                <ChainSelectionMode 
                  mode={chainMode}
                  onModeChange={setChainMode}
                  recommendedChain={`${recommendedChain} (Best for ${fromAsset}→${toAsset})`}
                />

                {/* Manual Chain Selection */}
                {chainMode === "manual" && (
                  <div className="p-4 bg-muted/50 rounded-sm">
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
                  {...tradeSummaryData}
                  showWarning={showPriceImpactWarning}
                />
              </CardContent>
            </Card>
          )}

          {/* Execute Trade */}
          <Card>
            <CardContent className="pt-6">
              {!isAuthenticated ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted/30 rounded-sm flex items-center justify-center mx-auto">
                    <WalletIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Connect your wallet to start trading</p>
                    <Button size="lg" className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!canTrade}
                  onClick={openConfirmation}
                >
                  {canTrade ? 
                    `Swap ${fromAmount} ${fromAsset} for ${toAmount} ${toAsset}` : 
                    'Enter amounts to trade'
                  }
                </Button>
              )}
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
                  <span className="text-sm font-medium font-mono">{exchangeRate}</span>
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

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        onConfirm={executeTransaction}
        {...tradeSummaryData}
      />

      {/* Transaction Status Modal */}
      <TransactionStatus
        isOpen={isTransactionOpen}
        onClose={closeTransaction}
        status={transactionStatus}
        currentStep={currentStep}
        transactionHash={transactionHash}
        fromAsset={fromAsset}
        toAsset={toAsset}
        fromAmount={fromAmount}
        toAmount={toAmount}
        error={error}
      />
    </div>
  );
}
