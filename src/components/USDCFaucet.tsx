import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Droplets, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, getContract } from 'thirdweb';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USDC_ADDRESS } from '@/config/contracts';
import { client, etoMainnet } from '@/lib/thirdweb';

// Faucet ABI - the contract has a faucet() function that mints 1000 USDC
const FAUCET_ABI = [
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Get contract instance using thirdweb with explicit ABI
const mockUsdcContract = getContract({
  client,
  chain: etoMainnet,
  address: USDC_ADDRESS,
  abi: FAUCET_ABI,
});

export function USDCFaucet() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use thirdweb's sendTransaction hook
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    setTxHash(null);
    setIsSuccess(false);

    try {
      // Prepare the faucet call with explicit ABI
      const transaction = prepareContractCall({
        contract: mockUsdcContract,
        method: "faucet",
        params: [],
      });

      toast.info("Confirm the transaction in your wallet...");

      // Send transaction
      sendTransaction(transaction, {
        onSuccess: (result) => {
          setTxHash(result.transactionHash);
          setIsSuccess(true);
          toast.success("Successfully claimed 1,000 mUSDC!");
          queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
        },
        onError: (error: any) => {
          console.error("Faucet error:", error);
          if (error.message?.includes('rejected') || error.message?.includes('denied')) {
            toast.error("Transaction rejected");
          } else {
            toast.error(error.shortMessage || error.message || "Transaction failed");
          }
        },
      });
    } catch (error: any) {
      console.error("Faucet preparation error:", error);
      toast.error(error.message || "Failed to prepare transaction");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          mUSDC Faucet
        </CardTitle>
        <CardDescription>
          Get free Mock USDC tokens on ETO L1 for paper trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleFaucet}
          disabled={isPending || !account}
          className="w-full"
          size="lg"
          variant={isSuccess ? "outline" : "default"}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Claimed! Click to claim more
            </>
          ) : (
            <>
              <Droplets className="mr-2 h-4 w-4" />
              Claim 1,000 mUSDC
            </>
          )}
        </Button>
          
        {txHash && (
          <div className="text-sm text-center">
            <a 
              href={`https://eto-explorer.ash.center/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Wallet will auto-switch to <strong>ETO L1 (69420)</strong></p>
          <p>• Gas fees are sponsored - completely free!</p>
        </div>
      </CardContent>
    </Card>
  );
}
