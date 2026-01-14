import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActiveAccount } from 'thirdweb/react';
import { ArrowDownUp, Loader2, Zap, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useDirectSwap } from '@/hooks/useDirectSwap';
import maangLogo from '@/assets/maang-logo.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Token definitions
const TOKENS = {
  mUSDC: {
    symbol: 'mUSDC',
    name: 'Mock USDC',
    icon: '💵',
    decimals: 6,
    color: '#2775CA'
  },
  MAANG: {
    symbol: 'MAANG',
    name: 'MAANG Index',
    logo: maangLogo,
    decimals: 18,
    color: '#4dd4ac'
  }
};

interface SwapWidgetProps {
  className?: string;
}

export function SwapWidget({ className }: SwapWidgetProps) {
  const account = useActiveAccount();
  const directSwap = useDirectSwap();
  
  // State
  const [fromToken, setFromToken] = useState<'mUSDC' | 'MAANG'>('mUSDC');
  const [toToken, setToToken] = useState<'mUSDC' | 'MAANG'>('MAANG');
  const [inputAmount, setInputAmount] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [quote, setQuote] = useState<{ output: string; minReceived: string } | null>(null);
  const [livePrice, setLivePrice] = useState<number>(328.0);
  const [slippage, setSlippage] = useState(0.5);
  const [userBalances, setUserBalances] = useState({ usdc: '0', dri: '0' });

  // Fetch price and balances
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
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [directSwap, account?.address]);

  // Get quote when input changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setQuote(null);
        return;
      }

      const isReversed = fromToken === 'MAANG';
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
  }, [inputAmount, fromToken, directSwap]);

  // Calculated output
  const outputAmount = useMemo(() => {
    if (quote?.output) return quote.output;
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return '0.00';
    const input = parseFloat(inputAmount);
    const isReversed = fromToken === 'MAANG';
    return isReversed 
      ? (input * livePrice).toFixed(2)
      : (input / livePrice).toFixed(6);
  }, [inputAmount, fromToken, livePrice, quote]);

  // Flip tokens
  const handleFlip = useCallback(() => {
    setIsFlipping(true);
    setFromToken(prev => prev === 'mUSDC' ? 'MAANG' : 'mUSDC');
    setToToken(prev => prev === 'mUSDC' ? 'MAANG' : 'mUSDC');
    setInputAmount('');
    setQuote(null);
    setTimeout(() => setIsFlipping(false), 300);
  }, []);

  // Execute swap
  const handleSwap = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    const isReversed = fromToken === 'MAANG';
    try {
      const success = isReversed
        ? await directSwap.sellDRI(inputAmount, quote?.minReceived)
        : await directSwap.buyDRI(inputAmount, quote?.minReceived);

      if (success) {
        setInputAmount('');
        setQuote(null);
        // Refresh balances
        const balances = await directSwap.getBalances();
        setUserBalances(balances);
      }
    } catch (error) {
      console.error('Swap error:', error);
    }
  };

  // Get balance for current from token
  const fromBalance = useMemo(() => {
    return fromToken === 'mUSDC' 
      ? parseFloat(userBalances.usdc).toFixed(2)
      : parseFloat(userBalances.dri).toFixed(4);
  }, [fromToken, userBalances]);

  // Price impact
  const priceImpact = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) === 0) return 0;
    return Math.min((parseFloat(inputAmount) / 10000) * 100, 5);
  }, [inputAmount]);

  const isLoading = directSwap.isLoading || directSwap.isApproving;

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick Swap
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">Slippage</div>
                <div className="flex gap-1">
                  {[0.5, 1, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                        slippage === s 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* From Token */}
        <div className="bg-muted/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>From</span>
            <span>Balance: {fromBalance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 text-lg font-mono focus-visible:ring-0 p-0 h-auto"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
              {fromToken === 'MAANG' ? (
                <img src={TOKENS.MAANG.logo} alt="" className="w-5 h-5" />
              ) : (
                <span className="text-lg">{TOKENS.mUSDC.icon}</span>
              )}
              <span className="font-medium text-sm">{fromToken}</span>
            </div>
          </div>
          {account && parseFloat(fromBalance) > 0 && (
            <div className="flex gap-1">
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => setInputAmount((parseFloat(fromBalance) * pct / 100).toString())}
                  className="flex-1 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleFlip}
            className={`w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all ${isFlipping ? 'animate-spin' : ''}`}
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-muted/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>To</span>
            {priceImpact > 0 && (
              <span className={priceImpact > 2 ? 'text-data-negative' : ''}>
                Impact: {priceImpact.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-lg font-mono text-muted-foreground">
              {outputAmount}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
              {toToken === 'MAANG' ? (
                <img src={TOKENS.MAANG.logo} alt="" className="w-5 h-5" />
              ) : (
                <span className="text-lg">{TOKENS.mUSDC.icon}</span>
              )}
              <span className="font-medium text-sm">{toToken}</span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Rate</span>
          <span className="font-mono">
            1 MAANG = ${livePrice.toFixed(2)}
          </span>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!account || isLoading || !inputAmount || parseFloat(inputAmount) <= 0}
          className="w-full h-11 text-sm font-semibold"
          variant="cta"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !account ? (
            'Connect Wallet'
          ) : (
            `Swap ${fromToken} → ${toToken}`
          )}
        </Button>

        {/* Min received */}
        {quote?.minReceived && parseFloat(inputAmount) > 0 && (
          <div className="text-[11px] text-center text-muted-foreground">
            Min received: {parseFloat(quote.minReceived).toFixed(4)} {toToken}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

