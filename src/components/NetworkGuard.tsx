import { useEffect, useState } from 'react';
import { useActiveWallet, useActiveWalletChain } from 'thirdweb/react';
import { etoMainnet, etoMainnetParams } from '@/lib/thirdweb';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface NetworkGuardProps {
  children: React.ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const wallet = useActiveWallet();
  const chain = useActiveWalletChain();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // Check if connected and on correct chain
    if (wallet && chain) {
      const correct = chain.id === etoMainnet.id;
      setIsCorrectNetwork(correct);

      if (!correct) {
        toast.error(
          `Wrong network detected. You're on chain ${chain.id}. Please switch to ETO L1 (chain ${etoMainnet.id})`,
          { duration: 5000 }
        );
      }
    } else if (wallet && !chain) {
      // Wallet connected but no chain detected
      setIsCorrectNetwork(false);
    }
  }, [wallet, chain]);

  const handleSwitchNetwork = async () => {
    if (!wallet) return;

    setIsSwitching(true);
    try {
      const provider = await wallet.getProvider?.();

      if (!provider?.request) {
        toast.error('Wallet provider not available');
        return;
      }

      // Try to switch
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: etoMainnetParams.chainId }],
        });

        setIsCorrectNetwork(true);
        toast.success('Switched to ETO L1');
      } catch (switchError: any) {
        // Error 4902 means chain not added
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [etoMainnetParams],
            });

            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: etoMainnetParams.chainId }],
            });

            setIsCorrectNetwork(true);
            toast.success('ETO L1 network added and connected');
          } catch (addError: any) {
            if (addError.code === 4001) {
              toast.error('You rejected the network addition');
            } else if (addError.message?.includes('same RPC endpoint') ||
                       addError.message?.includes('Condrieu')) {
              toast.error(
                'RPC conflict: Please remove the Condrieu network (chain 69420) from your wallet first',
                { duration: 7000 }
              );
            } else {
              toast.error('Failed to add ETO L1 network');
            }
          }
        } else if (switchError.code === 4001) {
          toast.error('You rejected the network switch');
        } else {
          toast.error('Failed to switch network');
        }
      }
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('An error occurred while switching networks');
    } finally {
      setIsSwitching(false);
    }
  };

  // If not on correct network, show blocking UI
  if (wallet && !isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Wrong Network</h2>
          <p className="text-muted-foreground">
            You're currently on {chain?.name || 'an unsupported network'} (chain ID: {chain?.id || 'unknown'}).
            <br />
            <br />
            ETO Protocol only works on ETO L1 (chain ID: {etoMainnet.id}).
          </p>
          <Button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            size="lg"
            className="w-full"
          >
            {isSwitching ? 'Switching...' : 'Switch to ETO L1'}
          </Button>
          <p className="text-xs text-muted-foreground">
            If you see an error about RPC conflicts with Condrieu, please remove the Condrieu network from your wallet settings first.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
