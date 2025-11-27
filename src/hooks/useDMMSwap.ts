import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { client, etoMainnet } from '@/lib/thirdweb';
import { USDC_ADDRESS, DMM_ADDRESS, DRI_TOKEN_ADDRESS, DMM_ABI, ERC20_ABI } from '@/config/contracts';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  price: string;
  priceImpact: string;
  minimumReceived: string;
}

export function useDMMSwap() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Get buy quote (USDC -> DRI) using DMM.quote()
  const getBuyQuote = useCallback(async (usdcAmount: string): Promise<SwapQuote | null> => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return null;

    try {
      const dmmContract = getContract({
        client,
        chain: etoMainnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const usdcAmountWei = BigInt(Math.floor(parseFloat(usdcAmount) * 10 ** 6)); // USDC has 6 decimals
      
      // V4 DMM uses quote(tokenIn, amountIn)
      const outputAmountWei = await readContract({
        contract: dmmContract,
        method: "quote",
        params: [USDC_ADDRESS, usdcAmountWei],
      });

      const outputAmount = (Number(outputAmountWei) / 10 ** 18).toFixed(6); // DRI has 18 decimals
      const price = parseFloat(outputAmount) > 0 
        ? (parseFloat(usdcAmount) / parseFloat(outputAmount)).toFixed(2) 
        : "0";
      const priceImpact = "0.1"; // TODO: Calculate based on spot price vs execution price
      const minimumReceived = (parseFloat(outputAmount) * 0.99).toFixed(6); // 1% slippage

      return {
        inputAmount: usdcAmount,
        outputAmount,
        price,
        priceImpact,
        minimumReceived,
      };
    } catch (error) {
      console.error('Error getting buy quote:', error);
      return null;
    }
  }, []);

  // Get sell quote (DRI -> USDC) using DMM.quote()
  const getSellQuote = useCallback(async (driAmount: string): Promise<SwapQuote | null> => {
    if (!driAmount || parseFloat(driAmount) <= 0) return null;

    try {
      const dmmContract = getContract({
        client,
        chain: etoMainnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const driAmountWei = BigInt(Math.floor(parseFloat(driAmount) * 10 ** 18)); // DRI has 18 decimals
      
      // V4 DMM uses quote(tokenIn, amountIn)
      const outputAmountWei = await readContract({
        contract: dmmContract,
        method: "quote",
        params: [DRI_TOKEN_ADDRESS, driAmountWei],
      });

      const outputAmount = (Number(outputAmountWei) / 10 ** 6).toFixed(6); // USDC has 6 decimals
      const price = parseFloat(driAmount) > 0 
        ? (parseFloat(outputAmount) / parseFloat(driAmount)).toFixed(2) 
        : "0";
      const priceImpact = "0.1";
      const minimumReceived = (parseFloat(outputAmount) * 0.99).toFixed(6); // 1% slippage

      return {
        inputAmount: driAmount,
        outputAmount,
        price,
        priceImpact,
        minimumReceived,
      };
    } catch (error) {
      console.error('Error getting sell quote:', error);
      return null;
    }
  }, []);

  // Check and approve USDC spending
  const approveUSDC = useCallback(async (amount: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsApproving(true);
    try {
      const usdcContract = getContract({
        client,
        chain: etoMainnet,
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
      });

      const amountWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 6)); // USDC has 6 decimals

      const transaction = prepareContractCall({
        contract: usdcContract,
        method: "approve",
        params: [DMM_ADDRESS, amountWei],
      });

      await sendTransaction({
        transaction,
        account,
      });

      toast.success('USDC approved for trading!');
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error approving USDC:', error);
      toast.error('Failed to approve USDC');
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [account, queryClient]);

  // Approve DRI spending (for selling)
  const approveDRI = useCallback(async (amount: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsApproving(true);
    try {
      const driContract = getContract({
        client,
        chain: etoMainnet,
        address: DRI_TOKEN_ADDRESS,
        abi: ERC20_ABI,
      });

      const amountWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 18)); // DRI has 18 decimals

      const transaction = prepareContractCall({
        contract: driContract,
        method: "approve",
        params: [DMM_ADDRESS, amountWei],
      });

      await sendTransaction({
        transaction,
        account,
      });

      toast.success('DRI approved for trading!');
      
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error approving DRI:', error);
      toast.error('Failed to approve DRI');
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [account, queryClient]);

  // Execute buy trade (USDC -> DRI) using DMM.swap()
  const buyDRI = useCallback(async (usdcAmount: string, minDriOut?: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    try {
      const dmmContract = getContract({
        client,
        chain: etoMainnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const usdcAmountWei = BigInt(Math.floor(parseFloat(usdcAmount) * 10 ** 6)); // USDC has 6 decimals
      // Default 1% slippage if not provided
      const minOut = minDriOut 
        ? BigInt(Math.floor(parseFloat(minDriOut) * 10 ** 18))
        : BigInt(0); // 0 = no slippage protection

      // V4 DMM uses swap(tokenIn, amountIn, minAmountOut)
      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "swap",
        params: [USDC_ADDRESS, usdcAmountWei, minOut],
      });

      await sendTransaction({
        transaction,
        account,
      });

      toast.success(`Successfully bought DRI with ${usdcAmount} USDC!`);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error buying DRI:', error);
      toast.error('Failed to buy DRI');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account, queryClient]);

  // Execute sell trade (DRI -> USDC) using DMM.swap()
  const sellDRI = useCallback(async (driAmount: string, minUsdcOut?: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    try {
      const dmmContract = getContract({
        client,
        chain: etoMainnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const driAmountWei = BigInt(Math.floor(parseFloat(driAmount) * 10 ** 18)); // DRI has 18 decimals
      // Default 1% slippage if not provided
      const minOut = minUsdcOut 
        ? BigInt(Math.floor(parseFloat(minUsdcOut) * 10 ** 6))
        : BigInt(0); // 0 = no slippage protection

      // V4 DMM uses swap(tokenIn, amountIn, minAmountOut)
      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "swap",
        params: [DRI_TOKEN_ADDRESS, driAmountWei, minOut],
      });

      await sendTransaction({
        transaction,
        account,
      });

      toast.success(`Successfully sold ${driAmount} DRI!`);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error selling DRI:', error);
      toast.error('Failed to sell DRI');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account, queryClient]);

  // Check USDC allowance
  const checkUSDCAllowance = useCallback(async (): Promise<string> => {
    if (!account) return '0';

    try {
      const usdcContract = getContract({
        client,
        chain: etoMainnet,
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
      });

      const allowance = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [account.address, DMM_ADDRESS],
      });

      return (Number(allowance) / 10 ** 6).toString();
    } catch (error) {
      console.error('Error checking USDC allowance:', error);
      return '0';
    }
  }, [account]);

  // Check DRI allowance
  const checkDRIAllowance = useCallback(async (): Promise<string> => {
    if (!account) return '0';

    try {
      const driContract = getContract({
        client,
        chain: etoMainnet,
        address: DRI_TOKEN_ADDRESS,
        abi: ERC20_ABI,
      });

      const allowance = await readContract({
        contract: driContract,
        method: "allowance",
        params: [account.address, DMM_ADDRESS],
      });

      return (Number(allowance) / 10 ** 18).toString();
    } catch (error) {
      console.error('Error checking DRI allowance:', error);
      return '0';
    }
  }, [account]);

  // Get current market price
  const getCurrentPrice = useCallback(async (): Promise<string> => {
    try {
      const dmmContract = getContract({
        client,
        chain: etoMainnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const priceWei = await readContract({
        contract: dmmContract,
        method: "getCurrentPrice",
        params: [],
      });

      return (Number(priceWei) / 10 ** 18).toFixed(2);
    } catch (error) {
      console.error('Error getting current price:', error);
      return '0';
    }
  }, []);

  return {
    getBuyQuote,
    getSellQuote,
    buyDRI,
    sellDRI,
    approveUSDC,
    approveDRI,
    checkUSDCAllowance,
    checkDRIAllowance,
    getCurrentPrice,
    isLoading,
    isApproving,
    // Legacy aliases for backwards compatibility
    buyTokens: buyDRI,
    sellTokens: sellDRI,
    approveMUSDC: approveUSDC,
    checkAllowance: checkUSDCAllowance,
  };
}
