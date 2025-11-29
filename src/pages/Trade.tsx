import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useStakingContext } from "@/contexts/StakingContext";
import { toast } from "sonner";
import { 
  ArrowDownUp, TrendingUp, TrendingDown, RefreshCw, 
  Calculator, Info, ChevronDown, Check, Zap, Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import maangLogo from "@/assets/maang-logo.svg";

// Simulated trading pairs
const tradingPairs = [
  { id: 'maang-usdc', from: 'USDC', to: 'MAANG', rate: 0.98, change: 2.4, volume: '2.4M' },
  { id: 'eth-usdc', from: 'USDC', to: 'ETH', rate: 0.00042, change: 1.2, volume: '12.8M' },
  { id: 'bnb-usdc', from: 'USDC', to: 'BNB', rate: 0.0033, change: -0.8, volume: '5.2M' },
];

export default function Trade() {
  const navigate = useNavigate();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();
  const { 
    assets, 
    selectedAsset, 
    selectAsset,
    calculateProjection,
    investmentPeriod,
    autoCompound,
    getEffectiveAPY,
  } = useStakingContext();

  // Trade state
  const [fromAmount, setFromAmount] = useState('100');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('MAANG');
  const [slippage, setSlippage] = useState(0.5);
  const [isSwapping, setIsSwapping] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<Array<{id: string; from: string; to: string; amount: number; rate: number; time: Date}>>([]);

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  // Use DMM price as the live trading price
  const livePrice = dmmPrice || oraclePrice || 1;
  const priceSource = dmmPrice > 0 ? 'DMM' : oraclePrice > 0 ? 'Oracle' : 'N/A';

  // Calculate output amount
  useEffect(() => {
    const inputAmount = parseFloat(fromAmount) || 0;
    if (fromToken === 'USDC' && toToken === 'MAANG') {
      setToAmount((inputAmount / livePrice).toFixed(4));
    } else if (fromToken === 'MAANG' && toToken === 'USDC') {
      setToAmount((inputAmount * livePrice).toFixed(2));
    }
  }, [fromAmount, fromToken, toToken, livePrice]);

  // Swap tokens
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    toast.info(`Swapped direction: ${toToken} → ${fromToken}`);
  };

  // Execute trade
  const handleTrade = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setConfirmDialogOpen(true);
  };

  // Confirm trade
  const handleConfirmTrade = async () => {
    setIsSwapping(true);
    setConfirmDialogOpen(false);
    
    toast.loading('Processing trade...', { id: 'trade' });
    
    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTrade = {
      id: `trade-${Date.now()}`,
      from: fromToken,
      to: toToken,
      amount: parseFloat(fromAmount),
      rate: livePrice,
      time: new Date(),
    };
    
    setTradeHistory(prev => [newTrade, ...prev].slice(0, 5));
    
    toast.success(`Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`, { id: 'trade' });
    setIsSwapping(false);
    setFromAmount('100');
  };

  // Calculate price impact
  const priceImpact = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    if (amount > 10000) return 2.5;
    if (amount > 5000) return 1.2;
    if (amount > 1000) return 0.5;
    return 0.1;
  }, [fromAmount]);

  // Get available staking assets for quick stake
  const topStakingAssets = useMemo(() => {
    return assets.slice(0, 4).map(asset => ({
      ...asset,
      effectiveAPY: getEffectiveAPY(asset.baseAPY, investmentPeriod, autoCompound),
    }));
  }, [assets, getEffectiveAPY, investmentPeriod, autoCompound]);

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Confirm Trade Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Confirm Trade
            </DialogTitle>
            <DialogDescription>Review your trade details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <div className="text-sm text-muted-foreground">You pay</div>
                <div className="text-2xl font-bold">{fromAmount} {fromToken}</div>
              </div>
              <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-sm text-muted-foreground">You receive</div>
                <div className="text-2xl font-bold text-primary">{toAmount} {toToken}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {fromToken} = {(1 / livePrice).toFixed(4)} {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={priceImpact > 1 ? 'text-warning' : 'text-data-positive'}>{priceImpact}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-data-positive">Sponsored</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button variant="cta" onClick={handleConfirmTrade} disabled={isSwapping}>
              {isSwapping ? 'Processing...' : 'Confirm Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-display-lg md:text-display-xl font-display mb-4">
            Token{" "}
            <span className="text-muted-foreground/40">Trading Hub</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Trade MAANG tokens on the Dynamic Market Maker
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Trading Panel */}
          <div className="space-y-6">
            {/* Swap Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Swap</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        {slippage}% slippage
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[0.1, 0.5, 1, 2].map(s => (
                        <DropdownMenuItem key={s} onClick={() => { setSlippage(s); toast.info(`Slippage set to ${s}%`); }}>
                          {slippage === s && <Check className="w-4 h-4 mr-2" />}
                          {s}%
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* From Input */}
                <div className="space-y-2">
                  <Label>From</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 text-lg font-mono"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-28 justify-between">
                          {fromToken}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['USDC', 'MAANG', 'ETH'].map(token => (
                          <DropdownMenuItem 
                            key={token} 
                            onClick={() => { 
                              setFromToken(token); 
                              if (token === toToken) setToToken(fromToken);
                            }}
                          >
                            {fromToken === token && <Check className="w-4 h-4 mr-2" />}
                            {token}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button 
                    className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
                    onClick={handleSwapTokens}
                  >
                    <ArrowDownUp className="w-5 h-5" />
                  </button>
                </div>

                {/* To Input */}
                <div className="space-y-2">
                  <Label>To</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={toAmount}
                      readOnly
                      placeholder="0.0"
                      className="flex-1 text-lg font-mono bg-muted/50"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-28 justify-between">
                          {toToken}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['USDC', 'MAANG', 'ETH'].map(token => (
                          <DropdownMenuItem 
                            key={token} 
                            onClick={() => { 
                              setToToken(token);
                              if (token === fromToken) setFromToken(toToken);
                            }}
                          >
                            {toToken === token && <Check className="w-4 h-4 mr-2" />}
                            {token}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Trade Info */}
                <div className="p-4 rounded-xl bg-muted/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-mono">1 {fromToken} = {(fromToken === 'USDC' ? 1/livePrice : livePrice).toFixed(4)} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className={`font-medium ${priceImpact > 1 ? 'text-warning' : 'text-data-positive'}`}>
                      ~{priceImpact}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Network Fee
                    </span>
                    <span className="text-data-positive">Sponsored ✓</span>
                  </div>
                </div>

                <Button 
                  variant="cta" 
                  size="lg" 
                  className="w-full"
                  onClick={handleTrade}
                  disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Swap ${fromToken} for ${toToken}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            {tradeHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[15px]">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tradeHistory.map(trade => (
                      <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-data-positive/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-data-positive" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{trade.amount} {trade.from} → {trade.to}</div>
                            <div className="text-xs text-muted-foreground">
                              {trade.time.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-data-positive">Completed</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center p-2">
                    <img src={maangLogo} alt="MAANG" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">MAANG</h3>
                    <p className="text-sm text-muted-foreground">Dynamic Reflective Index</p>
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-primary font-mono mb-2">
                  {isLoading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    `$${livePrice.toFixed(2)}`
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    Live from {priceSource}
                  </Badge>
                  {!isLoading && (
                    <Badge variant="outline" className="text-xs text-data-positive">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2.4%
                    </Badge>
                  )}
                </div>

                <Sparkline 
                  data={generateSparklineData(30, 'up')} 
                  height={80} 
                  variant="positive" 
                  showArea={true} 
                />
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Oracle Price</div>
                    <div className="font-mono">${oraclePrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">DMM Price</div>
                    <div className="font-mono">${dmmPrice.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stake Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Quick Stake After Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Stake your tokens after trading to earn rewards
                </p>
                
                {topStakingAssets.slice(0, 3).map(asset => (
                  <button
                    key={asset.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedAsset?.id === asset.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      selectAsset(asset.id);
                      toast.success(`Selected ${asset.name} for staking`);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <img src={asset.logo} alt="" className="w-6 h-6" />
                      <span className="font-medium text-sm">{asset.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{asset.effectiveAPY.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                  </button>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  View All Staking Options
                </Button>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-mono">$2.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidity</span>
                  <span className="font-mono">$12.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="font-mono">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Deviation</span>
                  <span className="font-mono text-data-positive">
                    {Math.abs(((dmmPrice - oraclePrice) / oraclePrice) * 10000).toFixed(2)} bps
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings icon component
function Settings({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );
}
