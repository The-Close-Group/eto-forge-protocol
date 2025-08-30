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
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <h1 className="text-3xl font-bold">Get Test Tokens</h1>
      <p className="text-muted-foreground">
        Claim free mUSDC tokens for testing on ETO Testnet
      </p>
      
      <USDCFaucet />
      
      <Button 
        onClick={handleContinue}
        className="w-full mt-4"
      >
        Continue to Dashboard
      </Button>
    </div>
  );
}
