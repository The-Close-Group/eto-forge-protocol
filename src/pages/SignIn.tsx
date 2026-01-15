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
        // First try to add the chain (in case it's not configured)
        const provider = await wallet.getProvider?.();
        if (provider?.request) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [etoMainnetParams],
            });
          } catch (addError: any) {
            // Chain might already exist - that's fine
            console.log('Chain add result:', addError?.code === 4001 ? 'rejected' : 'exists');
          }
        }

        // Now switch to the chain
        await switchChain(etoMainnet);
        toast.success('Connected to ETO L1');
      } catch (switchError) {
        console.error('Failed to switch chain:', switchError);
        toast.error('Please switch to ETO L1 in your wallet');
      }

      // Navigate based on user status
      const isNewUser = !localStorage.getItem('eto-user-onboarded');
      const from = (location.state as any)?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
      } else if (isNewUser) {
        navigate('/faucet');
      } else {
        navigate('/dashboard');
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
