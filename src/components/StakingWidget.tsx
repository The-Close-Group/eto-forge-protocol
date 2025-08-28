import React, { useState, useEffect } from "react";
import { X, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AssetDropdown, Asset } from "./AssetDropdown";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isIsolated: boolean;
  onStakeNow: () => void;
}

const MOCK_ASSETS: Asset[] = [
  { id: "usdc", symbol: "USDC", name: "USD Coin", balance: 5000.00 },
  { id: "eth", symbol: "ETH", name: "Ethereum", balance: 2.5 },
  { id: "eto", symbol: "ETO", name: "ETO Token", balance: 1000.00 },
  { id: "btc", symbol: "BTC", name: "Bitcoin", balance: 0.1 },
];

export function StakingWidget({ isOpen, onClose, selectedPool, isExpanded, onToggleExpanded, isIsolated, onStakeNow }: StakingWidgetProps) {
  const [payAsset, setPayAsset] = useState<Asset | null>(MOCK_ASSETS[0]);
  const [receiveAsset, setReceiveAsset] = useState<Asset | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const isMobile = useIsMobile();

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

  const handleStakeNow = () => {
    if (canStake) {
      onStakeNow();
    }
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <Card className="w-full bg-background/50 backdrop-blur-sm border border-border/40 shadow-lg mb-6 transition-all duration-300 hover:bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpanded}
              className="h-10 w-10 hover:bg-accent/60 transition-all duration-200 rounded-lg"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold">Stake Assets</h3>
              {selectedPool && (
                <div className="text-sm text-muted-foreground">
                  {selectedPool.name} • <span className="text-data-positive">{selectedPool.apy} APY</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={onToggleExpanded}
            className="shadow-lg px-8"
          >
            Stake
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isIsolated && "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center"
    )}>
      <Card className={cn(
        "bg-background/95 backdrop-blur-sm border border-border/40 shadow-2xl",
        isIsolated ? "w-full max-w-lg" : "w-full max-w-lg mx-auto mb-6"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpanded}
              className="h-10 w-10 hover:bg-accent/60 transition-all duration-200 rounded-lg"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="text-xl font-bold">Stake Assets</h3>
              {selectedPool && (
                <div className="text-sm text-muted-foreground">
                  {selectedPool.name} • <span className="text-data-positive">{selectedPool.apy} APY</span>
                </div>
              )}
            </div>
          </div>
          {isIsolated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 hover:bg-accent/60 transition-all duration-200 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* You pay section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">You pay</label>
              {payAsset && (
                <div className="text-xs text-muted-foreground font-mono">
                  Balance: {payAsset.balance.toFixed(2)} {payAsset.symbol}
                </div>
              )}
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="text-4xl font-bold font-mono bg-transparent border-0 px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/30"
                  />
                  <div className="text-lg text-muted-foreground font-mono mt-1">
                    {getUsdValue(payAmount, payAsset)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-xs h-8 px-3 hover:bg-primary/10 hover:text-primary border-border/40"
                  >
                    MAX
                  </Button>
                  <AssetDropdown
                    assets={MOCK_ASSETS}
                    selectedAsset={payAsset}
                    onSelectAsset={setPayAsset}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <div className="bg-background/80 border border-border/40 rounded-full p-3 shadow-lg">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* You receive section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">You receive</label>
              {selectedPool && (
                <div className="text-xs text-data-positive font-semibold">
                  {selectedPool.apy} APY
                </div>
              )}
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="text-4xl font-bold font-mono text-muted-foreground">
                    {receiveAmount || "0"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    {selectedPool && (
                      <>
                        <div>Lock Period: <span className="text-foreground">{selectedPool.lockPeriod}</span></div>
                        {selectedPool.autoCompound && (
                          <div className="text-data-positive">• Auto-Compound Enabled</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  {receiveAsset && (
                    <div className="bg-accent/20 border border-border/40 rounded-xl px-4 py-3">
                      <span className="font-semibold text-sm">{receiveAsset.symbol}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            className={cn(
              "w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg",
              canStake
                ? "bg-data-positive hover:bg-data-positive/90 text-white"
                : "bg-muted/50 text-muted-foreground cursor-not-allowed"
            )}
            disabled={!canStake}
            onClick={handleStakeNow}
          >
            {!payAmount ? "Enter Amount to Stake" : "Stake Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}