
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletConnector } from '@/components/WalletConnector';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold font-mono uppercase tracking-wider">
            ETO Trading
          </h1>
          <p className="text-muted-foreground font-mono text-lg">
            Cross-chain trading platform
          </p>
        </div>

        {/* Wallet Connection */}
        <WalletConnector />

        {/* Info Section */}
        <div className="text-center space-y-4">
          <p className="text-base text-muted-foreground">
            Connect your wallet to access the ETO Trading platform
          </p>
          <p className="text-xs text-muted-foreground">
            This is a demo interface. No actual wallet connection is made.
          </p>
        </div>
      </div>
    </div>
  );
}
