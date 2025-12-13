import { USDCFaucet } from '@/components/USDCFaucet';
import { GasFaucet } from '@/components/GasFaucet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

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
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Get Started with ETO
          </div>
          <h1 className="text-3xl font-bold">Faucets</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Claim free gas and tokens to start trading on ETO L1. 
            No existing balance required!
          </p>
        </div>

        {/* Faucet Components - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gas Faucet - First */}
          <div className="backdrop-blur-sm">
            <GasFaucet />
          </div>
          
          {/* USDC Faucet */}
          <div className="backdrop-blur-sm">
            <USDCFaucet />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">?</span>
            How it works
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-xs font-medium shrink-0">1</span>
              <span><strong>Claim Gas first</strong> - Get 0.01 ETH sent directly to your wallet (no gas needed!)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-medium shrink-0">2</span>
              <span><strong>Claim mUSDC</strong> - Use your gas to mint 1,000 mock USDC tokens</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-xs font-medium shrink-0">3</span>
              <span><strong>Start Trading</strong> - Swap mUSDC for MAANG tokens on the DMM</span>
            </li>
          </ol>
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleContinue}
            className="px-8 py-6 text-base font-medium group"
            size="lg"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
