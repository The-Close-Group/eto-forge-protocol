import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, etoMainnet, supportedChains, etoMainnetParams } from '@/lib/thirdweb';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useSwitchActiveWalletChain } from "thirdweb/react";
import { toast } from 'sonner';
import { useActiveWallet } from 'thirdweb/react';
import { useActiveWalletChain } from 'thirdweb/react';
import { Button } from '@/components/ui/button';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export default function SignIn() {
  const navigate = useNavigate();

  const switchChain = useSwitchActiveWalletChain();
  const activeWallet = useActiveWallet();
  const currentChain = useActiveWalletChain();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ConnectButton
        autoConnect={false}
        client={client}
        chain={etoMainnet}
        chains={supportedChains}
        connectModal={{ size: "wide" }}
        wallets={wallets}
        onConnect={async (wallet) => {
          console.log('Wallet connected:', wallet);
          const address = wallet.getAccount()?.address;
          if (address) {
            // ALWAYS try to add/update chain first to fix any wrong config
            try {
              // Force add the correct chain config (this will update if exists)
              if (activeWallet && typeof (activeWallet as any).request === "function") {
                  await (activeWallet as any).request({
                    method: 'wallet_addEthereumChain',
                  params: [etoMainnetParams],
                });
                console.log('ETO L1 chain config updated');
              }
                } catch (addError: any) {
              // Ignore if already added - that's fine
              console.log('Chain add result:', addError?.message || 'success');
                  }

            // Now switch to the chain
              try {
              await switchChain(etoMainnet);
              toast.success('Connected to ETO L1');
            } catch (error) {
              console.error('Failed to switch chain:', error);
              toast.error('Please switch to ETO L1 manually in your wallet');
            }

            // Determine if new user
            const isNewUser = !localStorage.getItem('eto-user-onboarded');
            if (isNewUser) {
              navigate('/faucet');
            } else {
              navigate('/dashboard');
            }
          }
        }}
      />
    </div>
  );
}
