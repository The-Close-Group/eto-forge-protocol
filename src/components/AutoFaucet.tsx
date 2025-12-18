/**
 * AutoFaucet Component
 * Automatically sends gas (ETH) and USDC to new users when they connect their wallet.
 * Uses AWS Lambda faucet endpoint.
 */
import { useEffect, useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Faucet API endpoint - set via VITE_FAUCET_API_URL env var after deploying Lambda
const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API_URL || '';

// Local storage key to track claimed addresses
const CLAIMED_KEY = 'eto-faucet-claimed';

interface FaucetResponse {
  success?: boolean;
  error?: string;
  message?: string;
  ethTxHash?: string;
  usdcTxHash?: string;
  ethAmount?: string;
  usdcAmount?: string;
  timeRemaining?: number;
  explorer?: string;
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
  const queryClient = useQueryClient();
  const claimingRef = useRef(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    async function claimFaucet() {
      // Debug logging
      console.log('[AutoFaucet] Check:', {
        hasUrl: !!FAUCET_API_URL,
        address: account?.address,
        claiming: claimingRef.current,
        hasClaimed,
        claimedLocally: account?.address ? hasClaimedLocally(account.address) : 'no-address'
      });

      // Skip if no API URL configured
      if (!FAUCET_API_URL) {
        console.log('[AutoFaucet] No FAUCET_API_URL configured, skipping');
        return;
      }
      
      if (!account?.address) return;
      if (claimingRef.current) return;
      if (hasClaimed) return;
      
      // Check if already claimed locally
      if (hasClaimedLocally(account.address)) {
        console.log('[AutoFaucet] Already claimed locally, skipping');
        setHasClaimed(true);
        return;
      }

      claimingRef.current = true;
      
      // Show loading toast
      const loadingId = toast.loading('⛽ Sending you starter funds...', { duration: 10000 });

      try {
        console.log('[AutoFaucet] Claiming for:', account.address);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(FAUCET_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: account.address }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data: FaucetResponse = await response.json();

        // Dismiss loading toast
        toast.dismiss(loadingId);

        if (data.error) {
          // Handle cooldown (429)
          if (data.timeRemaining) {
            markClaimedLocally(account.address);
            setHasClaimed(true);
            console.log('[AutoFaucet] On cooldown:', data.timeRemaining, 'seconds');
            return; // Silent - don't show error for cooldown
          }
          
          console.error('[AutoFaucet] Error:', data.error);
          // Don't show error to user - faucet issues shouldn't block them
          return;
        }

        if (data.success) {
          markClaimedLocally(account.address);
          setHasClaimed(true);

          // Force wallet balance refresh after 2 seconds (wait for block confirmation)
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
          }, 2000);

          // Show success toast
          const usdcMsg = data.usdcAmount && parseFloat(data.usdcAmount) > 0 
            ? ` + ${data.usdcAmount} mUSDC` 
            : '';
          toast.success(
            `🎉 Welcome to ETO! Sent ${data.ethAmount || '0.1'} ETH${usdcMsg}`,
            { duration: 8000 }
          );

          console.log('[AutoFaucet] Success:', data);
        }
      } catch (error: any) {
        console.error('[AutoFaucet] Network error:', error);
        toast.dismiss(loadingId);
        
        // Only show error if it's a timeout (AbortError)
        if (error.name === 'AbortError') {
          toast.error('⏱️ Faucet request timed out. Please try again later.');
        }
        // Silent fail for other errors - don't block the user
      } finally {
        claimingRef.current = false;
      }
    }

    claimFaucet();
  }, [account?.address, hasClaimed]);

  // This component doesn't render anything visible
  return null;
}

export default AutoFaucet;
