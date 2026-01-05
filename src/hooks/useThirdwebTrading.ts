import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { client, etoMainnet } from '@/lib/thirdweb';
import { USDC_ADDRESS, DMM_ADDRESS, DMM_ABI, ERC20_ABI } from '@/config/contracts';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits, formatUnits } from 'ethers';

export interface TradeQuote {
  inputAmount: string;
  outputAmount: string;
  exchangeRate: string;
  priceImpact: string;
  estimatedGas: string;
}

export function useThirdwebTrading() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const usdcContract = getContract({
    client,
    chain: etoMainnet,
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
  });

  const dmmContract = getContract({
    client,
    chain: etoMainnet,
    address: DMM_ADDRESS,
    abi: DMM_ABI,
  });

  // Get trading quote for mUSDC -> MAANG
  const getTradeQuote = async (inputAmount: string): Promise<TradeQuote | null> => {
    if (!account?.address || !inputAmount || parseFloat(inputAmount) <= 0) {
      return null;
    }

    try {
      const amountWei = parseUnits(inputAmount, 6); // mUSDC has 6 decimals
      
      // Get buy price from DMM
      const outputAmountWei = await readContract({
        contract: dmmContract,
        method: "getBuyPrice",
        params: [amountWei],
      });

      const outputAmount = formatUnits(outputAmountWei as bigint, 18); // MAANG has 18 decimals
      const exchangeRate = (parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6);
      
      // Calculate price impact (simplified)
      const spotPrice = await readContract({
        contract: dmmContract,
        method: "getSpotPrice",
        params: [],
      });
      
      const spotPriceFormatted = Number(spotPrice) / 10 ** 18;
      const executionPrice = parseFloat(outputAmount) / parseFloat(inputAmount);
      const priceImpact = Math.abs((executionPrice - spotPriceFormatted) / spotPriceFormatted * 100).toFixed(2);

      return {
        inputAmount,
        outputAmount,
        exchangeRate,
        priceImpact: `${priceImpact}%`,
        estimatedGas: "~0.002 ETH", // Estimate
      };
    } catch (error) {
      console.error("Failed to get trade quote:", error);
      return null;
    }
  };

  // Check if mUSDC approval is needed
  const checkApproval = async (amount: string): Promise<boolean> => {
    if (!account?.address) return false;

    try {
      const amountWei = parseUnits(amount, 6);
      const allowance = await readContract({
        contract: mUSDCContract,
        method: "allowance",
        params: [account.address, DMM_ADDRESS],
      });

      return (allowance as bigint) >= amountWei;
    } catch (error) {
      console.error("Failed to check approval:", error);
      return false;
    }
  };

  // Approve mUSDC for trading
  const approveToken = async (amount: string): Promise<boolean> => {
    if (!account) {
      toast.error("Please connect your wallet.");
      return false;
    }

    setIsApproving(true);
    try {
      const amountWei = parseUnits(amount, 6);
      const transaction = prepareContractCall({
        contract: mUSDCContract,
        method: "approve",
        params: [DMM_ADDRESS, amountWei],
      });

      await sendTransaction({ transaction, account });
      toast.success("mUSDC approved for trading!");
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error: unknown) {
      console.error("Approval failed:", error);
      toast.error(`Approval failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  // Execute trade: mUSDC -> MAANG
  const executeBuyTrade = async (usdcAmount: string): Promise<boolean> => {
    if (!account) {
      toast.error("Please connect your wallet.");
      return false;
    }

    setIsLoading(true);
    try {
      const amountWei = parseUnits(usdcAmount, 6);
      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "buyTokens",
        params: [amountWei],
      });

      await sendTransaction({ transaction, account });
      toast.success(`Successfully bought MAANG with ${usdcAmount} mUSDC!`);
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error: unknown) {
      console.error("Trade execution failed:", error);
      toast.error(`Trade failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute trade: MAANG -> mUSDC
  const executeSellTrade = async (maangAmount: string): Promise<boolean> => {
    if (!account) {
      toast.error("Please connect your wallet.");
      return false;
    }

    setIsLoading(true);
    try {
      const amountWei = parseUnits(maangAmount, 18);
      const transaction = prepareContractCall({
        contract: dmmContract,
        method: "sellTokens",
        params: [amountWei],
      });

      await sendTransaction({ transaction, account });
      toast.success(`Successfully sold ${maangAmount} MAANG!`);
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      
      return true;
    } catch (error: unknown) {
      console.error("Trade execution failed:", error);
      toast.error(`Trade failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user balances
  const getBalances = async () => {
    if (!account?.address) return { mUSDC: "0", MAANG: "0" };

    try {
      const [mUSDCBalance, maangBalance] = await Promise.all([
        readContract({
          contract: mUSDCContract,
          method: "balanceOf",
          params: [account.address],
        }),
        readContract({
          contract: dmmContract, // DMM contract also acts as MAANG token
          method: "balanceOf",
          params: [account.address],
        }),
      ]);

      return {
        mUSDC: formatUnits(mUSDCBalance as bigint, 6),
        MAANG: formatUnits(maangBalance as bigint, 18),
      };
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      return { mUSDC: "0", MAANG: "0" };
    }
  };

  return {
    isLoading,
    isApproving,
    getTradeQuote,
    checkApproval,
    approveToken,
    executeBuyTrade,
    executeSellTrade,
    getBalances,
  };
}
