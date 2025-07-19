
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

interface AssetSelectorProps {
  label: string;
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  balance?: string;
  showBalance?: boolean;
  readOnly?: boolean;
}

const popularAssets: Asset[] = [
  { symbol: "ETH", name: "Ethereum", price: 2000, change24h: 2.5, icon: "🔵" },
  { symbol: "BTC", name: "Bitcoin", price: 42000, change24h: 1.8, icon: "🟠" },
  { symbol: "USDC", name: "USD Coin", price: 1, change24h: 0.1, icon: "🔴" },
  { symbol: "USDT", name: "Tether", price: 1, change24h: -0.05, icon: "🟢" },
];

const allAssets: Asset[] = [
  ...popularAssets,
  { symbol: "DAI", name: "Dai Stablecoin", price: 1, change24h: 0.02, icon: "🟡" },
  { symbol: "LINK", name: "Chainlink", price: 15.5, change24h: 3.2, icon: "🔗" },
  { symbol: "UNI", name: "Uniswap", price: 6.8, change24h: -1.4, icon: "🦄" },
];

export function AssetSelector({ 
  label, 
  selectedAsset, 
  onAssetChange, 
  amount, 
  onAmountChange, 
  balance, 
  showBalance = false,
  readOnly = false 
}: AssetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredAssets = allAssets.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAssetData = allAssets.find(asset => asset.symbol === selectedAsset);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Popular Assets Quick Select */}
      {!showSearch && (
        <div className="flex flex-wrap gap-2 mb-3">
          {popularAssets.map((asset) => (
            <Button
              key={asset.symbol}
              variant={selectedAsset === asset.symbol ? "default" : "outline"}
              size="sm"
              onClick={() => onAssetChange(asset.symbol)}
              className="text-xs"
            >
              {asset.icon} {asset.symbol}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="text-xs"
          >
            <Search className="h-3 w-3" />
            More
          </Button>
        </div>
      )}

      {/* Search Interface */}
      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 bg-card border rounded-sm p-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                className={`flex items-center justify-between p-2 rounded-sm cursor-pointer transition-colors ${
                  selectedAsset === asset.symbol 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  onAssetChange(asset.symbol);
                  setShowSearch(false);
                  setSearchTerm("");
                }}
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
                  <div className={`text-xs font-mono ${
                    asset.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(false)}
            className="w-full text-xs"
          >
            Close Search
          </Button>
        </div>
      )}

      {/* Amount Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="0.00"
            value={amount || ""}
            onChange={(e) => onAmountChange?.(e.target.value)}
            readOnly={readOnly}
            className="text-right font-mono"
          />
        </div>
        <Select value={selectedAsset} onValueChange={onAssetChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allAssets.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                {asset.icon} {asset.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Balance and Quick Amount Buttons */}
      {showBalance && balance && onAmountChange && (
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
                  onAmountChange((balanceNum * multiplier).toString());
                }}
              >
                {percent}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Asset Info */}
      {selectedAssetData && (
        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-sm border border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-lg">{selectedAssetData.icon}</span>
            <div>
              <div className="font-medium text-sm">{selectedAssetData.name}</div>
              <div className="text-xs text-muted-foreground">${selectedAssetData.price.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-3 w-3 ${
              selectedAssetData.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
            }`} />
            <span className={`text-sm font-mono ${
              selectedAssetData.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
            }`}>
              {selectedAssetData.change24h >= 0 ? '+' : ''}{selectedAssetData.change24h}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
