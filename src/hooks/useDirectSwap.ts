import { useState, useCallback } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, getContract, readContract } from 'thirdweb';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USDC_ADDRESS, DMM_ADDRESS, DRI_TOKEN_ADDRESS } from '@/config/contracts';
import { useProtocolStore, selectPrices } from '@/stores/protocolStore';
import { client, etoMainnet } from '@/lib/thirdweb';

const EXPLORER_URL = 'https://eto.ash.center';

// Get contract instances using thirdweb
const dmmContract = getContract({
  client,
  chain: etoMainnet,
  address: DMM_ADDRESS,
});

const usdcContract = getContract({
  client,
  chain: etoMainnet,
  address: USDC_ADDRESS,
});

const driContract = getContract({
  client,
  chain: etoMainnet,
  address: DRI_TOKEN_ADDRESS,
});

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
  
  // Use thirdweb's sendTransaction hook
  const { mutateAsync: sendTransaction } = useSendTransaction();
  
  // Get price from global store - NO MORE RPC CALLS FOR PRICE
  const prices = useProtocolStore(selectPrices);

  // Get current DMM price from store (already updated via WebSocket)
  const getCurrentPrice = useCallback(async (): Promise<number> => {
    return prices.dmmPrice || 328.0;
  }, [prices.dmmPrice]);

  // Get quote for buying DRI with USDC
  const getBuyQuote = useCallback(async (usdcAmount: string): Promise<SwapQuote | null> => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return null;

    try {
      const amountIn = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6));
      
      const outputAmount = await readContract({
        contract: dmmContract,
        method: "function quote(address tokenIn, uint256 amountIn) view returns (uint256)",
        params: [USDC_ADDRESS as `0x${string}`, amountIn],
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
      
      const outputAmount = await readContract({
        contract: dmmContract,
        method: "function quote(address tokenIn, uint256 amountIn) view returns (uint256)",
        params: [DRI_TOKEN_ADDRESS as `0x${string}`, amountIn],
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

  // Check token allowance
  const checkAllowance = useCallback(async (tokenAddress: string): Promise<bigint> => {
    if (!account?.address) return 0n;

    try {
      const tokenContract = getContract({
        client,
        chain: etoMainnet,
        address: tokenAddress,
      });

      const allowance = await readContract({
        contract: tokenContract,
        method: "function allowance(address owner, address spender) view returns (uint256)",
        params: [account.address as `0x${string}`, DMM_ADDRESS as `0x${string}`],
      });
      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return 0n;
    }
  }, [account]);

  // Approve token for DMM - uses thirdweb for seamless UX
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsApproving(true);
    try {
      const tokenContract = getContract({
        client,
        chain: etoMainnet,
        address: tokenAddress,
      });

      const transaction = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [DMM_ADDRESS as `0x${string}`, amount],
      });

      toast.info('Approving token spending...');

      const result = await sendTransaction(transaction);
      
      if (result.transactionHash) {
        toast.success(`Token approved!`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Approval error:', error);
      const errorMessage = error.message || error.shortMessage || '';
      
      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        toast.error('Approval rejected');
      } else if (errorMessage.includes('0xe450d38c') || errorMessage.includes('ERC20InsufficientBalance')) {
        toast.error('Insufficient token balance');
      } else {
        toast.error(error.shortMessage || 'Approval failed. Please try again.');
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [account, sendTransaction]);

  // Execute swap using thirdweb
  const executeSwap = useCallback(async (
    tokenIn: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<string | null> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      // Check allowance first
      let allowance = await checkAllowance(tokenIn);
      console.log(`[Swap] Current allowance: ${allowance}, needed: ${amountIn}`);
      
      if (allowance < amountIn) {
        toast.info('Approving token first...');
        // Approve max uint256 for unlimited future swaps (better UX)
        const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        const approved = await approveToken(tokenIn, maxApproval);
        if (!approved) return null;
        
        // Wait a moment for the approval to be indexed
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Prepare swap transaction
      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
        params: [tokenIn as `0x${string}`, amountIn, minAmountOut],
      });

      toast.info('Executing swap...');

      const result = await sendTransaction(transaction);
      
      if (result.transactionHash) {
        toast.success(`Swap successful! View: ${EXPLORER_URL}/tx/${result.transactionHash}`);
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['staking-balances'] });
        return result.transactionHash;
      }
      return null;
    } catch (error: any) {
      console.error('[Swap] Error:', error);
      const errorMessage = error.message || error.shortMessage || '';
      const errorData = error.data || '';
      
      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        toast.error('Swap rejected by user');
      } else if (errorMessage.includes('InsufficientAllowance')) {
        toast.error('Token approval needed. Please try again.');
      } else if (errorMessage.includes('0xe450d38c') || errorMessage.includes('ERC20InsufficientBalance') || errorMessage.includes('insufficient funds')) {
        // 0xe450d38c = ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)
        toast.error('Insufficient token balance for this swap');
      } else if (errorMessage.includes('E37') || errorData.includes('E37')) {
        toast.error('Swap exceeds price band limits. Try a smaller amount.');
      } else if (errorMessage.includes('0x') && errorMessage.length < 100) {
        // Generic encoded error - show user-friendly message
        toast.error('Transaction failed. Please check your balance and try again.');
      } else {
        toast.error(error.shortMessage || 'Swap failed. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, checkAllowance, approveToken, sendTransaction, queryClient]);

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
        readContract({
          contract: usdcContract,
          method: "function balanceOf(address account) view returns (uint256)",
          params: [account.address as `0x${string}`],
        }),
        readContract({
          contract: driContract,
          method: "function balanceOf(address account) view returns (uint256)",
          params: [account.address as `0x${string}`],
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
