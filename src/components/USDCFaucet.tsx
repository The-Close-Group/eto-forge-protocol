import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Droplets } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { client, etoTestnet } from '@/lib/thirdweb';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// MockUSDC contract deployed on ETO Testnet
const MOCK_USDC_ADDRESS = "0xBDd8A29859C96EB305A012C2ae286782B063238c";

const mockUSDCABI = [
  {
    "inputs": [],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mintWithPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getCooldownRemaining",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FAUCET_AMOUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function USDCFaucet() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const contract = getContract({
        client,
        chain: etoTestnet,
        address: MOCK_USDC_ADDRESS,
        abi: mockUSDCABI
      });

      const transaction = prepareContractCall({
        contract,
        method: "faucet",
        params: []
      });

      const result = await sendTransaction({
        transaction,
        account
      });

      toast.success("Successfully claimed 1000 mUSDC from faucet!");
      console.log("Faucet transaction:", result);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
    } catch (error: any) {
      console.error("Faucet error:", error);
      if (error.message?.includes("Cooldown")) {
        toast.error("Please wait 1 hour between faucet claims");
      } else {
        toast.error("Failed to claim from faucet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintWithPermission = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsMinting(true);
    try {
      const contract = getContract({
        client,
        chain: etoTestnet,
        address: MOCK_USDC_ADDRESS,
        abi: mockUSDCABI
      });

      // Mint 5000 mUSDC
      const amount = 5000n * 10n ** 6n; // 5000 USDC with 6 decimals

      const transaction = prepareContractCall({
        contract,
        method: "mintWithPermission",
        params: [account.address, amount]
      });

      const result = await sendTransaction({
        transaction,
        account
      });

      toast.success("Successfully minted 5000 mUSDC!");
      console.log("Mint transaction:", result);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
    } catch (error: any) {
      console.error("Mint error:", error);
      toast.error("Failed to mint mUSDC");
    } finally {
      setIsMinting(false);
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
          Get free Mock USDC tokens on ETO Testnet for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={handleFaucet}
            disabled={isLoading || !account}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim 1000 mUSDC (1hr cooldown)"
            )}
          </Button>
          
          <Button
            onClick={handleMintWithPermission}
            disabled={isMinting || !account}
            variant="outline"
            className="w-full"
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint 5000 mUSDC (with permission)"
            )}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>• Faucet: 1000 mUSDC every hour</p>
          <p>• Mint: Up to 10,000 mUSDC per transaction</p>
          <p>• Network: ETO Testnet</p>
        </div>
      </CardContent>
    </Card>
  );
}
