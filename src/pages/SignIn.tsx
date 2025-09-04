import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, etoTestnet } from '@/lib/thirdweb';
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
        chain={etoTestnet}
        connectModal={{ size: "wide" }}
        wallets={wallets}
        onConnect={async (wallet) => {
          console.log('Wallet connected:', wallet);
          const address = wallet.getAccount()?.address;
          if (address) {
            // Switch to ETO testnet
            try {
              await switchChain(etoTestnet);
              toast.success('Switched to ETO Testnet');
            } catch (error) {
              console.error('Failed to switch chain:', error);
              toast.error('Failed to switch - trying to add chain...');

              if (activeWallet && typeof (activeWallet as any).request === "function") {
                try {
                  await (activeWallet as any).request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: `0x${etoTestnet.id.toString(16)}`,
                      chainName: etoTestnet.name,
                      nativeCurrency: etoTestnet.nativeCurrency,
                      rpcUrls: [etoTestnet.rpc],
                      blockExplorerUrls: [etoTestnet.blockExplorers[0].url],
                    }],
                  });
                  toast.success('ETO Testnet added to wallet');

                  // Retry switch after adding
                  await switchChain(etoTestnet);
                  toast.success('Switched to ETO Testnet');
                } catch (addError: any) {
                  console.error('Failed to add chain:', addError);
                  if (addError.code === 4001) {
                    toast.error('User rejected chain addition');
                  } else if (addError.message?.includes('already added')) {
                    toast.info('Chain already added - please switch manually in MetaMask');
                  } else {
                    toast.error('Failed to add ETO Testnet. Add manually in MetaMask settings.');
                  }
                }
              } else {
                toast.error('Wallet does not support chain addition');
              }
            }
            
            // Final check and retry
            if (currentChain?.id !== etoTestnet.id) {
              try {
                await switchChain(etoTestnet);
              } catch (retryError) {
                const chainParams = {
                  chainId: `0x${etoTestnet.id.toString(16)}`,
                  chainName: etoTestnet.name,
                  nativeCurrency: etoTestnet.nativeCurrency,
                  rpcUrls: [etoTestnet.rpc],
                  blockExplorerUrls: [etoTestnet.blockExplorers[0].url],
                };

                toast.error(
                  <div>
                    <p>Please add ETO Testnet manually in MetaMask:</p>
                    <pre className="text-xs bg-muted p-2 rounded my-2 overflow-auto">
                      {JSON.stringify(chainParams, null, 2)}
                    </pre>
                    <Button 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(chainParams));
                        toast.success('Params copied! Paste into MetaMask > Settings > Networks > Add Network');
                      }}
                    >
                      Copy Params
                    </Button>
                  </div>,
                  { duration: 30000 }
                );
              }
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
