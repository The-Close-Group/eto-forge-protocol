import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WalletConnector } from '@/components/WalletConnector';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';

import layerZeroLogo from '@/assets/layerzero-logo.png';
import avalancheLogo from '@/assets/avalanche-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';
import solanaLogo from '@/assets/solana-logo.png';

const sponsors = [
  { name: 'Avalanche', logo: avalancheLogo },
  { name: 'LayerZero', logo: layerZeroLogo },
  { name: 'Solana', logo: solanaLogo },
  { name: 'USDC', logo: usdcLogo },
];

export default function SignUp() {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold font-mono uppercase tracking-wider">
            ETO Trading
          </h1>
          <p className="text-muted-foreground font-mono text-lg">
            Join the cross-chain trading platform
          </p>
        </div>

        {/* Wallet Connection */}
        <WalletConnector />

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
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
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
            Already have an account?{' '}
            <Link to="/signin" className="text-primary hover:underline font-mono">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}