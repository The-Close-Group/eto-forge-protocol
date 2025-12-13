/**
 * AutoFaucet Component
 * Automatically sends gas (ETH) and USDC to new users when they connect their wallet.
 * Uses AWS Lambda faucet endpoint.
 */
import { useEffect, useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { Fuel, Droplets, CheckCircle2, ExternalLink } from 'lucide-react';

// Faucet API endpoint - update with your AWS API Gateway URL
const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API_URL || 'https://your-api-gateway.execute-api.us-east-1.amazonaws.com/claim';

// Local storage key to track claimed addresses
const CLAIMED_KEY = 'eto-faucet-claimed';

interface FaucetResponse {
  success?: boolean;
  error?: string;
  message?: string;
  gasTxHash?: string;
  usdcTxHash?: string;
  gasAmount?: string;
  usdcAmount?: string;
  cooldownRemaining?: number;
  explorerUrl?: string;
}

/**
 * Check if this address has already claimed (locally)
 */
function hasClaimedLocally(address: string): boolean {
  try {
    const claimed = localStorage.getItem(CLAIMED_KEY);
    if (!claimed) return false;
    const addresses = JSON.parse(claimed) as string[];
    return addresses.includes(address.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Mark address as claimed locally
 */
function markClaimedLocally(address: string): void {
  try {
    const claimed = localStorage.getItem(CLAIMED_KEY);
    const addresses = claimed ? JSON.parse(claimed) as string[] : [];
    if (!addresses.includes(address.toLowerCase())) {
      addresses.push(address.toLowerCase());
      localStorage.setItem(CLAIMED_KEY, JSON.stringify(addresses));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * AutoFaucet - renders nothing visible, just handles auto-funding
 */
export function AutoFaucet() {
  const account = useActiveAccount();
  const claimingRef = useRef(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    async function claimFaucet() {
      if (!account?.address) return;
      if (claimingRef.current) return;
      if (hasClaimed) return;
      
      // Check if already claimed locally
      if (hasClaimedLocally(account.address)) {
        setHasClaimed(true);
        return;
      }

      claimingRef.current = true;

      try {
        console.log('[AutoFaucet] Claiming for:', account.address);
        
        // Show loading toast
        const loadingId = toast.loading(
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 animate-pulse text-yellow-500" />
            <span>Sending you starter funds...</span>
          </div>,
          { duration: 30000 }
        );

        const response = await fetch(FAUCET_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: account.address }),
        });

        const data: FaucetResponse = await response.json();

        // Dismiss loading toast
        toast.dismiss(loadingId);

        if (data.error) {
          // Handle cooldown
          if (data.cooldownRemaining) {
            markClaimedLocally(account.address); // Still mark as claimed
            setHasClaimed(true);
            console.log('[AutoFaucet] On cooldown:', data.cooldownRemaining, 'hours');
            return; // Silent - don't show error for cooldown
          }
          
          console.error('[AutoFaucet] Error:', data.error);
          // Don't show error to user - faucet issues shouldn't block them
          return;
        }

        if (data.success) {
          markClaimedLocally(account.address);
          setHasClaimed(true);

          // Show success toast with links
          toast.success(
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium">Welcome to ETO!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {data.gasAmount && (
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    <span>{data.gasAmount} ETH for gas</span>
                  </div>
                )}
                {data.usdcAmount && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{data.usdcAmount} USDC for trading</span>
                  </div>
                )}
              </div>
              {data.explorerUrl && (
                <a
                  href={data.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  View transaction <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>,
            { duration: 8000 }
          );

          console.log('[AutoFaucet] Success:', data);
        }
      } catch (error) {
        console.error('[AutoFaucet] Network error:', error);
        // Silent fail - don't block the user
      } finally {
        claimingRef.current = false;
      }
    }

    claimFaucet();
  }, [account?.address, hasClaimed]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to manually trigger faucet claim
 */
export function useFaucetClaim() {
  const account = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<FaucetResponse | null>(null);

  const claim = async () => {
    if (!account?.address || isPending) return;

    setIsPending(true);
    setResult(null);

    try {
      const response = await fetch(FAUCET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account.address }),
      });

      const data: FaucetResponse = await response.json();
      setResult(data);

      if (data.success) {
        markClaimedLocally(account.address);
      }

      return data;
    } catch (error: any) {
      const errorResult = { error: error.message || 'Network error' };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsPending(false);
    }
  };

  return {
    claim,
    isPending,
    result,
    hasClaimed: account?.address ? hasClaimedLocally(account.address) : false,
  };
}

export default AutoFaucet;
