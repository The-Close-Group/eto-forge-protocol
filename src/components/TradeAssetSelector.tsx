
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

interface TradeAssetSelectorProps {
  label: string;
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  balance?: string;
  showBalance?: boolean;
  readOnly?: boolean;
  otherAsset?: string;
  onOtherAmountChange?: (amount: string) => void;
}

const assets: Asset[] = [
  { symbol: "MAANG", name: "Meta AI & Analytics", price: 238.00, icon: "🤖" },
  { symbol: "ETH", name: "Ethereum", price: 3567.00, icon: "⟐" },
  { symbol: "USDC", name: "USD Coin", price: 1.00, icon: "💵" },
  { symbol: "AVAX", name: "Avalanche", price: 26.00, icon: "🔺" },
  { symbol: "BTC", name: "Bitcoin", price: 45000.00, icon: "₿" },
];

export function TradeAssetSelector({ 
  label, 
  selectedAsset, 
  onAssetChange, 
  amount = "", 
  onAmountChange, 
  balance, 
  showBalance = false,
  readOnly = false,
  otherAsset,
  onOtherAmountChange
}: TradeAssetSelectorProps) {
  const [usdValue, setUsdValue] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState("");
  
  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);
  const otherAssetData = assets.find(asset => asset.symbol === otherAsset);

  // Calculate conversions with proper decimals
  useEffect(() => {
    if (selectedAssetData && amount) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum)) {
        const usdAmount = amountNum * selectedAssetData.price;
        setUsdValue(usdAmount.toFixed(2));
        
        const quantity = amountNum;
        setTokenQuantity(quantity.toFixed(6));
        
        // If this is the "from" asset, calculate the "to" amount
        if (otherAssetData && onOtherAmountChange && !readOnly) {
          const otherQuantity = amountNum * (selectedAssetData.price / otherAssetData.price);
          const otherUsdAmount = otherQuantity * otherAssetData.price;
          onOtherAmountChange(otherUsdAmount.toFixed(2));
        }
      }
    } else {
      setUsdValue("");
      setTokenQuantity("");
    }
  }, [amount, selectedAssetData, otherAssetData, onOtherAmountChange, readOnly]);

  const handleAmountChange = (value: string) => {
    if (onAmountChange) {
      onAmountChange(value);
    }
  };

  const handleAssetChange = (asset: string) => {
    onAssetChange(asset);
    // Recalculate when asset changes
    if (amount && onAmountChange) {
      handleAmountChange(amount);
    }
  };

  // Price impact warning for large trades
  const showPriceImpact = parseFloat(usdValue) > 10000;
  const priceImpact = Math.min((parseFloat(usdValue) / 100000) * 0.5, 2.0);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium font-mono">{label}</Label>
      
      {/* Asset Selection and Amount Input */}
      <div className="flex gap-2">
        <Select value={selectedAsset} onValueChange={handleAssetChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                <div className="flex items-center gap-2">
                  <span>{asset.icon}</span>
                  <span className="font-mono">{asset.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-mono">
            $
          </span>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            readOnly={readOnly}
            className="pl-8 font-mono"
            step="0.01"
          />
        </div>
      </div>

      {/* Quantity and USD Value Display */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Quantity</p>
          <p className="font-mono font-medium">
            {tokenQuantity} {selectedAsset}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">USD Value</p>
          <p className="font-mono font-medium">
            ${usdValue}
          </p>
        </div>
      </div>

      {/* Price Impact Warning */}
      {showPriceImpact && (
        <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-sm border border-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <div className="text-sm">
            <span className="text-warning font-medium">High Price Impact: </span>
            <span className="font-mono">{priceImpact.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* Selected Asset Info */}
      {selectedAssetData && (
        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-sm border border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-lg">{selectedAssetData.icon}</span>
            <div>
              <div className="font-medium text-sm font-mono">{selectedAssetData.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                ${selectedAssetData.price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance and Quick Amount Buttons */}
      {showBalance && balance && onAmountChange && selectedAssetData && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-mono">
            Balance: {balance} {selectedAsset}
          </p>
          <div className="flex gap-1">
            {['25%', '50%', '75%', 'MAX'].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6 font-mono"
                onClick={() => {
                  const balanceNum = parseFloat(balance);
                  const multiplier = percent === 'MAX' ? 1 : parseInt(percent) / 100;
                  const usdAmount = (balanceNum * multiplier * selectedAssetData.price).toString();
                  onAmountChange(usdAmount);
                }}
              >
                {percent}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
