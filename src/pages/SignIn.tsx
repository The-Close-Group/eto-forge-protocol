
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WalletConnector } from '@/components/WalletConnector';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';
import SEO from '@/components/SEO';

import layerZeroLogo from '@/assets/layerzero-logo.png';
import avalancheLogo from '@/assets/avalanche-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';

const sponsors = [
  { name: 'Avalanche', logo: avalancheLogo },
  { name: 'LayerZero', logo: layerZeroLogo },
  { name: 'USDC', logo: usdcLogo },
];

export default function SignIn() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { walletAddress } = useWallet();

  // Redirect to dashboard when wallet is connected
  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, walletAddress, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <SEO
        title="Sign In – ETO Trading"
        description="Connect your wallet to access ETO Trading. Secure, fast, and multi‑chain ready."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <div className="w-full max-w-5xl px-6 py-10 animate-enter">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            ETO Trading
          </h1>
          <p className="text-muted-foreground text-lg">
            Seamless cross‑chain trading with LayerZero and Dynamic Market Making
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Wallet Connection */}
          <div className="border border-border/60 rounded-xl bg-card/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold mb-4">Connect your wallet</h2>
            <WalletConnector />
          </div>

          {/* Info Section */}
          <div className="border border-border/60 rounded-xl bg-card/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-sm font-medium text-soft-muted mb-3">Quick tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use MetaMask or WalletConnect to get started quickly</li>
              <li>• Your funds remain in your wallet; ETO executes on-chain</li>
              <li>• This is a pre‑launch environment – metrics are zeroed</li>
            </ul>
            <div className="mt-5 text-xs text-soft-muted">Press ⌘K / Ctrl+K to quickly navigate</div>
          </div>
        </div>

        {/* Sponsors Section */}
        <Card className="p-6 bg-card/90 border border-border mt-6">
          <div className="text-center space-y-4">
            <h3 className="text-sm text-soft-muted">Backed By</h3>
            <div className="flex justify-center items-center gap-6">
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className="flex flex-col items-center space-y-2">
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-8 h-8 object-contain" />
                  <span className="text-xs font-normal text-soft-muted">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
