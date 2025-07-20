
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Zap, Shield, TrendingUp, RefreshCw, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { ChainSelectionMode } from "@/components/ChainSelectionMode";
import { AssetSelector } from "@/components/AssetSelector";
import { TradeSummary } from "@/components/TradeSummary";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { TransactionStatus } from "@/components/TransactionStatus";
import { useTrade } from "@/hooks/useTrade";
import { useAuth } from "@/contexts/AuthContext";

export default function Trade() {
  const [chainMode, setChainMode] = useState<"auto" | "manual">("auto");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState("USDC");
  const [toAsset, setToAsset] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");

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

  const handleQuickBuy = (asset: string, amount: string) => {
    setFromAsset("USDC");
    setToAsset(asset);
    setFromAmount(amount);
    setToAmount(calculateToAmount(amount));
  };

  const showPriceImpactWarning = fromAmount && parseFloat(fromAmount) > 10000;
  const canTrade = fromAmount && toAmount && isAuthenticated;

  // Trade summary data
  const tradeSummaryData = {
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    exchangeRate: `1 ${toAsset} = 2,000 ${fromAsset}`,
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
          Search and select assets, then execute cross-chain trades with optimal routing
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
                  { asset: "ETH", amount: "1000", label: "$1,000" },
                  { asset: "BTC", amount: "2500", label: "$2,500" },
                  { asset: "ETH", amount: "5000", label: "$5,000" },
                  { asset: "BTC", amount: "10000", label: "$10,000" }
                ].map((quick, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col gap-1 h-auto p-3"
                    onClick={() => handleQuickBuy(quick.asset, quick.amount)}
                  >
                    <span className="font-medium">{quick.asset}</span>
                    <span className="text-xs text-muted-foreground">{quick.label}</span>
                  </Button>
                ))}
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

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        onConfirm={executeTransaction}
        {...tradeSummaryData}
        showWarning={showPriceImpactWarning}
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
