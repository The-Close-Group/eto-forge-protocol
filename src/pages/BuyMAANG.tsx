import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useActiveAccount } from 'thirdweb/react';
import { TrendingUp, Loader2, ArrowDownUp, Shield, AlertTriangle, Info, Zap, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ShareTradeCard } from '@/components/ShareTradeCard';
import { useDirectSwap } from '@/hooks/useDirectSwap';
// Logo not needed in this component

export default function BuyMAANG() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  
  // Use direct swap hook (bypasses Thirdweb)
  const directSwap = useDirectSwap();

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

  // Check if this is user's first trade
  useEffect(() => {
    const hasTraded = localStorage.getItem('hasCompletedTrade');
    if (!hasTraded) {
      setIsFirstTrade(true);
    }
  }, []);

  // Fetch live price and balances
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
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [directSwap, account?.address]);

  const driPrice = livePrice || 328.0; // Fallback to ~oracle price
  const usdcPrice = 1.0;

  // Memoize token directions
  const fromToken = useMemo(() => isReversed ? 'MAANG' : 'mUSDC', [isReversed]);
  const toToken = useMemo(() => isReversed ? 'mUSDC' : 'MAANG', [isReversed]);

  // Fetch quote when input changes
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

  // Memoize calculations
  const outputAmount = useMemo(() => {
    // Use live quote if available
    if (quote?.output) return quote.output;
    
    // Fallback to estimate
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return '0.00';
    const input = parseFloat(inputAmount);

    if (isReversed) {
      // MAANG -> mUSDC
      const output = input * driPrice;
      return output.toFixed(2);
    } else {
      // mUSDC -> MAANG
      const output = input / driPrice;
      return output.toFixed(6);
    }
  }, [inputAmount, isReversed, driPrice, quote]);

  const { totalCost, estimatedFee, totalWithFee } = useMemo(() => {
    const cost = parseFloat(inputAmount || '0');
    const fee = cost * 0.003;
    return {
      totalCost: cost,
      estimatedFee: fee,
      totalWithFee: cost + fee
    };
  }, [inputAmount]);

  // Validation logic
  const validateAmount = useCallback((amount: string): string => {
    if (!amount || amount === '0') return '';

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return 'Please enter a valid amount';
    }

    if (num < 0.01) {
      return 'Minimum swap amount is 0.01';
    }

    if (num > 1000000) {
      return 'Maximum swap amount is 1,000,000';
    }

    // Check real balance if wallet connected
    if (account) {
      const balance = isReversed
        ? parseFloat(userBalances.dri)
        : parseFloat(userBalances.usdc);
      if (num > balance) {
        return `Insufficient ${fromToken} balance (have ${balance.toFixed(2)})`;
      }
    }

    return '';
  }, [account, fromToken, isReversed, userBalances]);

  // Validate on amount change
  useEffect(() => {
    const error = validateAmount(inputAmount);
    setValidationError(error);
  }, [inputAmount, validateAmount]);

  // Price impact calculation
  const priceImpact = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) === 0) return 0;
    // Simulate price impact (higher for larger amounts)
    const amount = parseFloat(inputAmount);
    return Math.min((amount / 10000) * 100, 15); // Max 15% impact
  }, [inputAmount]);

  // Use callback for flip handler
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
      // Execute real swap
      let txHash: string | null;
      
      if (isReversed) {
        // Sell MAANG for USDC
        txHash = await directSwap.sellDRI(inputAmount, quote?.minReceived);
      } else {
        // Buy MAANG with USDC
        txHash = await directSwap.buyDRI(inputAmount, quote?.minReceived);
      }

      if (txHash) {
        setLastTxHash(txHash);
        
        // Refresh balances
        const newBalances = await directSwap.getBalances();
        setUserBalances(newBalances);

        // Mark as traded and show share card if first trade
        if (isFirstTrade) {
          localStorage.setItem('hasCompletedTrade', 'true');
          setShowShareCard(true);
        } else {
          // Reset form for next swap
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
    <div className="container mx-auto p-4 sm:p-6 pb-20 md:pb-6 max-w-2xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-mono flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArrowDownUp className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            Swap Tokens
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Swap between MAANG and mUSDC instantly
          </p>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1">MAANG Price</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                ${driPrice.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                Live from DMM
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1">Your Balances</div>
              <div className="text-lg sm:text-xl font-bold font-mono">
                {account ? userBalances.usdc : '0.00'} <span className="text-sm text-muted-foreground">mUSDC</span>
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-1">
                {account ? userBalances.dri : '0.00'} MAANG
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Swap Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5" />
                Swap Assets
              </div>
              <Badge variant="outline" className="text-xs gap-1">
                <Zap className="h-3 w-3" />
                DMM
              </Badge>
            </CardTitle>
            <CardDescription>
              Using ETO Protocol's Dynamic Market Maker for optimal pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Input Section */}
            <div className="space-y-3 sm:space-y-4 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`input-${isReversed}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <Label className="text-sm sm:text-base">You Pay</Label>
                    <span className="text-xs text-muted-foreground">
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
                        className={`pr-20 text-base sm:text-lg font-mono h-12 sm:h-auto ${
                          validationError ? 'border-destructive focus-visible:ring-destructive' : ''
                        }`}
                      />
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`from-${fromToken}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium"
                        >
                          {fromToken}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-12 px-4"
                      onClick={() => {
                        const balance = isReversed ? userBalances.dri : userBalances.usdc;
                        setInputAmount(balance);
                      }}
                    >
                      MAX
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Flip Button */}
              <div className="flex justify-center py-1 relative z-10">
                <motion.button
                  onClick={handleFlipTokens}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-background shadow-lg cursor-pointer hover:shadow-xl transition-colors ${
                    isFlipping ? 'border-primary' : 'border-primary/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ rotate: isFlipping ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                >
                  <ArrowDownUp className="h-6 w-6 text-primary" />
                </motion.button>
              </div>

              {/* Output Section */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`output-${isReversed}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <Label className="text-sm sm:text-base">You Receive</Label>
                  <div className="relative">
                    <div className="w-full px-4 py-3 sm:py-3.5 border border-border rounded-lg bg-muted text-base sm:text-lg font-mono min-h-[48px] flex items-center">
                      {outputAmount}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`to-${toToken}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium"
                      >
                        {toToken}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Validation Error */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{validationError}</p>
              </motion.div>
            )}

            {/* Transaction Details */}
            {inputAmount && parseFloat(inputAmount) > 0 && !validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-muted rounded-lg overflow-hidden"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-mono">1 MAANG = ${driPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trading Fee (0.3%)</span>
                  <span className="font-mono">${estimatedFee.toFixed(2)}</span>
                </div>
                {priceImpact > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Price Impact
                      <Info className="h-3 w-3" />
                    </span>
                    <span className={`font-mono ${
                      priceImpact > 5 ? 'text-destructive' : priceImpact > 3 ? 'text-warning' : 'text-muted-foreground'
                    }`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Cost</span>
                    <span className="font-mono font-bold">{totalWithFee.toFixed(4)} {fromToken}</span>
                  </div>
                </div>
                {priceImpact > 5 && (
                  <div className="flex items-start gap-2 pt-2 text-xs text-warning">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>High price impact! Consider reducing swap amount.</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleSwapClick}
              disabled={!account || !inputAmount || parseFloat(inputAmount) <= 0 || directSwap.isLoading || directSwap.isApproving || !!validationError}
              className="w-full h-12 sm:h-11 text-base"
              variant={priceImpact > 5 ? "destructive" : "positive"}
              size="lg"
            >
              {directSwap.isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : directSwap.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Swapping...
                </>
              ) : !account ? (
                'Connect Wallet to Swap'
              ) : validationError ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Cannot Swap
                </>
              ) : (
                <>
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  {priceImpact > 5 ? 'Swap Anyway' : `Swap ${fromToken}`}
                </>
              )}
            </Button>

            {!account && (
              <div className="text-center text-sm text-muted-foreground">
                Connect your wallet to start swapping tokens
              </div>
            )}

            {account && inputAmount && !validationError && (
              <div className="text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Gas fees sponsored • 0.3% trading fee</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Transaction Link */}
        {lastTxHash && (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">
                  ✓ Last swap successful!
                </span>
                <a
                  href={`https://eto-explorer.ash.center/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                  View transaction <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Trading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <strong className="text-foreground">Instant Swaps:</strong> Swap between MAANG and mUSDC instantly with 0.3% fees
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <strong className="text-foreground">Protocol-Owned Liquidity:</strong> Deep liquidity provided by ETO Protocol
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <strong className="text-foreground">Fair Pricing:</strong> Current MAANG price: ${driPrice.toFixed(2)} from DMM
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Confirm Swap
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <span className="block">You are about to swap:</span>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You pay:</span>
                    <span className="font-mono font-semibold">{inputAmount} {fromToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You receive:</span>
                    <span className="font-mono font-semibold">{outputAmount} {toToken}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Exchange Rate:</span>
                    <span className="font-mono">1 MAANG = ${driPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trading Fee:</span>
                    <span className="font-mono">${estimatedFee.toFixed(2)}</span>
                  </div>
                </div>

                <span className="block text-sm">Are you sure you want to proceed?</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwap} className="bg-data-positive hover:bg-data-positive/90">
              Confirm Swap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Card for First Trade */}
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
