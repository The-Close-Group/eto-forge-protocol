import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData, parseGwei } from 'viem';
import { etoPublicClient } from '@/lib/etoRpc';
import { USDC_ADDRESS, DMM_ADDRESS, DRI_TOKEN_ADDRESS } from '@/config/contracts';

const EXPLORER_URL = 'https://eto-explorer.ash.center';

// Minimal ABIs for the functions we need
const DMM_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' }
    ],
    name: 'swap',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' }
    ],
    name: 'quote',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentPrice',
    outputs: [{ name: '', type: 'uint256' }],
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

const ETO_CHAIN_ID_HEX = '0x10F2C';

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  price: string;
  priceImpact: string;
  minimumReceived: string;
}

export function useDirectSwap() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Get current DMM price
  const getCurrentPrice = useCallback(async (): Promise<number> => {
    try {
      const price = await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'getCurrentPrice',
      });
      return Number(price) / 1e18;
    } catch (error) {
      console.error('Error getting price:', error);
      return 0;
    }
  }, []);

  // Get quote for buying DRI with USDC
  const getBuyQuote = useCallback(async (usdcAmount: string): Promise<SwapQuote | null> => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return null;

    try {
      const amountIn = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6));
      
      const outputAmount = await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'quote',
        args: [USDC_ADDRESS as `0x${string}`, amountIn],
      });

      const outputNum = Number(outputAmount) / 1e18;
      const currentPrice = await getCurrentPrice();
      const executionPrice = parseFloat(usdcAmount) / outputNum;
      const priceImpact = currentPrice > 0 ? ((executionPrice - currentPrice) / currentPrice) * 100 : 0;

      return {
        inputAmount: usdcAmount,
        outputAmount: outputNum.toFixed(6),
        price: executionPrice.toFixed(2),
        priceImpact: Math.abs(priceImpact).toFixed(2),
        minimumReceived: (outputNum * 0.99).toFixed(6), // 1% slippage
      };
    } catch (error) {
      console.error('Error getting buy quote:', error);
      return null;
    }
  }, [getCurrentPrice]);

  // Get quote for selling DRI for USDC
  const getSellQuote = useCallback(async (driAmount: string): Promise<SwapQuote | null> => {
    if (!driAmount || parseFloat(driAmount) <= 0) return null;

    try {
      const amountIn = BigInt(Math.floor(parseFloat(driAmount) * 1e18));
      
      const outputAmount = await etoPublicClient.readContract({
        address: DMM_ADDRESS as `0x${string}`,
        abi: DMM_ABI,
        functionName: 'quote',
        args: [DRI_TOKEN_ADDRESS as `0x${string}`, amountIn],
      });

      const outputNum = Number(outputAmount) / 1e6;
      const currentPrice = await getCurrentPrice();
      const executionPrice = outputNum / parseFloat(driAmount);
      const priceImpact = currentPrice > 0 ? ((currentPrice - executionPrice) / currentPrice) * 100 : 0;

      return {
        inputAmount: driAmount,
        outputAmount: outputNum.toFixed(2),
        price: executionPrice.toFixed(2),
        priceImpact: Math.abs(priceImpact).toFixed(2),
        minimumReceived: (outputNum * 0.99).toFixed(2), // 1% slippage
      };
    } catch (error) {
      console.error('Error getting sell quote:', error);
      return null;
    }
  }, [getCurrentPrice]);

  // Check USDC allowance
  const checkAllowance = useCallback(async (tokenAddress: string): Promise<bigint> => {
    if (!account?.address) return 0n;

    try {
      const allowance = await etoPublicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address as `0x${string}`, DMM_ADDRESS as `0x${string}`],
      });
      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return 0n;
    }
  }, [account]);

  // Approve token for DMM
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return false;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error('No wallet detected');
      return false;
    }

    setIsApproving(true);
    try {
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
      });

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DMM_ADDRESS as `0x${string}`, amount],
      });

      toast.info('Please approve the token spending...');

      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: tokenAddress,
          data,
          gas: '0x30000', // 200k gas
          gasPrice: `0x${parseGwei('1.5').toString(16)}`,
          nonce: `0x${nonce.toString(16)}`,
        }],
      });

      if (!hash) throw new Error('No transaction hash returned');

      toast.success('Approval sent! Waiting for confirmation...');

      const receipt = await etoPublicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      if (receipt.status === 'success') {
        toast.success(`Token approved! View: ${EXPLORER_URL}/tx/${hash}`);
        return true;
      } else {
        toast.error('Approval failed');
        return false;
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      if (error.code === 4001) {
        toast.error('Approval rejected');
      } else {
        toast.error(error.shortMessage || error.message || 'Approval failed');
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [account]);

  // Execute swap
  const executeSwap = useCallback(async (
    tokenIn: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<string | null> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return null;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error('No wallet detected');
      return null;
    }

    setIsLoading(true);
    try {
      // Check allowance first
      let allowance = await checkAllowance(tokenIn);
      console.log(`[Swap] Current allowance: ${allowance}, needed: ${amountIn}`);
      
      if (allowance < amountIn) {
        toast.info('Need to approve token first...');
        const approved = await approveToken(tokenIn, amountIn * 2n); // Approve 2x for future swaps
        if (!approved) return null;
        
        // Wait a moment for RPC to update, then verify approval
        await new Promise(resolve => setTimeout(resolve, 2000));
        allowance = await checkAllowance(tokenIn);
        console.log(`[Swap] Post-approval allowance: ${allowance}`);
        
        if (allowance < amountIn) {
          toast.error('Approval may not have been processed yet. Please try again.');
          return null;
        }
      }

      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
      });

      const data = encodeFunctionData({
        abi: DMM_ABI,
        functionName: 'swap',
        args: [tokenIn as `0x${string}`, amountIn, minAmountOut],
      });

      // Estimate gas
      let gasEstimate: bigint;
      try {
        gasEstimate = await etoPublicClient.estimateGas({
          account: account.address as `0x${string}`,
          to: DMM_ADDRESS as `0x${string}`,
          data,
        });
      } catch {
        gasEstimate = 500000n; // Fallback
      }

      toast.info('Please confirm the swap in your wallet...');

      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: DMM_ADDRESS,
          data,
          gas: `0x${(gasEstimate * 15n / 10n).toString(16)}`,
          gasPrice: `0x${parseGwei('1.5').toString(16)}`,
          nonce: `0x${nonce.toString(16)}`,
        }],
      });

      if (!hash) throw new Error('No transaction hash returned');

      toast.success('Swap sent! Waiting for confirmation...');

      const receipt = await etoPublicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      if (receipt.status === 'success') {
        toast.success(`Swap successful! View: ${EXPLORER_URL}/tx/${hash}`);
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['staking-balances'] });
        return hash;
      } else {
        console.error('[Swap] Transaction reverted:', receipt);
        // Transaction reverted - likely E37 (price band) or other DMM error
        toast.error('Swap failed: Amount may exceed price band limits. Try a smaller amount or wait for the keeper to recenter.');
        return null;
      }
    } catch (error: any) {
      console.error('[Swap] Error:', error);
      if (error.code === 4001) {
        toast.error('Swap rejected by user');
      } else if (error.message?.includes('InsufficientAllowance')) {
        toast.error('Token approval needed. Please try again.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient balance for swap');
      } else if (error.message?.includes('E37') || error.data?.includes('E37') || error.reason?.includes('E37')) {
        toast.error('Swap exceeds price band limits. Try a smaller amount or wait for the keeper to recenter.');
      } else {
        toast.error(error.shortMessage || error.message || 'Swap failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, checkAllowance, approveToken, queryClient]);

  // Buy DRI with USDC
  const buyDRI = useCallback(async (usdcAmount: string, minDriOut?: string): Promise<string | null> => {
    const amountIn = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6));
    const minOut = minDriOut ? BigInt(Math.floor(parseFloat(minDriOut) * 1e18)) : 0n;
    return executeSwap(USDC_ADDRESS, amountIn, minOut);
  }, [executeSwap]);

  // Sell DRI for USDC
  const sellDRI = useCallback(async (driAmount: string, minUsdcOut?: string): Promise<string | null> => {
    const amountIn = BigInt(Math.floor(parseFloat(driAmount) * 1e18));
    const minOut = minUsdcOut ? BigInt(Math.floor(parseFloat(minUsdcOut) * 1e6)) : 0n;
    return executeSwap(DRI_TOKEN_ADDRESS, amountIn, minOut);
  }, [executeSwap]);

  // Get user balances
  const getBalances = useCallback(async (): Promise<{ usdc: string; dri: string }> => {
    if (!account?.address) return { usdc: '0', dri: '0' };

    try {
      const [usdcBal, driBal] = await Promise.all([
        etoPublicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
        etoPublicClient.readContract({
          address: DRI_TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
      ]);

      return {
        usdc: (Number(usdcBal) / 1e6).toFixed(2),
        dri: (Number(driBal) / 1e18).toFixed(6),
      };
    } catch (error) {
      console.error('Error getting balances:', error);
      return { usdc: '0', dri: '0' };
    }
  }, [account]);

  return {
    getCurrentPrice,
    getBuyQuote,
    getSellQuote,
    buyDRI,
    sellDRI,
    getBalances,
    checkAllowance,
    approveToken,
    isLoading,
    isApproving,
  };
}

