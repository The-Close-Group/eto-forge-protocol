import { useEffect } from 'react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, etoMainnet, supportedChains, etoMainnetParams } from '@/lib/thirdweb';
import { useNavigate, useLocation } from "react-router-dom";
import { useSwitchActiveWalletChain } from "thirdweb/react";
import { toast } from 'sonner';
import metamaskLogo from '@/assets/metamask-logo.svg';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useActiveAccount();
  const switchChain = useSwitchActiveWalletChain();

  // If already connected, redirect
  useEffect(() => {
    if (account?.address) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [account, navigate, location.state]);

  const handleConnect = async (wallet: any) => {
    console.log('Wallet connected:', wallet);
    const address = wallet.getAccount()?.address;

    if (address) {
      // Try to add/switch to ETO L1 chain
      try {
        const provider = await wallet.getProvider?.();

        if (!provider?.request) {
          toast.error('Wallet provider not available');
          return;
        }

        // First, try to switch to the chain
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: etoMainnetParams.chainId }],
          });

          toast.success('Connected to ETO L1');
        } catch (switchError: any) {
          // Error 4902 means the chain hasn't been added yet
          if (switchError.code === 4902) {
            // Chain not found - try to add it
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [etoMainnetParams],
              });

              // Successfully added, now switch to it
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: etoMainnetParams.chainId }],
              });

              toast.success('ETO L1 network added and connected');
            } catch (addError: any) {
              // Handle specific add errors
              if (addError.code === 4001) {
                toast.error('You rejected the network addition request');
                return;
              } else if (addError.message?.includes('same RPC endpoint') ||
                         addError.message?.includes('Condrieu') ||
                         addError.code === -32002) {
                toast.error(
                  'RPC conflict detected. Please remove the Condrieu network from your wallet and try again.',
                  { duration: 6000 }
                );
                return;
              } else {
                console.error('Failed to add chain:', addError);
                toast.error('Failed to add ETO L1 network. Please add it manually.');
                return;
              }
            }
          } else if (switchError.code === 4001) {
            toast.error('You rejected the network switch request');
            return;
          } else {
            console.error('Failed to switch chain:', switchError);
            toast.error('Failed to switch to ETO L1 network');
            return;
          }
        }

        // Only navigate if chain switch was successful
        const isNewUser = !localStorage.getItem('eto-user-onboarded');
        const from = (location.state as any)?.from?.pathname;

        if (from) {
          navigate(from, { replace: true });
        } else if (isNewUser) {
          navigate('/faucet');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-muted-foreground">Connect your wallet to access the ETO Protocol</p>
      </div>

      <ConnectButton
        autoConnect={true}
        client={client}
        chain={etoMainnet}
        chains={supportedChains}
        connectModal={{ size: "wide" }}
        wallets={wallets}
        onConnect={handleConnect}
      />

      <p className="text-xs text-muted-foreground mt-6 max-w-sm text-center">
        By connecting, you agree to our Terms of Service and acknowledge that you have read our Privacy Policy.
      </p>
    </div>
  );
}
