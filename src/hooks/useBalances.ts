import { useQuery } from "@tanstack/react-query";
import { client, ethereum } from "@/lib/thirdweb";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useActiveAccount } from "thirdweb/react";
import { useUserState } from "@/contexts/UserStateContext";
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
  
  // Use the new user state system
  const userState = useUserState();

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

  // Enhanced balance management with reservations - now redirects to user state
  const getAllBalances = useCallback(() => {
    return userState.balances.map(balance => ({
      symbol: balance.asset_symbol,
      name: getAssetName(balance.asset_symbol),
      balance: balance.balance,
      decimals: getAssetDecimals(balance.asset_symbol),
      reservedAmount: balance.reserved_amount,
      availableBalance: balance.available_balance,
      usdValue: balance.usd_value,
      price: balance.price
    }));
  }, [userState.balances]);

  const getBalance = useCallback((asset: string) => {
    const balance = userState.getBalance(asset);
    if (!balance) return null;
    
    return {
      symbol: balance.asset_symbol,
      name: getAssetName(balance.asset_symbol),
      balance: balance.balance,
      decimals: getAssetDecimals(balance.asset_symbol),
      reservedAmount: balance.reserved_amount,
      availableBalance: balance.available_balance,
      usdValue: balance.usd_value,
      price: balance.price
    };
  }, [userState.getBalance]);

  const getAvailableBalance = useCallback((asset: string): number => {
    return userState.getAvailableBalance(asset);
  }, [userState.getAvailableBalance]);

  const getTotalPortfolioValue = useCallback((): number => {
    return userState.getTotalPortfolioValue();
  }, [userState.getTotalPortfolioValue]);

  const validateAmount = useCallback((asset: string, amount: number) => {
    return userState.validateAmount(asset, amount);
  }, [userState.validateAmount]);

  const formatAmount = useCallback((amount: number, asset: string): string => {
    return userState.formatAmount(amount, asset);
  }, [userState.formatAmount]);

  const parseAmount = useCallback((amountStr: string): number => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) throw new Error("Invalid amount format");
    return amount;
  }, []);

  const updateBalance = useCallback((asset: string, change: number): void => {
    userState.updateBalance(asset, change);
  }, [userState.updateBalance]);

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
    
    // Loading state - use user state loading
    isLoading: userState.isLoading || isLoadingBlockchain
  } as const;
}

// Helper functions for asset metadata
function getAssetName(symbol: string): string {
  const names: Record<string, string> = {
    USDC: "USD Coin",
    ETH: "Ethereum", 
    WETH: "Wrapped Ethereum",
    MAANG: "Meta AI & Analytics",
    AVAX: "Avalanche",
    BTC: "Bitcoin"
  };
  return names[symbol] || symbol;
}

function getAssetDecimals(symbol: string): number {
  const decimals: Record<string, number> = {
    USDC: 6,
    ETH: 18,
    WETH: 18, 
    MAANG: 18,
    AVAX: 18,
    BTC: 8
  };
  return decimals[symbol] || 18;
}
