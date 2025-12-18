import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Fuel, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
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

export function GasFaucet() {
  const account = useActiveAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [usdcTxHash, setUsdcTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [cooldownHours, setCooldownHours] = useState<number | null>(null);

  const handleClaimGas = async () => {
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
      toast.info("⛽ Requesting funds from faucet...");

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
        toast.success(`🎉 Sent ${data.ethAmount || '0.1'} ETH${usdcMsg}!`);
      }
    } catch (error: any) {
      console.error("Gas faucet error:", error);
      toast.error(error.message || "Failed to claim funds");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-yellow-500" />
          Starter Faucet
        </CardTitle>
        <CardDescription>
          Get free ETH + mUSDC on ETO L1 - no existing balance required!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cooldownHours && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span>You can claim again in {cooldownHours} hours</span>
          </div>
        )}

        <Button
          onClick={handleClaimGas}
          disabled={isPending || !account || !!cooldownHours}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium"
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
              Claimed! Click to claim more
            </>
          ) : cooldownHours ? (
            <>
              <Fuel className="mr-2 h-4 w-4" />
              Cooldown: {cooldownHours}h remaining
            </>
          ) : (
            <>
              <Fuel className="mr-2 h-4 w-4" />
              Claim 0.1 ETH + 1000 mUSDC
            </>
          )}
        </Button>
          
        {(txHash || usdcTxHash) && (
          <div className="text-sm text-center space-y-1">
            {txHash && (
              <a 
                href={`https://eto-explorer.ash.center/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500 hover:underline inline-flex items-center gap-1"
              >
                ETH Transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {usdcTxHash && (
              <a 
                href={`https://eto-explorer.ash.center/tx/${usdcTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1 ml-3"
              >
                USDC Transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-yellow-500/10">
          <p>• <strong>No gas needed</strong> to claim - it's sent to you!</p>
          <p>• Get 0.1 ETH for gas + 1000 mUSDC for trading</p>
          <p>• 24-hour cooldown between claims</p>
        </div>
      </CardContent>
    </Card>
  );
}

