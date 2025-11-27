import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Droplets, ExternalLink } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USDC_ADDRESS } from '@/config/contracts';
import { etoPublicClient } from '@/lib/etoRpc';
import { encodeFunctionData, parseGwei } from 'viem';

const ETO_CHAIN_ID_HEX = '0x10F2C'; // 69420

const mockUSDCABI = [
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
] as const;

const ETO_CHAIN_PARAMS = {
  chainId: ETO_CHAIN_ID_HEX,
  chainName: 'ETO L1 Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://eto.ash.center/rpc'],
  blockExplorerUrls: ['https://eto-explorer.ash.center'],
};

export function USDCFaucet() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error("No wallet detected");
      return;
    }

    setIsLoading(true);
    setTxHash(null);

    try {
      // 1. Switch/add chain
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ETO_CHAIN_ID_HEX }],
        });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ETO_CHAIN_PARAMS],
          });
        }
      }

      // 2. Encode the faucet() call
      const data = encodeFunctionData({
        abi: mockUSDCABI,
        functionName: 'faucet',
      });

      // 3. Get correct nonce from our RPC (wallet cache may be stale)
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
      });

      // 4. Estimate gas via our direct RPC
      let gasEstimate: bigint;
      try {
        gasEstimate = await etoPublicClient.estimateGas({
          account: account.address as `0x${string}`,
          to: USDC_ADDRESS as `0x${string}`,
          data,
        });
      } catch {
        gasEstimate = 100000n; // Fallback
      }

      toast.info("Confirm the transaction in your wallet...");

      // 5. Send via eth_sendTransaction with explicit nonce
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: USDC_ADDRESS,
          data: data,
          gas: `0x${(gasEstimate * 15n / 10n).toString(16)}`, // 1.5x buffer
          gasPrice: `0x${parseGwei('1.5').toString(16)}`,
          nonce: `0x${nonce.toString(16)}`, // Explicit nonce from our RPC
        }],
      });

      if (!hash || typeof hash !== 'string') {
        throw new Error("Wallet didn't return a transaction hash");
      }

      setTxHash(hash);
      toast.success("Transaction sent! Waiting for confirmation...");

      // 5. Wait for receipt via direct RPC
      const receipt = await etoPublicClient.waitForTransactionReceipt({ 
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      if (receipt.status === 'success') {
        toast.success("Successfully claimed 10,000 mUSDC!");
        queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      } else {
        toast.error("Transaction failed on-chain");
      }
    } catch (error: any) {
      console.error("Faucet error:", error);
      
      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error("Transaction rejected");
      } else {
        toast.error(error.shortMessage || error.message || "Transaction failed");
      }
    } finally {
      setIsLoading(false);
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
          disabled={isLoading || !account}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Droplets className="mr-2 h-4 w-4" />
              Claim 10,000 mUSDC
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
          <p>• Make sure wallet is on <strong>ETO L1 (69420)</strong></p>
          <p>• If stuck, manually add network in wallet settings</p>
        </div>
      </CardContent>
    </Card>
  );
}
