import { USDCFaucet } from '@/components/USDCFaucet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export default function Faucet() {
  const navigate = useNavigate();
  const [sideNote, setSideNote] = useState<string>('');

  useEffect(() => {
    const fetchSideNote = async () => {
      try {
        const { data } = await supabase.functions.invoke('generate-side-note');
        if (data?.sideNote) {
          setSideNote(data.sideNote);
        }
      } catch (error) {
        console.error('Error fetching side note:', error);
      }
    };
    fetchSideNote();
  }, []);

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
          
          <h1 className="text-display-lg md:text-display-xl font-display leading-tight">
            <span className="text-muted-foreground/60">"</span>Stop losses are for bag holders, secure your money with ETO and grow it<span className="text-muted-foreground/60">"</span>
          </h1>
          
          {sideNote && (
            <div className="inline-block mt-4 px-4 py-3 bg-muted/50 border border-border rounded-lg backdrop-blur-sm">
              <p className="text-sm text-muted-foreground italic max-w-2xl">
                {sideNote}
              </p>
            </div>
          )}
          
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
