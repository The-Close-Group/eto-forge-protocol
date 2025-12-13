import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Fuel, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function GasFaucet() {
  const account = useActiveAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [cooldownHours, setCooldownHours] = useState<number | null>(null);

  const handleClaimGas = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setTxHash(null);
    setIsSuccess(false);
    setIsPending(true);
    setCooldownHours(null);

    try {
      toast.info("Requesting gas from faucet...");

      const { data, error } = await supabase.functions.invoke('gas-faucet', {
        body: { address: account.address },
      });

      if (error) {
        throw new Error(error.message || 'Failed to claim gas');
      }

      if (data.error) {
        if (data.cooldownRemaining) {
          setCooldownHours(data.cooldownRemaining);
          toast.error(data.error);
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data.success) {
        setTxHash(data.txHash);
        setIsSuccess(true);
        toast.success(data.message || "Successfully claimed gas!");
      }
    } catch (error: any) {
      console.error("Gas faucet error:", error);
      toast.error(error.message || "Failed to claim gas");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-yellow-500" />
          Gas Faucet
        </CardTitle>
        <CardDescription>
          Get free ETH for gas on ETO L1 - no existing balance required!
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
              Sending gas...
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
              Claim 0.01 ETH for Gas
            </>
          )}
        </Button>
          
        {txHash && (
          <div className="text-sm text-center">
            <a 
              href={`https://eto.ash.center/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:underline inline-flex items-center gap-1"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-yellow-500/10">
          <p>• <strong>No gas needed</strong> to claim - it's sent to you!</p>
          <p>• 0.01 ETH is enough for ~100+ transactions</p>
          <p>• 24-hour cooldown between claims</p>
        </div>
      </CardContent>
    </Card>
  );
}

