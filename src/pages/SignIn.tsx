
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WalletConnector } from '@/components/WalletConnector';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const { walletAddress } = useWallet();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await signIn(email, password);
    
    if (success) {
      // Don't redirect immediately - let user connect wallet first
    } else {
      setError('Invalid email or password. Please ensure password is at least 6 characters.');
    }
    
    setIsLoading(false);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-mono uppercase tracking-wider">
            ETO Trading
          </h1>
          <p className="text-muted-foreground font-mono">
            Cross-chain trading platform
          </p>
        </div>

        {/* Sign In Form */}
        {!isAuthenticated ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="industrial-input"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="industrial-input"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full industrial-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Wallet Connection */}
            <WalletConnector />

            {/* Continue Button */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {walletAddress ? 'Ready to start trading!' : 'Connect your wallet to access all features.'}
              </p>
              <Button 
                onClick={handleContinue}
                className="w-full industrial-button"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
