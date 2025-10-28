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
