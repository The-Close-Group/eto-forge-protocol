import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

import layerZeroLogo from '@/assets/layerzero-logo.png';
import avalancheLogo from '@/assets/avalanche-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';

const sponsors = [
  { name: 'Avalanche', logo: avalancheLogo },
  { name: 'LayerZero', logo: layerZeroLogo },
  { name: 'USDC', logo: usdcLogo },
];

export default function SignUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const account = useActiveAccount();

  // Redirect to dashboard when wallet is connected
  useEffect(() => {
    if (isAuthenticated && account?.address) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, account?.address, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">
            ETO Trading
          </h1>
          <p className="text-muted-foreground text-lg">
            Join the cross-chain trading platform
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center">
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={etoMainnet}
            chains={supportedChains}
            connectModal={{ size: "wide" }}
            onConnect={async (wallet) => {
              console.log('Wallet connected:', wallet);
              const address = wallet.getAccount()?.address;
              if (address) {
                toast.success('Wallet connected successfully!');
                navigate('/dashboard');
              }
            }}
          />
        </div>

        {/* Info Section */}
        <div className="text-center space-y-4">
          <p className="text-base text-muted-foreground">
            Create your account by connecting your wallet to access the ETO Trading platform
          </p>
          <p className="text-xs text-muted-foreground">
            This is a demo interface with simulated wallet connections for development purposes.
          </p>
        </div>

        {/* Sponsors Section */}
        <Card className="p-6 bg-card border border-border">
          <div className="text-center space-y-4">
            <h3 className="text-sm text-muted-foreground">
              Backed By
            </h3>
            <div className="flex justify-center items-center gap-6">
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className="flex flex-col items-center space-y-2">
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-8 h-8 object-contain" />
                  <span className="text-xs font-normal text-soft-muted">
                    {sponsor.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to get started
          </p>
        </div>
      </div>
    </div>
  );
}