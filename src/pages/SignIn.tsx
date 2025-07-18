
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

        {/* Sign In Form */}
        {!isAuthenticated ? (
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-medium text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="industrial-input h-12"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="industrial-input h-12"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-sm">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full industrial-button h-12 text-base" 
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
            <div className="text-center space-y-6">
              <p className="text-base text-muted-foreground">
                {walletAddress ? 'Ready to start trading!' : 'Connect your wallet to access all features.'}
              </p>
              <Button 
                onClick={handleContinue}
                className="w-full industrial-button h-12 text-base"
                size="lg"
              >
                Continue to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
