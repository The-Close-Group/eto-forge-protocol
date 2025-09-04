import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { client, etoTestnet } from '@/lib/thirdweb';
import { MOCK_USDC_ADDRESS, DMM_ADDRESS, DMM_ABI, ERC20_ABI } from '@/config/contracts';
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

  // Get buy quote (mUSDC -> MAANG)
  const getBuyQuote = useCallback(async (usdcAmount: string): Promise<SwapQuote | null> => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return null;

    try {
      const dmmContract = getContract({
        client,
        chain: etoTestnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const usdcAmountWei = BigInt(parseFloat(usdcAmount) * 10 ** 6); // mUSDC has 6 decimals
      
      const outputAmountWei = await readContract({
        contract: dmmContract,
        method: "getBuyPrice",
        params: [usdcAmountWei],
      });

      const outputAmount = (Number(outputAmountWei) / 10 ** 18).toFixed(6); // MAANG has 18 decimals
      const price = (parseFloat(usdcAmount) / parseFloat(outputAmount)).toFixed(6);
      const priceImpact = "0.1"; // You can calculate this based on spot price vs execution price
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

  // Get sell quote (MAANG -> mUSDC)
  const getSellQuote = useCallback(async (maangAmount: string): Promise<SwapQuote | null> => {
    if (!maangAmount || parseFloat(maangAmount) <= 0) return null;

    try {
      const dmmContract = getContract({
        client,
        chain: etoTestnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const maangAmountWei = BigInt(parseFloat(maangAmount) * 10 ** 18); // MAANG has 18 decimals
      
      const outputAmountWei = await readContract({
        contract: dmmContract,
        method: "getSellPrice",
        params: [maangAmountWei],
      });

      const outputAmount = (Number(outputAmountWei) / 10 ** 6).toFixed(6); // mUSDC has 6 decimals
      const price = (parseFloat(outputAmount) / parseFloat(maangAmount)).toFixed(6);
      const priceImpact = "0.1";
      const minimumReceived = (parseFloat(outputAmount) * 0.99).toFixed(6); // 1% slippage

      return {
        inputAmount: maangAmount,
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

  // Check and approve mUSDC spending
  const approveMUSDC = useCallback(async (amount: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsApproving(true);
    try {
      const usdcContract = getContract({
        client,
        chain: etoTestnet,
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
      });

      const amountWei = BigInt(parseFloat(amount) * 10 ** 6); // mUSDC has 6 decimals

      const transaction = prepareContractCall({
        contract: usdcContract,
        method: "approve",
        params: [DMM_ADDRESS, amountWei],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      toast.success('mUSDC approved for trading!');
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error approving mUSDC:', error);
      toast.error('Failed to approve mUSDC');
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [account]);

  // Execute buy trade (mUSDC -> MAANG)
  const buyTokens = useCallback(async (usdcAmount: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    try {
      const dmmContract = getContract({
        client,
        chain: etoTestnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const usdcAmountWei = BigInt(parseFloat(usdcAmount) * 10 ** 6); // mUSDC has 6 decimals

      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "buyTokens",
        params: [usdcAmountWei],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      toast.success(`Successfully bought MAANG tokens with ${usdcAmount} mUSDC!`);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error buying tokens:', error);
      toast.error('Failed to buy tokens');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Execute sell trade (MAANG -> mUSDC)
  const sellTokens = useCallback(async (maangAmount: string): Promise<boolean> => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    try {
      const dmmContract = getContract({
        client,
        chain: etoTestnet,
        address: DMM_ADDRESS,
        abi: DMM_ABI,
      });

      const maangAmountWei = BigInt(parseFloat(maangAmount) * 10 ** 18); // MAANG has 18 decimals

      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "sellTokens",
        params: [maangAmountWei],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      toast.success(`Successfully sold ${maangAmount} MAANG tokens!`);
      
      // Invalidate balance queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error) {
      console.error('Error selling tokens:', error);
      toast.error('Failed to sell tokens');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Check mUSDC allowance
  const checkAllowance = useCallback(async (): Promise<string> => {
    if (!account) return '0';

    try {
      const usdcContract = getContract({
        client,
        chain: etoTestnet,
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
      });

      const allowance = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [account.address, DMM_ADDRESS],
      });

      return (Number(allowance) / 10 ** 6).toString(); // Convert to readable format
    } catch (error) {
      console.error('Error checking allowance:', error);
      return '0';
    }
  }, [account]);

  return {
    getBuyQuote,
    getSellQuote,
    buyTokens,
    sellTokens,
    approveMUSDC,
    checkAllowance,
    isLoading,
    isApproving,
  };
}
