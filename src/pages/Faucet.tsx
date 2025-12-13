import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Fuel, Loader2, CheckCircle2, AlertCircle, ExternalLink, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

// AWS Lambda faucet endpoint
const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API_URL || '';

interface FaucetResponse {
  success?: boolean;
  error?: string;
  ethTxHash?: string;
  usdcTxHash?: string;
  ethAmount?: string;
  usdcAmount?: string;
  message?: string;
  timeRemaining?: number;
}

export default function Faucet() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [usdcTxHash, setUsdcTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [cooldownHours, setCooldownHours] = useState<number | null>(null);

  const handleClaimFaucet = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!FAUCET_API_URL) {
      toast.error("Faucet not configured");
      return;
    }

    setTxHash(null);
    setUsdcTxHash(null);
    setIsSuccess(false);
    setIsPending(true);
    setCooldownHours(null);

    try {
      toast.info("Requesting funds from faucet...");

      const response = await fetch(FAUCET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account.address }),
      });

      const data: FaucetResponse = await response.json();

      if (data.error) {
        if (data.timeRemaining) {
          const hours = Math.ceil(data.timeRemaining / 3600);
          setCooldownHours(hours);
          toast.error(`On cooldown. Try again in ${hours} hours.`);
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data.success) {
        setTxHash(data.ethTxHash || null);
        setUsdcTxHash(data.usdcTxHash || null);
        setIsSuccess(true);
        const usdcMsg = data.usdcAmount ? ` + ${data.usdcAmount} mUSDC` : '';
        toast.success(`Sent ${data.ethAmount || '0.1'} ETH${usdcMsg}!`);
        
        // Mark as onboarded and redirect to dashboard after 2 seconds
        localStorage.setItem('eto-user-onboarded', 'true');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error("Faucet error:", error);
      toast.error(error.message || "Failed to claim funds");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pb-24 md:pb-6">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Get Started</h1>
          <p className="text-muted-foreground">
            Claim free funds to start trading on ETO L1
          </p>
        </div>

        {/* Single Unified Faucet Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Fuel className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Starter Faucet</CardTitle>
            <CardDescription>
              Get ETH for gas + mUSDC for trading - no existing balance required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cooldownHours && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>You can claim again in {cooldownHours} hours</span>
              </div>
            )}

            <Button
              onClick={handleClaimFaucet}
              disabled={isPending || !account || !!cooldownHours}
              className="w-full"
              size="lg"
              variant={isSuccess ? "outline" : "default"}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending funds...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Success! Redirecting...
                </>
              ) : cooldownHours ? (
                <>
                  <Fuel className="mr-2 h-4 w-4" />
                  Cooldown: {cooldownHours}h remaining
                </>
              ) : (
                <>
                  <Fuel className="mr-2 h-4 w-4" />
                  Claim 0.1 ETH + 1,000 mUSDC
                </>
              )}
            </Button>
              
            {(txHash || usdcTxHash) && (
              <div className="flex justify-center gap-4 text-sm">
                {txHash && (
                  <a 
                    href={`https://eto-explorer.ash.center/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    ETH tx <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {usdcTxHash && (
                  <a 
                    href={`https://eto-explorer.ash.center/tx/${usdcTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    USDC tx <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs">1</span>
            <span>Click the button above to claim funds</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs">2</span>
            <span>ETH + mUSDC will be sent directly to your wallet</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs">3</span>
            <span>Start trading MAANG tokens on the dashboard</span>
          </div>
        </div>

        {/* Skip button for returning users */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {/* Features - Monochrome icons */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
          <div className="text-center space-y-1">
            <Zap className="h-4 w-4 mx-auto text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Instant</div>
          </div>
          <div className="text-center space-y-1">
            <Shield className="h-4 w-4 mx-auto text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Secure</div>
          </div>
          <div className="text-center space-y-1">
            <Fuel className="h-4 w-4 mx-auto text-muted-foreground" />
            <div className="text-xs text-muted-foreground">No Gas</div>
          </div>
          <div className="text-center space-y-1">
            <Globe className="h-4 w-4 mx-auto text-muted-foreground" />
            <div className="text-xs text-muted-foreground">ETO L1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
