import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { 
  TrendingUp, Loader2, ArrowDownUp, Shield, AlertTriangle, Info, Zap, 
  ExternalLink, Check, RefreshCw, Clock, ChevronRight, Sparkles,
  ChevronDown, Wallet, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { ShareTradeCard } from '@/components/ShareTradeCard';
import { useDirectSwap } from '@/hooks/useDirectSwap';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import maangLogo from '@/assets/maang-logo.svg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export default function BuyMAANG() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const directSwap = useDirectSwap();

  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [isFirstTrade, setIsFirstTrade] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [livePrice, setLivePrice] = useState<number>(0);
  const [userBalances, setUserBalances] = useState({ usdc: '0', dri: '0' });
  const [quote, setQuote] = useState<{ output: string; minReceived: string } | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [recentTrades, setRecentTrades] = useState<Array<{id: string; from: string; to: string; amount: string; time: Date}>>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasTraded = localStorage.getItem('hasCompletedTrade');
    if (!hasTraded) setIsFirstTrade(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const price = await directSwap.getCurrentPrice();
      if (price > 0) setLivePrice(price);
      
      if (account?.address) {
        const balances = await directSwap.getBalances();
        setUserBalances(balances);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [directSwap, account?.address]);

  const driPrice = livePrice || 328.0;
  const fromToken = useMemo(() => isReversed ? 'MAANG' : 'mUSDC', [isReversed]);
  const toToken = useMemo(() => isReversed ? 'mUSDC' : 'MAANG', [isReversed]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setQuote(null);
        return;
      }

      const quoteResult = isReversed
        ? await directSwap.getSellQuote(inputAmount)
        : await directSwap.getBuyQuote(inputAmount);

      if (quoteResult) {
        setQuote({
          output: quoteResult.outputAmount,
          minReceived: quoteResult.minimumReceived,
        });
      }
    };

    const debounce = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounce);
  }, [inputAmount, isReversed, directSwap]);

  const outputAmount = useMemo(() => {
    if (quote?.output) return quote.output;
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return '0.00';
    const input = parseFloat(inputAmount);
    return isReversed 
      ? (input * driPrice).toFixed(2)
      : (input / driPrice).toFixed(6);
  }, [inputAmount, isReversed, driPrice, quote]);

  const { totalCost, estimatedFee, totalWithFee } = useMemo(() => {
    const cost = parseFloat(inputAmount || '0');
    const fee = cost * 0.003;
    return { totalCost: cost, estimatedFee: fee, totalWithFee: cost + fee };
  }, [inputAmount]);

  const priceImpact = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) === 0) return 0;
    return Math.min((parseFloat(inputAmount) / 10000) * 100, 15);
  }, [inputAmount]);

  const validateAmount = useCallback((amount: string): string => {
    if (!amount || amount === '0') return '';
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 'Please enter a valid amount';
    if (num < 0.01) return 'Minimum swap amount is 0.01';
    if (num > 1000000) return 'Maximum swap amount is 1,000,000';
    if (account) {
      const balance = isReversed ? parseFloat(userBalances.dri) : parseFloat(userBalances.usdc);
      if (num > balance) return `Insufficient ${fromToken} balance (have ${balance.toFixed(2)})`;
    }
    return '';
  }, [account, fromToken, isReversed, userBalances]);

  useEffect(() => {
    setValidationError(validateAmount(inputAmount));
  }, [inputAmount, validateAmount]);

  const handleFlipTokens = useCallback(() => {
    setIsFlipping(true);
    setIsReversed(prev => !prev);
    setInputAmount('');
    setValidationError('');
    setTimeout(() => setIsFlipping(false), 300);
  }, []);
  
  const handleSwapClick = useCallback(() => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setShowConfirmation(true);
  }, [account, validationError, inputAmount]);

  const handleConfirmSwap = async () => {
    setShowConfirmation(false);
    try {
      const txHash = isReversed
        ? await directSwap.sellDRI(inputAmount, quote?.minReceived)
        : await directSwap.buyDRI(inputAmount, quote?.minReceived);

      if (txHash) {
        setLastTxHash(txHash);
        const newBalances = await directSwap.getBalances();
        setUserBalances(newBalances);
        
        // Add to recent trades
        setRecentTrades(prev => [{
          id: txHash,
          from: fromToken,
          to: toToken,
          amount: outputAmount,
          time: new Date()
        }, ...prev].slice(0, 5));

        if (isFirstTrade) {
          localStorage.setItem('hasCompletedTrade', 'true');
          setShowShareCard(true);
        } else {
          setInputAmount('');
          setQuote(null);
        }
      }
    } catch (error) {
      console.error('Swap error:', error);
    }
  };

  const handleCloseShare = () => {
    setShowShareCard(false);
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Confirm Swap
            </DialogTitle>
            <DialogDescription>Review your swap details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {isReversed ? (
                      <img src={maangLogo} alt="" className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">💵</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">You pay</div>
                    <div className="text-xl font-bold">{inputAmount} {fromToken}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center my-2">
                <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {isReversed ? (
                      <span className="text-lg">💵</span>
                    ) : (
                      <img src={maangLogo} alt="" className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">You receive</div>
                    <div className="text-xl font-bold text-primary">{outputAmount} {toToken}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono">1 MAANG = ${driPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trading Fee (0.3%)</span>
                <span className="font-mono">${estimatedFee.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={`font-mono ${priceImpact > 3 ? 'text-warning' : 'text-data-positive'}`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-mono">{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Fee</span>
                <span className="text-data-positive font-medium">Sponsored ✓</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>Cancel</Button>
            <Button variant="cta" onClick={handleConfirmSwap}>
              Confirm Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-[1440px] mx-auto p-6">
        {/* Page Header */}
        <div 
          className={`mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
            <ArrowDownUp className="w-4 h-4" />
            <span>Dynamic Market Maker</span>
            <Badge variant="outline" className="ml-2 text-[10px]">Live</Badge>
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-2">Swap Tokens</h1>
          <p className="text-muted-foreground text-[15px]">
            Instant swaps between MAANG and mUSDC with zero gas fees
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div 
            className={`space-y-6 transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Price Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'MAANG Price', value: `$${driPrice.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4" />, change: '+2.4%' },
                { label: 'mUSDC Balance', value: account ? userBalances.usdc : '0.00', icon: <Wallet className="w-4 h-4" /> },
                { label: 'MAANG Balance', value: account ? userBalances.dri : '0.00', icon: <Wallet className="w-4 h-4" /> },
                { label: '24h Volume', value: '—', icon: <Zap className="w-4 h-4" /> },
              ].map((stat) => (
                <Card key={stat.label} className="group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      {stat.icon}
                      <span className="text-[12px]">{stat.label}</span>
                    </div>
                    <div className="text-xl font-semibold font-mono">{stat.value}</div>
                    {stat.change && (
                      <div className="text-[11px] text-data-positive mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.change}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Swap Card */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <ArrowDownUp className="w-5 h-5 text-primary" />
                    Swap
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px]">
                      <Zap className="w-3 h-3 mr-1" />
                      DMM
                    </Badge>
                    <button 
                      className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                      onClick={() => toast.info(`Slippage: ${slippage}%`)}
                    >
                      {slippage}% slippage
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* From Token */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>You Pay</Label>
                    <span className="text-[12px] text-muted-foreground">
                      Balance: {isReversed ? userBalances.dri : userBalances.usdc} {fromToken}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        className={`text-2xl font-mono h-14 pr-24 ${
                          validationError ? 'border-destructive' : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          {isReversed ? (
                            <img src={maangLogo} alt="" className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">$</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{fromToken}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setInputAmount(isReversed ? userBalances.dri : userBalances.usdc)}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                {/* Flip Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleFlipTokens}
                    className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center bg-background shadow-lg hover:border-primary transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ rotate: isFlipping ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <ArrowDownUp className="w-5 h-5 text-primary" />
                  </motion.button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <Label>You Receive</Label>
                  <div className="relative">
                    <div className="w-full px-4 py-4 border border-border rounded-xl bg-muted/30 text-2xl font-mono flex items-center justify-between">
                      <span>{outputAmount}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {isReversed ? (
                            <span className="text-xs">$</span>
                          ) : (
                            <img src={maangLogo} alt="" className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{toToken}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                    <span className="text-sm text-destructive">{validationError}</span>
                  </div>
                )}

                {/* Transaction Details */}
                {inputAmount && parseFloat(inputAmount) > 0 && !validationError && (
                  <div className="p-4 rounded-xl bg-muted/30 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span className="font-mono">1 MAANG = ${driPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trading Fee</span>
                      <span className="font-mono">${estimatedFee.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className={`font-mono ${priceImpact > 3 ? 'text-warning' : 'text-data-positive'}`}>
                        ~{priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Gas Fee
                      </span>
                      <span className="text-data-positive font-medium">Sponsored ✓</span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                {!account ? (
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={etoMainnet}
                    chains={supportedChains}
                    connectModal={{ size: "compact" }}
                    connectButton={{
                      label: "Connect Wallet to Swap",
                      style: {
                        width: "100%",
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "none",
                        borderRadius: "12px",
                        padding: "14px",
                        fontSize: "14px",
                        fontWeight: "600",
                      },
                    }}
                  />
                ) : (
                  <Button
                    variant={priceImpact > 5 ? "destructive" : "cta"}
                    size="xl"
                    className="w-full"
                    onClick={handleSwapClick}
                    disabled={!inputAmount || parseFloat(inputAmount) <= 0 || directSwap.isLoading || directSwap.isApproving || !!validationError}
                  >
                    {directSwap.isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Approving...
                      </>
                    ) : directSwap.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Swapping...
                      </>
                    ) : validationError ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Cannot Swap
                      </>
                    ) : (
                      <>
                        <ArrowDownUp className="w-4 h-4 mr-2" />
                        Swap {fromToken} for {toToken}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Trades */}
            {recentTrades.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Swaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-data-positive/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-data-positive" />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium">{trade.from} → {trade.to}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {trade.time.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-mono font-medium">{trade.amount}</div>
                        <a
                          href={`https://eto-explorer.ash.center/tx/${trade.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div 
            className={`space-y-5 transition-all duration-700 delay-200 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* MAANG Price Card */}
            <div className="cta-card">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-2">
                    <img src={maangLogo} alt="" className="w-full h-full" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">MAANG</div>
                    <div className="text-[11px] text-muted-foreground">Dynamic Reflective Index</div>
                  </div>
                </div>
                
                <div className="text-[42px] font-semibold tracking-tight leading-none text-primary mb-2">
                  ${driPrice.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-4">
                  <Badge variant="outline" className="text-[10px]">Live from DMM</Badge>
                  <span className="text-data-positive flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2.4%
                  </span>
                </div>

                <Sparkline data={generateSparklineData(30, 'up')} height={60} variant="positive" showArea={true} />
              </div>
            </div>

            {/* Market Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Market Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-mono">—</span>
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
                  <span className="text-muted-foreground">Fees Saved Today</span>
                  <span className="text-data-positive font-mono">$45.2K</span>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  How Swapping Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: '1', title: 'Enter Amount', desc: 'Type how much to swap' },
                  { step: '2', title: 'Review Rate', desc: 'Check the exchange rate' },
                  { step: '3', title: 'Confirm Swap', desc: 'Approve the transaction' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/staking">
                    <span className="text-[13px]">Stake MAANG</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/faucet">
                    <span className="text-[13px]">Get Test Tokens</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/dashboard">
                    <span className="text-[13px]">View Dashboard</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Card */}
      <ShareTradeCard
        isOpen={showShareCard}
        onClose={handleCloseShare}
        fromAsset={fromToken}
        toAsset={toToken}
        amount={outputAmount}
      />
    </div>
  );
}
