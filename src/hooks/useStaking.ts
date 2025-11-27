import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData, parseGwei } from 'viem';
import { etoPublicClient } from '@/lib/etoRpc';
import { USDC_ADDRESS, DMM_ADDRESS, DRI_TOKEN_ADDRESS } from '@/config/contracts';

// Minimal ABIs for staking functions
const DMM_ABI = [
  {
    inputs: [
      { name: 'driAmount', type: 'uint256' },
      { name: 'usdcAmount', type: 'uint256' },
      { name: 'minLiquidityOut', type: 'uint256' }
    ],
    name: 'addLiquidity',
    outputs: [{ name: 'liquidity', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'liquidity', type: 'uint256' }],
    name: 'removeLiquidity',
    outputs: [
      { name: 'driAmount', type: 'uint256' },
      { name: 'usdcAmount', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'userLiquidity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalLiquidity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidityPosition',
    outputs: [
      { name: 'driTokens', type: 'uint256' },
      { name: 'usdcTokens', type: 'uint256' },
      { name: 'lowerTick', type: 'uint256' },
      { name: 'upperTick', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Helper to get window.ethereum
const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
};

export function useStaking() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Check token allowance
  const checkAllowance = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!account?.address) return false;
    try {
      const allowance = await etoPublicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address as `0x${string}`, DMM_ADDRESS as `0x${string}`],
      });
      return allowance >= amount;
    } catch (error) {
      console.error('[Staking] Allowance check failed:', error);
      return false;
    }
  }, [account]);

  // Approve token spending
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const provider = getEthereumProvider();
      if (!provider) {
        toast.error('No wallet detected');
        return false;
      }

      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      // Ensure wallet is on ETO L1
      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DMM_ADDRESS as `0x${string}`, amount],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 100_000n,
      });

      toast.success('Approval sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

      if (receipt.status === 'success') {
        toast.success('Token approved!');
        // Wait a bit for RPC to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('[Staking] Approval failed:', error);
      if (error.code === 4001) {
        toast.error('Approval rejected by user');
      } else {
        toast.error('Approval failed: ' + (error.shortMessage || error.message));
      }
      return false;
    }
  }, [account]);

  // Get user's staked liquidity
  const getUserLiquidity = useCallback(async (): Promise<bigint> => {
    if (!account?.address) return 0n;
    try {
      return await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'userLiquidity',
        args: [account.address as `0x${string}`],
      });
    } catch (error) {
      console.error('[Staking] Failed to get user liquidity:', error);
      return 0n;
    }
  }, [account]);

  // Get liquidity position info
  const getLiquidityPosition = useCallback(async () => {
    try {
      const position = await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'liquidityPosition',
      });
      return {
        driTokens: position[0],
        usdcTokens: position[1],
        lowerTick: position[2],
        upperTick: position[3],
        liquidity: position[4],
      };
    } catch (error) {
      console.error('[Staking] Failed to get liquidity position:', error);
      return null;
    }
  }, []);

  // Calculate expected liquidity output for a given DRI/USDC amount
  const getStakeQuote = useCallback(async (driAmount: bigint, usdcAmount: bigint): Promise<bigint | null> => {
    try {
      const position = await getLiquidityPosition();
      if (!position) return null;

      if (position.liquidity === 0n) {
        // First liquidity: sqrt(dri * usdc)
        // Simplified calculation (actual uses Math.sqrt with proper scaling)
        const product = (driAmount * usdcAmount) / (10n ** 18n);
        return BigInt(Math.floor(Math.sqrt(Number(product))));
      }

      // Calculate share based on current ratio
      const SCALE = 10n ** 18n;
      const driShare = (driAmount * SCALE) / position.driTokens;
      const usdcShare = (usdcAmount * SCALE) / position.usdcTokens;
      const minShare = driShare < usdcShare ? driShare : usdcShare;
      return (minShare * position.liquidity) / SCALE;
    } catch (error) {
      console.error('[Staking] Quote calculation failed:', error);
      return null;
    }
  }, [getLiquidityPosition]);

  // Calculate expected DRI/USDC output for removing liquidity
  const getUnstakeQuote = useCallback(async (liquidity: bigint): Promise<{ dri: bigint; usdc: bigint } | null> => {
    try {
      const position = await getLiquidityPosition();
      if (!position) return null;

      const totalLiq = await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'totalLiquidity',
      });

      if (totalLiq === 0n) return { dri: 0n, usdc: 0n };

      const driAmount = (liquidity * position.driTokens) / totalLiq;
      const usdcAmount = (liquidity * position.usdcTokens) / totalLiq;

      return { dri: driAmount, usdc: usdcAmount };
    } catch (error) {
      console.error('[Staking] Unstake quote failed:', error);
      return null;
    }
  }, [getLiquidityPosition]);

  // Stake (add liquidity) - Note: addLiquidity is onlyOwner, so this may fail
  const stake = useCallback(async (
    driAmount: string,
    usdcAmount: string,
    minLiquidityOut?: string
  ): Promise<string | null> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const driAmt = BigInt(Math.floor(parseFloat(driAmount) * 1e18));
      const usdcAmt = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6));
      const minLiq = minLiquidityOut ? BigInt(Math.floor(parseFloat(minLiquidityOut) * 1e18)) : 0n;

      // Check and approve DRI
      const driApproved = await checkAllowance(DRI_TOKEN_ADDRESS, driAmt);
      if (!driApproved) {
        const approved = await approveToken(DRI_TOKEN_ADDRESS, driAmt);
        if (!approved) return null;
        // Re-check after approval
        await new Promise(resolve => setTimeout(resolve, 2000));
        const recheck = await checkAllowance(DRI_TOKEN_ADDRESS, driAmt);
        if (!recheck) {
          toast.error('DRI approval not detected. Please try again.');
          return null;
        }
      }

      // Check and approve USDC
      const usdcApproved = await checkAllowance(USDC_ADDRESS, usdcAmt);
      if (!usdcApproved) {
        const approved = await approveToken(USDC_ADDRESS, usdcAmt);
        if (!approved) return null;
        // Re-check after approval
        await new Promise(resolve => setTimeout(resolve, 2000));
        const recheck = await checkAllowance(USDC_ADDRESS, usdcAmt);
        if (!recheck) {
          toast.error('USDC approval not detected. Please try again.');
          return null;
        }
      }

      const provider = getEthereumProvider();
      if (!provider) {
        toast.error('No wallet detected');
        return null;
      }

      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });

      // Pre-flight simulation to catch errors
      try {
        await etoPublicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: DMM_ADDRESS as `0x${string}`,
          abi: DMM_ABI,
          functionName: 'addLiquidity',
          args: [driAmt, usdcAmt, minLiq],
        });
      } catch (simError: any) {
        const errorData = simError?.data || simError?.message || simError?.cause?.data || '';
        if (errorData.includes('onlyOwner') || errorData.includes('E1')) {
          toast.error('Staking is currently restricted to protocol owner. Please contact support.');
          return null;
        }
        // Continue with transaction - other errors will be caught on-chain
      }

      const hash = await walletClient.writeContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'addLiquidity',
        args: [driAmt, usdcAmt, minLiq],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 500_000n,
      });

      toast.success('Stake transaction sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

      if (receipt.status === 'success') {
        toast.success('Successfully staked!');
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['user-liquidity'] });
        return hash;
      } else {
        toast.error('Staking failed on-chain');
        return null;
      }
    } catch (error: any) {
      console.error('[Staking] Error:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('onlyOwner') || error.data?.includes('onlyOwner')) {
        toast.error('Staking is currently restricted to protocol owner');
      } else {
        toast.error(error.shortMessage || error.message || 'Staking failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, checkAllowance, approveToken, queryClient]);

  // Unstake (remove liquidity)
  const unstake = useCallback(async (liquidity: string): Promise<string | null> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const liqAmt = BigInt(Math.floor(parseFloat(liquidity) * 1e18));

      // Check user has enough liquidity
      const userLiq = await getUserLiquidity();
      if (userLiq < liqAmt) {
        toast.error('Insufficient staked liquidity');
        return null;
      }

      const provider = getEthereumProvider();
      if (!provider) {
        toast.error('No wallet detected');
        return null;
      }

      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });

      // Pre-flight simulation
      try {
        await etoPublicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: DMM_ADDRESS as `0x${string}`,
          abi: DMM_ABI,
          functionName: 'removeLiquidity',
          args: [liqAmt],
        });
      } catch (simError: any) {
        const errorData = simError?.data || simError?.message || simError?.cause?.data || '';
        if (errorData.includes('E30') || errorData.includes('insufficient')) {
          toast.error('Insufficient staked liquidity');
          return null;
        }
        if (errorData.includes('E75') || errorData.includes('emergency')) {
          toast.error('Emergency mode active - unstaking disabled');
          return null;
        }
        if (errorData.includes('recenter') || errorData.includes('during')) {
          toast.error('Cannot unstake during recentering. Please try again shortly.');
          return null;
        }
      }

      const hash = await walletClient.writeContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'removeLiquidity',
        args: [liqAmt],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 300_000n,
      });

      toast.success('Unstake transaction sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

      if (receipt.status === 'success') {
        toast.success('Successfully unstaked!');
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['user-liquidity'] });
        return hash;
      } else {
        toast.error('Unstaking failed on-chain');
        return null;
      }
    } catch (error: any) {
      console.error('[Unstaking] Error:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('E30') || error.data?.includes('E30')) {
        toast.error('Insufficient staked liquidity');
      } else if (error.message?.includes('E75') || error.data?.includes('E75')) {
        toast.error('Emergency mode active - unstaking disabled');
      } else if (error.message?.includes('recenter') || error.data?.includes('recenter')) {
        toast.error('Cannot unstake during recentering. Please try again shortly.');
      } else {
        toast.error(error.shortMessage || error.message || 'Unstaking failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, getUserLiquidity, queryClient]);

  return {
    stake,
    unstake,
    getUserLiquidity,
    getStakeQuote,
    getUnstakeQuote,
    getLiquidityPosition,
    isLoading,
  };
}

