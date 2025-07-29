import React, { useState, useEffect } from "react";
import { X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AssetDropdown, Asset } from "./AssetDropdown";
import { cn } from "@/lib/utils";

interface StakingPool {
  id: string;
  name: string;
  apy: string;
  lockPeriod: string;
  minStake: string;
  autoCompound: boolean;
}

interface StakingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPool?: StakingPool;
}

const MOCK_ASSETS: Asset[] = [
  { id: "usdc", symbol: "USDC", name: "USD Coin", balance: 5000.00 },
  { id: "eth", symbol: "ETH", name: "Ethereum", balance: 2.5 },
  { id: "eto", symbol: "ETO", name: "ETO Token", balance: 1000.00 },
  { id: "btc", symbol: "BTC", name: "Bitcoin", balance: 0.1 },
];

export function StakingWidget({ isOpen, onClose, selectedPool }: StakingWidgetProps) {
  const [payAsset, setPayAsset] = useState<Asset | null>(MOCK_ASSETS[0]);
  const [receiveAsset, setReceiveAsset] = useState<Asset | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  useEffect(() => {
    if (selectedPool && payAsset) {
      setReceiveAsset({
        id: `${selectedPool.name.toLowerCase()}-lp`,
        symbol: `${selectedPool.name} LP`,
        name: `${selectedPool.name} Liquidity Pool`,
        balance: 0
      });
    }
  }, [selectedPool, payAsset]);

  useEffect(() => {
    if (payAmount && selectedPool) {
      const amount = parseFloat(payAmount) || 0;
      setReceiveAmount(amount.toString());
    }
  }, [payAmount, selectedPool]);

  const handleMaxClick = () => {
    if (payAsset) {
      setPayAmount(payAsset.balance.toString());
    }
  };

  const getUsdValue = (amount: string, asset: Asset | null) => {
    if (!amount || !asset) return "$0.00";
    const value = parseFloat(amount) || 0;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const canStake = payAmount && parseFloat(payAmount) > 0 && payAsset && receiveAsset;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Card className="w-[400px] bg-card border border-border/60 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="text-lg font-medium">Stake</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-accent/60"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* You pay section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">You pay</label>
                {payAsset && (
                  <div className="text-xs text-muted-foreground">
                    Balance: {payAsset.balance.toFixed(2)} {payAsset.symbol}
                  </div>
                )}
              </div>
              <div className="bg-input/30 border border-border/60 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="h-16 text-2xl font-mono bg-transparent border-0 px-0 focus-visible:ring-0"
                    />
                    <div className="text-sm text-muted-foreground font-mono mt-1">
                      {getUsdValue(payAmount, payAsset)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <AssetDropdown
                      assets={MOCK_ASSETS}
                      selectedAsset={payAsset}
                      onSelectAsset={setPayAsset}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMaxClick}
                      className="text-xs h-7"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full bg-accent hover:bg-accent/80 border-border/60"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* You receive section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">You receive</label>
                 {selectedPool && (
                   <div className="text-xs text-data-positive font-mono">
                     {selectedPool.apy} APY
                   </div>
                 )}
              </div>
              <div className="bg-input/30 border border-border/60 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={receiveAmount}
                      readOnly
                      className="h-16 text-2xl font-mono bg-transparent border-0 px-0 focus-visible:ring-0"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedPool && (
                        <>
                          Lock Period: {selectedPool.lockPeriod}
                          {selectedPool.autoCompound && (
                            <span className="ml-2 text-data-positive">• Auto-Compound</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="min-w-[120px]">
                    {receiveAsset && (
                      <div className="bg-background border border-border/60 rounded-lg px-3 py-2 h-12 flex items-center">
                        <span className="font-medium text-sm">{receiveAsset.symbol}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <Button
              className={cn(
                "w-full h-12 rounded-lg font-medium tracking-wide transition-all duration-300",
                canStake
                  ? "bg-data-positive text-white hover:bg-data-positive/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              disabled={!canStake}
            >
              {!payAmount ? "Enter an amount" : "Stake Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}