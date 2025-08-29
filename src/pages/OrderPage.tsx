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

const ASSET_PRICES = {
  MAANG: 238.00,
  ETH: 3567.00,
  USDC: 1.00,
  AVAX: 26.00,
  BTC: 45000.00,
  ARB: 0.90,
  OP: 1.85,
  MATIC: 0.75
};

const ASSETS = [
  { symbol: "MAANG", name: "Meta AI & Analytics", icon: "🤖" },
  { symbol: "ETH", name: "Ethereum", icon: "⟐" },
  { symbol: "USDC", name: "USD Coin", icon: "💵" },
  { symbol: "AVAX", name: "Avalanche", icon: "🔺" },
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ARB", name: "Arbitrum", icon: "🔷" },
  { symbol: "OP", name: "Optimism", icon: "🔴" },
  { symbol: "MATIC", name: "Polygon", icon: "🟣" }
];

export default function OrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedAsset, setSelectedAsset] = useState(searchParams.get("asset") || "MAANG");
  const [orderType, setOrderType] = useState("market");
  const [orderSide, setOrderSide] = useState(searchParams.get("side") || "buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState("GTC");
  
  const currentPrice = ASSET_PRICES[selectedAsset as keyof typeof ASSET_PRICES];
  const asset = ASSETS.find(a => a.symbol === selectedAsset);
  
  const { validateOrder, placeOrder } = useOrderManagement();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [currentStep, setCurrentStep] = useState<'approve' | 'swap' | 'confirm'>('approve');
  const [transactionHash, setTransactionHash] = useState<string>();
  const [error, setError] = useState<string>();

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
      fromAsset: "USDC"
    });

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsConfirmationOpen(true);
  };

  const handleConfirmOrder = async () => {
    setIsConfirmationOpen(false);
    setIsTransactionOpen(true);
    setTransactionStatus('pending');
    setCurrentStep('approve');
    setError(undefined);

    try {
      // Simulate transaction steps
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
        
        // Navigate to completion page
        setTimeout(() => {
          navigate(`/transaction-complete?txHash=${mockTxHash}&type=order&fromAsset=USDC&toAsset=${selectedAsset}&fromAmount=${calculateTotal()}&toAmount=${amount}`);
        }, 2000);
      } else {
        setError(result.error);
        setTransactionStatus('error');
      }
    } catch (err: any) {
      setError(err.message);
      setTransactionStatus('error');
    }
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-mono">Create Order</h1>
          <p className="text-muted-foreground">Structure your trade with advanced options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <CardContent className="space-y-6">
              {/* Asset Selection */}
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{asset.icon}</span>
                          <span>{asset.name} ({asset.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Side */}
              <div className="space-y-2">
                <Label>Order Side</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderSide === "buy" ? "default" : "outline"}
                    onClick={() => setOrderSide("buy")}
                    className={orderSide === "buy" ? "bg-data-positive hover:bg-data-positive/90" : ""}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === "sell" ? "default" : "outline"}
                    onClick={() => setOrderSide("sell")}
                    className={orderSide === "sell" ? "bg-data-negative hover:bg-data-negative/90" : ""}
                  >
                    Sell
                  </Button>
                </div>
              </div>

              {/* Order Type */}
              <Tabs value={orderType} onValueChange={setOrderType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                  <TabsTrigger value="stop">Stop</TabsTrigger>
                </TabsList>

                <TabsContent value="market" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ({selectedAsset})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
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
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={!amount || (orderType !== "market" && !limitPrice)}
              >
                Place {orderSide.charAt(0).toUpperCase() + orderSide.slice(1)} Order
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
                <span>24h Volume: $124M</span>
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
    </div>
  );
}