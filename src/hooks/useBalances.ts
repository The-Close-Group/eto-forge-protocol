import { useQuery } from "@tanstack/react-query";
import { client, ethereum } from "@/lib/thirdweb";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useActiveAccount } from "thirdweb/react";
import { balanceManager, AssetBalance } from "@/lib/balanceManager";
import { useCallback } from "react";

const BLOCKCHAIN_TOKENS = [
  // USDC mainnet
  { symbol: "USDC", address: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606eb48", decimals: 6 },
  // WETH mainnet
  { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
];

export function useBalances() {
  const account = useActiveAccount();
  const address = account?.address;

  // Blockchain balance query (for real tokens)
  const { data: blockchainBalances, isLoading: isLoadingBlockchain } = useQuery({
    queryKey: ["blockchain-balances", address],
    enabled: !!address,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address) return [];

      const results: Array<{ symbol: string; balance: string; decimals: number }> = [];
      for (const t of BLOCKCHAIN_TOKENS) {
        try {
          const contract = getContract({ client, chain: ethereum, address: t.address });
          const bal = await balanceOf({ contract, address });
          const formatted = Number(bal) / 10 ** t.decimals;
          results.push({ symbol: t.symbol, balance: formatted.toFixed(4), decimals: t.decimals });
        } catch (error) {
          console.warn(`Failed to fetch balance for ${t.symbol}:`, error);
          results.push({ symbol: t.symbol, balance: "0.0000", decimals: t.decimals });
        }
      }
      return results;
    },
  });

  // Enhanced balance management with reservations
  const getAllBalances = useCallback((): AssetBalance[] => {
    return balanceManager.getAllBalances();
  }, []);

  const getBalance = useCallback((asset: string): AssetBalance | null => {
    return balanceManager.getBalance(asset);
  }, []);

  const getAvailableBalance = useCallback((asset: string): number => {
    return balanceManager.getAvailableBalance(asset);
  }, []);

  const getTotalPortfolioValue = useCallback((): number => {
    return balanceManager.getTotalPortfolioValue();
  }, []);

  const validateAmount = useCallback((asset: string, amount: number) => {
    return balanceManager.validateAmount(asset, amount);
  }, []);

  const formatAmount = useCallback((amount: number, asset: string): string => {
    return balanceManager.formatAmount(amount, asset);
  }, []);

  const parseAmount = useCallback((amountStr: string): number => {
    return balanceManager.parseAmount(amountStr);
  }, []);

  const updateBalance = useCallback((asset: string, change: number): void => {
    balanceManager.updateBalance(asset, change);
  }, []);

  // Legacy format for compatibility
  const legacyBalances = {
    totalUSD: getTotalPortfolioValue(),
    tokens: getAllBalances().map(balance => ({
      symbol: balance.symbol,
      balance: balance.balance.toString(),
      availableBalance: balance.availableBalance.toString(),
      reservedAmount: balance.reservedAmount.toString(),
      usdValue: balance.usdValue.toString()
    }))
  };

  return {
    // Enhanced balance management
    balances: getAllBalances(),
    getBalance,
    getAvailableBalance,
    getTotalPortfolioValue,
    validateAmount,
    formatAmount,
    parseAmount,
    updateBalance,
    
    // Legacy compatibility
    legacyBalances,
    
    // Blockchain data
    blockchainBalances,
    isLoadingBlockchain,
    
    // Loading state
    isLoading: isLoadingBlockchain
  } as const;
}
