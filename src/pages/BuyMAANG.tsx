import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useActiveAccount } from 'thirdweb/react';
import { ShoppingCart, TrendingUp, Loader2, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePrices } from '@/hooks/usePrices';
import { ShareTradeCard } from '@/components/ShareTradeCard';
import maangLogo from '@/assets/maang-logo.svg';

export default function BuyMAANG() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { getTokenPrice } = usePrices();
  
  const [usdcAmount, setUsdcAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [isFirstTrade, setIsFirstTrade] = useState(false);

  // Check if this is user's first trade
  useEffect(() => {
    const hasTraded = localStorage.getItem('hasCompletedTrade');
    if (!hasTraded) {
      setIsFirstTrade(true);
    }
  }, []);
  
  const maangPrice = getTokenPrice('MAANG') || 33.0;
  const usdcPrice = getTokenPrice('mUSDC') || 1.0;
  
  // Calculate how much MAANG user will receive
  const calculateMAANGAmount = () => {
    if (!usdcAmount || isNaN(parseFloat(usdcAmount))) return '0.00';
    const usdc = parseFloat(usdcAmount);
    const maangAmount = (usdc * usdcPrice) / maangPrice;
    return maangAmount.toFixed(4);
  };
  
  const maangAmount = calculateMAANGAmount();
  const totalCost = parseFloat(usdcAmount || '0');
  const estimatedFee = totalCost * 0.003; // 0.3% fee
  const totalWithFee = totalCost + estimatedFee;
  
  const handleBuyClick = () => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmBuy = async () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    
    try {
      // Simulate buy transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully bought ${maangAmount} MAANG!`);
      
      // Mark as traded and show share card if first trade
      if (isFirstTrade) {
        localStorage.setItem('hasCompletedTrade', 'true');
        setTimeout(() => {
          setIsProcessing(false);
          setShowShareCard(true);
        }, 500);
      } else {
        // Navigate to transaction complete
        setTimeout(() => {
          navigate('/transaction-complete');
        }, 1000);
      }
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Purchase failed. Please try again.');
      setIsProcessing(false);
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
              <img src={maangLogo} alt="MAANG" className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            Buy MAANG
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Purchase MAANG tokens with your mUSDC balance
          </p>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1">MAANG Price</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                ${maangPrice.toFixed(2)}
              </div>
              <div className="text-xs text-data-positive flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12.5% (24h)
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1">Your Balance</div>
              <div className="text-xl sm:text-2xl font-bold font-mono">
                {account ? '1,250.00' : '0.00'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                mUSDC available
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase MAANG
            </CardTitle>
            <CardDescription>
              Enter the amount of mUSDC you want to spend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Input Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">You Pay</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
                    className="pr-20 text-base sm:text-lg font-mono h-12 sm:h-auto"
                    disabled={!account}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    mUSDC
                  </div>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex justify-center py-1">
                <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Output Section */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">You Receive</Label>
                <div className="relative">
                  <div className="w-full px-4 py-3 sm:py-3.5 border border-border rounded-lg bg-muted text-base sm:text-lg font-mono min-h-[48px] flex items-center">
                    {maangAmount}
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    MAANG
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {usdcAmount && parseFloat(usdcAmount) > 0 && (
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per MAANG</span>
                  <span className="font-mono">${maangPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trading Fee (0.3%)</span>
                  <span className="font-mono">${estimatedFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Cost</span>
                    <span className="font-mono font-bold">${totalWithFee.toFixed(2)} mUSDC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buy Button */}
            <Button
              onClick={handleBuyClick}
              disabled={!account || !usdcAmount || parseFloat(usdcAmount) <= 0 || isProcessing}
              className="w-full h-12 sm:h-11 text-base"
              variant="positive"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !account ? (
                'Connect Wallet to Buy'
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy MAANG
                </>
              )}
            </Button>

            {!account && (
              <div className="text-center text-sm text-muted-foreground">
                Connect your wallet to start buying MAANG tokens
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why buy MAANG?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <strong className="text-foreground">AI-Powered Growth:</strong> MAANG leverages cutting-edge AI and analytics technology
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <strong className="text-foreground">High Liquidity:</strong> Trade instantly with deep liquidity pools on ETO
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <strong className="text-foreground">Staking Rewards:</strong> Earn up to 24.8% APY by staking MAANG tokens
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
              Confirm Purchase
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p>You are about to purchase:</p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You pay:</span>
                  <span className="font-mono font-semibold">{usdcAmount} mUSDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You receive:</span>
                  <span className="font-mono font-semibold">{maangAmount} MAANG</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Price per MAANG:</span>
                  <span className="font-mono">${maangPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Fee:</span>
                  <span className="font-mono">${estimatedFee.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm">Are you sure you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBuy} className="bg-data-positive hover:bg-data-positive/90">
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Card for First Trade */}
      <ShareTradeCard
        isOpen={showShareCard}
        onClose={handleCloseShare}
        fromAsset="mUSDC"
        toAsset="MAANG"
        amount={maangAmount}
      />
    </div>
  );
}
