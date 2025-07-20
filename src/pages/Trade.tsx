import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, WalletIcon, Search, TrendingUp, Zap, Shield } from "lucide-react";
import { ChainSelectionMode } from "@/components/ChainSelectionMode";
import { TradeAssetSelector } from "@/components/TradeAssetSelector";
import { TradeSummary } from "@/components/TradeSummary";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { TransactionStatus } from "@/components/TransactionStatus";
import { QuickBuyBanner } from "@/components/QuickBuyBanner";
import { useTrade } from "@/hooks/useTrade";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";

// Asset pricing data
const ASSET_PRICES = {
  MAANG: 238.00,
  USDC: 1.00,
  ETH: 3567.00,
  AVAX: 26.00,
  BTC: 45000.00
};

const ASSET_SUGGESTIONS = [
  { symbol: "MAANG", name: "Meta AI & Analytics", price: 238.00, icon: "🤖", trending: true },
  { symbol: "ETH", name: "Ethereum", price: 3567.00, icon: "⟐", popular: true },
  { symbol: "USDC", name: "USD Coin", price: 1.00, icon: "💵", popular: true },
  { symbol: "AVAX", name: "Avalanche", price: 26.00, icon: "🔺", trending: true },
  { symbol: "BTC", name: "Bitcoin", price: 45000.00, icon: "₿", popular: true },
];

export default function Trade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAsset = searchParams.get('asset');

  const [chainMode, setChainMode] = useState<"auto" | "manual">("auto");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState("USDC");
  const [toAsset, setToAsset] = useState(preselectedAsset || "ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addTrade } = usePortfolio();
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
    return (parseFloat(amount) * rate).toFixed(2);
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

  const handleAssetClick = (symbol: string) => {
    navigate(`/asset/${symbol}`);
  };

  const filteredSuggestions = ASSET_SUGGESTIONS.filter(asset => 
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showPriceImpactWarning = fromAmount && parseFloat(fromAmount) > 10000;
  const canTrade = fromAmount && toAmount && isAuthenticated;

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

  const handleTradeExecution = async () => {
    try {
      await executeTransaction();
      // Add to portfolio after successful trade
      if (fromAmount && toAmount) {
        addTrade(fromAsset, toAsset, parseFloat(fromAmount), parseFloat(toAmount), calculateExchangeRate(fromAsset, toAsset));
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
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
          {/* Quick Buy Banner */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Buy
            </h2>
            <QuickBuyBanner onQuickBuy={handleQuickBuy} />
          </div>

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
                  placeholder="Search for assets to discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                {(showSuggestions || searchQuery) && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-sm mt-1 z-10 shadow-lg max-h-64 overflow-y-auto">
                    {searchQuery === "" && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                          Popular Assets
                        </div>
                        {ASSET_SUGGESTIONS.filter(a => a.popular).map((asset) => (
                          <button
                            key={asset.symbol}
                            className="w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between border-b last:border-b-0"
                            onClick={() => handleAssetClick(asset.symbol)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{asset.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{asset.symbol}</div>
                                <div className="text-xs text-muted-foreground">{asset.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono">${asset.price.toLocaleString()}</div>
                            </div>
                          </button>
                        ))}
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                          Trending
                        </div>
                        {ASSET_SUGGESTIONS.filter(a => a.trending && !a.popular).map((asset) => (
                          <button
                            key={asset.symbol}
                            className="w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between border-b last:border-b-0"
                            onClick={() => handleAssetClick(asset.symbol)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{asset.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{asset.symbol}</div>
                                <div className="text-xs text-muted-foreground">{asset.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono">${asset.price.toLocaleString()}</div>
                              <TrendingUp className="h-3 w-3 text-data-positive ml-auto" />
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {searchQuery && filteredSuggestions.map((asset) => (
                      <button
                        key={asset.symbol}
                        className="w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between border-b last:border-b-0"
                        onClick={() => handleAssetClick(asset.symbol)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{asset.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{asset.symbol}</div>
                            <div className="text-xs text-muted-foreground">{asset.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">${asset.price.toLocaleString()}</div>
                        </div>
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
              <TradeAssetSelector
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
              <TradeAssetSelector
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
                  <div className="p-4 bg-muted/50 rounded-sm mt-4">
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
                    `Swap $${fromAmount} for ${toAmount} ${toAsset}` : 
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
        onConfirm={handleTradeExecution}
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
