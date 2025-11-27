import { useCallback, useMemo } from 'react';
import { useThirdwebSwap } from './useThirdwebSwap';
import { useDMMSwap } from './useDMMSwap';

export type SwapMethod = 'dmm' | 'thirdweb';

interface SwapRouterResult {
  method: SwapMethod;
  getQuote: (amount: string) => Promise<any>;
  executeSwap: (amount: string) => Promise<boolean>;
  isLoading: boolean;
}

/**
 * Smart router that chooses between DMM and thirdweb Bridge
 * based on the token pair being swapped
 */
export function useSwapRouter(fromToken: string, toToken: string): SwapRouterResult {
  const dmmSwap = useDMMSwap();
  const thirdwebSwap = useThirdwebSwap();

  // Determine which swap method to use
  const swapMethod = useMemo<SwapMethod>(() => {
    // Use DMM for MAANG <-> mUSDC pairs (our custom bonding curve)
    if (
      (fromToken === 'mUSDC' && toToken === 'MAANG') ||
      (fromToken === 'MAANG' && toToken === 'mUSDC')
    ) {
      return 'dmm';
    }

    // Use thirdweb Bridge for all other pairs (DEX aggregation)
    return 'thirdweb';
  }, [fromToken, toToken]);

  // Get quote based on selected method
  const getQuote = useCallback(async (amount: string) => {
    if (swapMethod === 'dmm') {
      if (fromToken === 'mUSDC' && toToken === 'MAANG') {
        return await dmmSwap.getBuyQuote(amount);
      } else {
        return await dmmSwap.getSellQuote(amount);
      }
    } else {
      // thirdweb Bridge quote
      return await thirdwebSwap.getSwapQuote({
        fromChainId: 1, // TODO: Get from current chain
        fromTokenAddress: '0x...', // TODO: Get token addresses
        fromAmount: amount,
        fromDecimals: 6,
        toChainId: 1,
        toTokenAddress: '0x...',
      });
    }
  }, [swapMethod, fromToken, toToken, dmmSwap, thirdwebSwap]);

  // Execute swap based on selected method
  const executeSwap = useCallback(async (amount: string): Promise<boolean> => {
    if (swapMethod === 'dmm') {
      try {
        if (fromToken === 'mUSDC' && toToken === 'MAANG') {
          await dmmSwap.buyTokens(amount);
        } else {
          await dmmSwap.sellTokens(amount);
        }
        return true;
      } catch (error) {
        console.error('DMM swap failed:', error);
        return false;
      }
    } else {
      // thirdweb Bridge execution
      const quote = await thirdwebSwap.getSwapQuote({
        fromChainId: 1,
        fromTokenAddress: '0x...',
        fromAmount: amount,
        fromDecimals: 6,
        toChainId: 1,
        toTokenAddress: '0x...',
      });

      if (!quote) return false;

      return await thirdwebSwap.executeSwap(quote);
    }
  }, [swapMethod, fromToken, toToken, dmmSwap, thirdwebSwap]);

  // Combined loading state
  const isLoading = useMemo(() => {
    if (swapMethod === 'dmm') {
      return dmmSwap.isLoading;
    }
    return thirdwebSwap.isLoadingQuote || thirdwebSwap.isExecuting;
  }, [swapMethod, dmmSwap.isLoading, thirdwebSwap.isLoadingQuote, thirdwebSwap.isExecuting]);

  return {
    method: swapMethod,
    getQuote,
    executeSwap,
    isLoading,
  };
}
