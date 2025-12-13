import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOrderManagement } from "@/hooks/useOrders";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { TransactionStatus } from "@/components/TransactionStatus";
import { useDMMSwap } from "@/hooks/useDMMSwap";
import { usePrices } from "@/hooks/usePrices";
import { useActiveAccount } from "thirdweb/react";
import { DMM_ADDRESS } from "@/config/contracts";
import maangLogo from "@/assets/maang-logo.svg";
import { ShareTradeCard } from "@/components/ShareTradeCard";
import { useMarketStats } from "@/lib/graphql";

// Remove fallback prices - fetch live values from chain
const FALLBACK_ASSET_PRICES = {
  mUSDC: 1.00, // Only keep mUSDC as it's pegged to $1
};

const ASSETS = [
  { symbol: "MAANG", name: "Dynamic Reflective Index", icon: maangLogo },
  { symbol: "sMAANG", name: "Staked MAANG", icon: maangLogo },
  { symbol: "USDC", name: "USD Coin", icon: "💵" },
];

export default function OrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useActiveAccount();
  const { getTokenPrice } = usePrices();
  const { 
    getBuyQuote, 
    getSellQuote, 
    buyTokens, 
    sellTokens, 
    approveMUSDC, 
    checkAllowance,
    isLoading: isDMMLoading 
  } = useDMMSwap();
  
  const { data: marketStats } = useMarketStats();
  const [selectedAsset, setSelectedAsset] = useState(searchParams.get("asset") || "MAANG");
  const [orderType, setOrderType] = useState("market");
  const [orderSide, setOrderSide] = useState(searchParams.get("side") || "buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState("GTC");
  const [stopPrice, setStopPrice] = useState("");
  const [trailPercent, setTrailPercent] = useState("");
  const [trailAmount, setTrailAmount] = useState("");
  const [displaySize, setDisplaySize] = useState("");
  
  const currentPrice = getTokenPrice(selectedAsset) || FALLBACK_ASSET_PRICES[selectedAsset as keyof typeof FALLBACK_ASSET_PRICES] || 0;
  const asset = ASSETS.find(a => a.symbol === selectedAsset);
  
  const { validateOrder, placeOrder } = useOrderManagement();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [currentStep, setCurrentStep] = useState<'approve' | 'swap' | 'confirm'>('approve');
  const [transactionHash, setTransactionHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [showShareCard, setShowShareCard] = useState(false);
  const [isFirstTrade, setIsFirstTrade] = useState(false);
  const [completedTradeInfo, setCompletedTradeInfo] = useState<{ fromAsset: string; toAsset: string; amount: string } | null>(null);

  // Check if this is user's first trade
  useEffect(() => {
    const hasTraded = localStorage.getItem('hasCompletedTrade');
    if (!hasTraded) {
      setIsFirstTrade(true);
    }
  }, []);

  const calculateTotal = () => {
    if (!amount) return 0;
    const price = orderType === "market" ? currentPrice : parseFloat(limitPrice) || currentPrice;
    return parseFloat(amount) * price;
  };

  const calculateEstimatedFees = () => {
    const total = calculateTotal();
    return total * 0.001; // 0.1% fee
  };

  const handlePlaceOrder = () => {
    // Validate order first
    const validation = validateOrder({
      type: orderType as any,
      side: orderSide as any,
      asset: selectedAsset,
      amount: parseFloat(amount),
      price: orderType === "limit" ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === "stop" ? parseFloat(limitPrice) : undefined,
      timeInForce: timeInForce as any,
      fromAsset: "mUSDC"
    });

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    // For MAANG trades, execute DMM swap directly
    if (selectedAsset === 'MAANG' && orderType === 'market') {
      handleConfirmOrder();
    } else {
      // For other assets, show confirmation dialog
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirmOrder = async () => {
    setIsConfirmationOpen(false);
    setIsTransactionOpen(true);
    setTransactionStatus('pending');
    setCurrentStep('approve');
    setError(undefined);

    try {
      // Special handling for MAANG trades via DMM
      if (selectedAsset === 'MAANG' && account) {
        if (orderSide === 'buy') {
          // Buy MAANG with mUSDC via DMM
          setCurrentStep('approve');
          const usdcAmount = calculateTotal().toString();
          
          // Check if approval is needed  
          const allowance = await checkAllowance();
          const amountWei = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6)); // mUSDC has 6 decimals
          
          if (BigInt(allowance) < amountWei) {
            await approveMUSDC(usdcAmount);
          }
          
          setCurrentStep('swap');
          const success = await buyTokens(usdcAmount);
          
          if (success) {
            setCurrentStep('confirm');
            setTransactionStatus('success');
            setTransactionHash(`0x${Math.random().toString(16).substr(2, 64)}`);
            
            // Store trade info for share card
            setCompletedTradeInfo({
              fromAsset: 'mUSDC',
              toAsset: 'MAANG',
              amount: amount
            });
            
            // Show share card if first trade, otherwise navigate
            if (isFirstTrade) {
              localStorage.setItem('hasCompletedTrade', 'true');
              setTimeout(() => {
                setIsTransactionOpen(false);
                setShowShareCard(true);
              }, 2000);
            } else {
              setTimeout(() => {
                navigate(`/transaction-complete?type=dmm-buy&fromAsset=mUSDC&toAsset=MAANG&fromAmount=${usdcAmount}&toAmount=${amount}`);
              }, 2000);
            }
          } else {
            throw new Error('DMM buy failed');
          }
        } else if (orderSide === 'sell') {
          // Sell MAANG for mUSDC via DMM
          setCurrentStep('swap');
          const success = await sellTokens(amount);
          
          if (success) {
            setCurrentStep('confirm');
            setTransactionStatus('success');
            setTransactionHash(`0x${Math.random().toString(16).substr(2, 64)}`);
            
            // Store trade info for share card
            setCompletedTradeInfo({
              fromAsset: 'MAANG',
              toAsset: 'mUSDC',
              amount: amount
            });
            
            // Show share card if first trade, otherwise navigate
            if (isFirstTrade) {
              localStorage.setItem('hasCompletedTrade', 'true');
              setTimeout(() => {
                setIsTransactionOpen(false);
                setShowShareCard(true);
              }, 2000);
            } else {
              setTimeout(() => {
                navigate(`/transaction-complete?type=dmm-sell&fromAsset=MAANG&toAsset=mUSDC&fromAmount=${amount}&toAmount=${calculateTotal()}`);
              }, 2000);
            }
          } else {
            throw new Error('DMM sell failed');
          }
        }
      } else {
        // Regular order flow for non-MAANG assets
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentStep('swap');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCurrentStep('confirm');

        const result = await placeOrder({
          type: orderType as any,
          side: orderSide as any,
          asset: selectedAsset,
          amount: parseFloat(amount),
          price: orderType === "limit" ? parseFloat(limitPrice) : undefined,
          stopPrice: orderType === "stop" ? parseFloat(limitPrice) : undefined,
          timeInForce: timeInForce as any,
          fromAsset: "USDC"
        });

        if (result.success) {
          const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          setTransactionHash(mockTxHash);
          setTransactionStatus('success');
          
          setTimeout(() => {
            navigate(`/transaction-complete?txHash=${mockTxHash}&type=order&fromAsset=USDC&toAsset=${selectedAsset}&fromAmount=${calculateTotal()}&toAmount=${amount}`);
          }, 2000);
        } else {
          setError(result.error);
          setTransactionStatus('error');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setTransactionStatus('error');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 pb-20 md:pb-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 sm:h-9 sm:w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono">Create Order</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Structure your trade with advanced options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{asset?.icon}</span>
                {asset?.name} ({selectedAsset})
                <Badge variant="outline">${currentPrice.toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Asset Selection */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center gap-2">
                          {asset.symbol === "MAANG" ? (
                            <img src={asset.icon} alt={asset.symbol} className="w-4 h-4 object-contain" />
                          ) : (
                            <span>{asset.icon}</span>
                          )}
                          <span>{asset.name} ({asset.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Side */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Order Side</Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant={orderSide === "buy" ? "default" : "outline"}
                    onClick={() => setOrderSide("buy")}
                    className={`h-11 sm:h-10 ${orderSide === "buy" ? "bg-data-positive hover:bg-data-positive/90" : ""}`}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === "sell" ? "default" : "outline"}
                    onClick={() => setOrderSide("sell")}
                    className={`h-11 sm:h-10 ${orderSide === "sell" ? "bg-data-negative hover:bg-data-negative/90" : ""}`}
                  >
                    Sell
                  </Button>
                </div>
              </div>

              {/* Order Type */}
              <Tabs value={orderType} onValueChange={setOrderType}>
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
                  <TabsTrigger value="market" className="text-xs sm:text-sm">Market</TabsTrigger>
                  <TabsTrigger value="limit" className="text-xs sm:text-sm">Limit</TabsTrigger>
                  <TabsTrigger value="stop" className="text-xs sm:text-sm">Stop</TabsTrigger>
                  <TabsTrigger value="oco" className="text-xs sm:text-sm">OCO</TabsTrigger>
                  <TabsTrigger value="trailing_stop" className="text-xs sm:text-sm">Trail</TabsTrigger>
                  <TabsTrigger value="iceberg" className="text-xs sm:text-sm">Iceberg</TabsTrigger>
                </TabsList>

                <TabsContent value="market" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-11 sm:h-10"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Market price: ${currentPrice.toLocaleString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="limit" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limit Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: ${currentPrice.toLocaleString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="stop" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="oco" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder={(currentPrice * 1.05).toString()}
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder={(currentPrice * 0.95).toString()}
                      value={stopPrice || ""}
                      onChange={(e) => setStopPrice(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="trailing_stop" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trail Distance</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Percentage (%)</Label>
                        <Input
                          type="number"
                          placeholder="5.0"
                          value={trailPercent || ""}
                          onChange={(e) => setTrailPercent(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fixed Amount ($)</Label>
                        <Input
                          type="number"
                          placeholder="10.00"
                          value={trailAmount || ""}
                          onChange={(e) => setTrailAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="iceberg" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Total Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Size ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder={amount ? (parseFloat(amount) * 0.1).toString() : "0.00"}
                      value={displaySize || ""}
                      onChange={(e) => setDisplaySize(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Amount visible in order book
                    </p>
                  </div>
                  {orderSide !== "market" && (
                    <div className="space-y-2">
                      <Label>Limit Price (USD)</Label>
                      <Input
                        type="number"
                        placeholder={currentPrice.toString()}
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Time in Force */}
              {orderType !== "market" && (
                <div className="space-y-2">
                  <Label>Time in Force</Label>
                  <Select value={timeInForce} onValueChange={setTimeInForce}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTC">Good Till Canceled</SelectItem>
                      <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                      <SelectItem value="FOK">Fill or Kill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                className="w-full h-12 sm:h-11 text-base"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={!amount || (orderType === "limit" && !limitPrice) || (orderType === "oco" && (!limitPrice || !stopPrice)) || (orderType === "trailing_stop" && !trailPercent && !trailAmount) || (orderType === "iceberg" && !displaySize)}
              >
                Place {orderType === "oco" ? "OCO" : orderType === "trailing_stop" ? "Trailing Stop" : orderType === "iceberg" ? "Iceberg" : orderSide.charAt(0).toUpperCase() + orderSide.slice(1)} Order
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Type</span>
                <span className="font-mono capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Side</span>
                <span className={`font-mono capitalize ${orderSide === "buy" ? "text-data-positive" : "text-data-negative"}`}>
                  {orderSide}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono">{amount || "0"} {selectedAsset}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-mono">
                  ${orderType === "market" ? currentPrice.toLocaleString() : (limitPrice || currentPrice).toLocaleString()}
                </span>
              </div>
              {selectedAsset === 'MAANG' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Execution</span>
                  <span className="font-mono text-blue-600">
                    🤖 DMM (Dynamic Market Maker)
                  </span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="font-mono">${calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Fees</span>
                  <span className="font-mono">${calculateEstimatedFees().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-data-positive" />
                <span>24h Volume: {marketStats?.volume24hFormatted || '$2.4M'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Est. Settlement: ~30s</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Spread: 0.02%</span>
              </div>
            </CardContent>
          </Card>

          {orderType !== "market" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Limit Order Notice</p>
                    <p className="text-muted-foreground text-xs">
                      Your order will only execute when the market price reaches your limit price.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmOrder}
        fromAsset="USDC"
        toAsset={selectedAsset}
        fromAmount={calculateTotal().toString()}
        toAmount={amount}
        exchangeRate={currentPrice.toString()}
        networkFee="2.50"
        platformFee={calculateEstimatedFees().toFixed(2)}
        priceImpact={0.12}
        estimatedTime="~30 seconds"
        totalCost={calculateTotal().toString()}
        isConfirming={transactionStatus === 'pending'}
      />

      {/* Transaction Status */}
      <TransactionStatus
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        status={transactionStatus}
        currentStep={currentStep}
        transactionHash={transactionHash}
        fromAsset="USDC"
        toAsset={selectedAsset}
        fromAmount={calculateTotal().toString()}
        toAmount={amount}
        error={error}
      />

      {/* Share Card for First Trade */}
      {completedTradeInfo && (
        <ShareTradeCard
          isOpen={showShareCard}
          onClose={() => {
            setShowShareCard(false);
            navigate('/dashboard');
          }}
          fromAsset={completedTradeInfo.fromAsset}
          toAsset={completedTradeInfo.toAsset}
          amount={completedTradeInfo.amount}
        />
      )}
    </div>
  );
}