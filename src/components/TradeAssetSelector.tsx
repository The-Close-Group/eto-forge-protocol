
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  amount, 
  onAmountChange, 
  balance, 
  showBalance = false,
  readOnly = false 
}: TradeAssetSelectorProps) {
  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);
  const quantity = amount && selectedAssetData ? 
    (parseFloat(amount) / selectedAssetData.price).toFixed(6) : "0";

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Price Input Bar */}
      <div className="flex gap-2">
        <Select value={selectedAsset} onValueChange={onAssetChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                <div className="flex items-center gap-2">
                  <span>{asset.icon}</span>
                  <span>{asset.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            placeholder="0.00"
            value={amount || ""}
            onChange={(e) => onAmountChange?.(e.target.value)}
            readOnly={readOnly}
            className="pl-8 font-mono"
          />
        </div>
      </div>

      {/* Quantity Display */}
      <div className="pl-34">
        <p className="text-sm text-muted-foreground">
          Quantity: <span className="font-mono">{quantity} {selectedAsset}</span>
        </p>
      </div>

      {/* Selected Asset Info */}
      {selectedAssetData && (
        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-sm border border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-lg">{selectedAssetData.icon}</span>
            <div>
              <div className="font-medium text-sm">{selectedAssetData.name}</div>
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
          <p className="text-sm text-muted-foreground">
            Balance: {balance} {selectedAsset}
          </p>
          <div className="flex gap-1">
            {['25%', '50%', '75%', 'MAX'].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6"
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
