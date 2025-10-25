import { USDCFaucet } from '@/components/USDCFaucet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Faucet() {
  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem('eto-user-onboarded', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pb-24 md:pb-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-mono text-muted-foreground">TESTNET FAUCET</span>
          </div>
          
          <h1 className="text-display-lg md:text-display-xl font-display">
            ETO : Because Stop losses are for losers - Sam bankman fried
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Claim <span className="font-mono font-medium text-foreground">free mUSDC</span> tokens for testing on{" "}
            <span className="font-medium text-foreground">ETO Testnet</span>. Start trading in{" "}
            <span className="font-mono font-medium text-primary">30 seconds</span>.
          </p>
        </div>
        
        {/* Faucet Component */}
        <div className="backdrop-blur-sm">
          <USDCFaucet />
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleContinue}
            className="px-8 py-6 text-base font-medium"
            size="lg"
          >
            Continue to Dashboard →
          </Button>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-center">
          <div className="space-y-1">
            <div className="text-sm font-mono text-muted-foreground">✓ No Gas Fees</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-muted-foreground">⚡ Instant Swaps</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-muted-foreground">🔒 100% Secure</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-muted-foreground">🌐 Multi-Chain</div>
          </div>
        </div>
      </div>
    </div>
  );
}
