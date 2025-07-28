import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, WalletIcon, TrendingUp, Zap, Shield, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ChainSelectionMode } from "@/components/ChainSelectionMode";
import { TradeAssetSelector } from "@/components/TradeAssetSelector";
import { TradeSummary } from "@/components/TradeSummary";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { TransactionStatus } from "@/components/TransactionStatus";
import { useTrade } from "@/hooks/useTrade";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";

const ASSET_PRICES = {
  MAANG: 238.00,
  USDC: 1.00,
  ETH: 3567.00,
  AVAX: 26.00,
  BTC: 45000.00
};

const STAKING_POOLS = [
  { 
    pair: "MAANG/USDC", 
    apr: 24.8, 
    tvl: "$2.4M", 
    rewards: "MAANG + ETO",
    riskLevel: "Medium",
    timelock: "30 days"
  },
  { 
    pair: "ETO/USDC", 
    apr: 18.5, 
    tvl: "$1.8M", 
    rewards: "ETO",
    riskLevel: "Low",
    timelock: "7 days"
  },
  { 
    pair: "ETH/USDC", 
    apr: 12.3, 
    tvl: "$5.2M", 
    rewards: "ETH",
    riskLevel: "Low",
    timelock: "14 days"
  }
];

export default function Trade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const preselectedFrom = searchParams.get('from');
  const preselectedTo = searchParams.get('to');
  const preselectedAmount = searchParams.get('amount');

  const [chainMode, setChainMode] = useState<"auto" | "manual">("auto");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [fromAsset, setFromAsset] = useState(preselectedFrom || "USDC");
  const [toAsset, setToAsset] = useState(preselectedTo || "MAANG");
  const [fromAmount, setFromAmount] = useState(preselectedAmount || "");
  const [toAmount, setToAmount] = useState("");

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

  // Initialize amounts when URL parameters change
  useEffect(() => {
    if (preselectedAmount && fromAsset && toAsset) {
      const fromPrice = ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES] || 1;
      const toPrice = ASSET_PRICES[toAsset as keyof typeof ASSET_PRICES] || 1;
      const calculatedToAmount = ((parseFloat(preselectedAmount) / fromPrice) * toPrice).toFixed(2);
      setToAmount(calculatedToAmount);
    }
  }, [preselectedAmount, fromAsset, toAsset]);

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    if (amount && fromAsset && toAsset) {
      const fromPrice = ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES] || 1;
      const toPrice = ASSET_PRICES[toAsset as keyof typeof ASSET_PRICES] || 1;
      const calculatedToAmount = ((parseFloat(amount) / fromPrice) * toPrice).toFixed(2);
      setToAmount(calculatedToAmount);
    }
  };

  const handleToAmountChange = (amount: string) => {
    setToAmount(amount);
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
    handleFromAmountChange(amount);
  };

  const canTrade = fromAmount && toAmount && isAuthenticated;

  const calculateExchangeRate = (from: string, to: string) => {
    const fromPrice = ASSET_PRICES[from as keyof typeof ASSET_PRICES] || 1;
    const toPrice = ASSET_PRICES[to as keyof typeof ASSET_PRICES] || 1;
    return fromPrice / toPrice;
  };

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
      if (fromAmount && toAmount) {
        addTrade(fromAsset, toAsset, parseFloat(fromAmount), parseFloat(toAmount), calculateExchangeRate(fromAsset, toAsset));
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  const getPriceChange = () => Math.random() > 0.5 ? 1 : -1;
  const getRandomChange = () => (Math.random() * 10 + 1).toFixed(2);

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Featured Assets */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-mono">
            Trade Cross-Chain Assets
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover, trade, and earn with Layer Zero technology
          </p>
        </div>

        {/* Featured Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MAANG Card */}
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">MAANG</h3>
                    <p className="text-sm text-muted-foreground">Meta AI & Analytics</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-data-positive/20 text-data-positive border-data-positive/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold font-mono">${ASSET_PRICES.MAANG.toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-data-positive">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm font-mono">+{getRandomChange()}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleQuickBuy("MAANG", "100")}
                    className="bg-data-positive hover:bg-data-positive/90 text-white font-mono"
                  >
                    Buy $100
                  </Button>
                  <Button 
                    onClick={() => handleQuickBuy("MAANG", "500")}
                    variant="outline"
                    className="font-mono group-hover:border-primary/50"
                  >
                    Buy $500
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USDC Card */}
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                    💵
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">USDC</h3>
                    <p className="text-sm text-muted-foreground">USD Coin</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Stable
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold font-mono">${ASSET_PRICES.USDC.toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-sm font-mono">±0.00%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      setFromAsset("USDC");
                      setToAsset("MAANG");
                    }}
                    className="bg-primary hover:bg-primary/90 font-mono"
                  >
                    Trade USDC
                  </Button>
                  <Button 
                    onClick={() => navigate("/staking")}
                    variant="outline"
                    className="font-mono group-hover:border-primary/50"
                  >
                    Earn 18.5%
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* High APR Staking Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              High-Yield Staking
            </h2>
            <p className="text-muted-foreground">Earn passive income with our top performing pools</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/staking")} className="font-mono">
            View All Pools
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAKING_POOLS.map((pool, index) => (
            <Card key={index} className="bg-card border-border/60 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-mono">{pool.pair}</h3>
                    <Badge variant={pool.riskLevel === "Low" ? "secondary" : "outline"} className="text-xs">
                      {pool.riskLevel}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-data-positive font-mono">
                      {pool.apr}%
                    </div>
                    <div className="text-sm text-muted-foreground">APR</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">TVL</div>
                      <div className="font-mono">{pool.tvl}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lock</div>
                      <div className="font-mono">{pool.timelock}</div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full font-mono" onClick={() => navigate("/staking")}>
                    Stake Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trading Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Zap className="h-5 w-5" />
                Swap Assets
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
                otherAsset={toAsset}
                onOtherAmountChange={setToAmount}
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
                onAmountChange={handleToAmountChange}
                readOnly={false}
                otherAsset={fromAsset}
                onOtherAmountChange={setFromAmount}
              />

              {/* Smart Chain Selection */}
              <div className="pt-4 border-t border-border">
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
                          className="flex flex-col gap-1 h-auto p-3 text-xs font-mono"
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
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-mono">Trade Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <TradeSummary
                  {...tradeSummaryData}
                  showWarning={fromAmount && parseFloat(fromAmount) > 10000}
                />
              </CardContent>
            </Card>
          )}

          {/* Execute Trade */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              {!isAuthenticated ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted/30 rounded-sm flex items-center justify-center mx-auto">
                    <WalletIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Connect your wallet to start trading</p>
                    <Button size="lg" className="w-full font-mono">
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full font-mono" 
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
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-mono">Cross-Chain Benefits</CardTitle>
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
                  <p className="font-medium">Best Execution</p>
                  <p className="text-sm text-muted-foreground">
                    MEV protection and fair pricing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Overview for selected assets */}
          {(fromAsset || toAsset) && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-mono">Market Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">{fromAsset} Price</div>
                    <div className="font-mono font-medium">
                      ${ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES]?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{toAsset} Price</div>
                    <div className="font-mono font-medium">
                      ${ASSET_PRICES[toAsset as keyof typeof ASSET_PRICES]?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="text-muted-foreground text-xs">24h Volume</div>
                  <div className="font-mono font-medium">$24.8M</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        onConfirm={handleTradeExecution}
        fromAsset={fromAsset}
        toAsset={toAsset}
        fromAmount={fromAmount}
        toAmount={toAmount}
        exchangeRate={exchangeRate}
        networkFee="~$2.50"
        platformFee="0.3%"
        priceImpact={0.12}
        estimatedTime="~15s"
        totalCost={`≈ $${(parseFloat(fromAmount || "0") * 1.003 + 2.5).toFixed(2)}`}
      />

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