import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface UserBalance {
  id: string;
  asset_symbol: string;
  balance: number;
  reserved_amount: number;
  available_balance: number;
  usd_value: number;
  price: number;
}

// Market prices for assets
const ASSET_PRICES: Record<string, number> = {
  USDC: 1.00,
  ETH: 3567.00,
  WETH: 3567.00,
  MAANG: 238.00,
  AVAX: 26.00,
  BTC: 45000.00
};

// Asset metadata
const ASSET_INFO: Record<string, { name: string; decimals: number }> = {
  USDC: { name: "USD Coin", decimals: 6 },
  ETH: { name: "Ethereum", decimals: 18 },
  WETH: { name: "Wrapped Ethereum", decimals: 18 },
  MAANG: { name: "Meta AI & Analytics", decimals: 18 },
  AVAX: { name: "Avalanche", decimals: 18 },
  BTC: { name: "Bitcoin", decimals: 8 }
};

export function useUserBalances() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user balances from database
  const { data: balances = [], isLoading, error } = useQuery({
    queryKey: ["user-balances", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      // Transform database balances to include calculated fields
      return data.map((balance): UserBalance => {
        const price = ASSET_PRICES[balance.asset_symbol] || 0;
        const balanceNum = Number(balance.balance);
        const reservedNum = Number(balance.reserved_amount);
        
        return {
          id: balance.id,
          asset_symbol: balance.asset_symbol,
          balance: balanceNum,
          reserved_amount: reservedNum,
          available_balance: balanceNum - reservedNum,
          price,
          usd_value: balanceNum * price
        };
      });
    },
  });

  // Update balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ asset_symbol, balance_change }: { asset_symbol: string; balance_change: number }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // First, try to get existing balance
      const { data: existingBalance } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset_symbol", asset_symbol)
        .single();

      if (existingBalance) {
        // Update existing balance
        const newBalance = Number(existingBalance.balance) + balance_change;
        const { error } = await supabase
          .from("user_balances")
          .update({ balance: Math.max(0, newBalance) })
          .eq("id", existingBalance.id);

        if (error) throw error;
      } else {
        // Create new balance record
        const { error } = await supabase
          .from("user_balances")
          .insert({
            user_id: user.id,
            asset_symbol,
            balance: Math.max(0, balance_change)
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
    },
  });

  // Reserve balance mutation  
  const reserveBalanceMutation = useMutation({
    mutationFn: async ({ asset_symbol, amount }: { asset_symbol: string; amount: number }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: balance } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset_symbol", asset_symbol)
        .single();

      if (!balance) throw new Error(`No balance found for ${asset_symbol}`);

      const currentReserved = Number(balance.reserved_amount);
      const availableBalance = Number(balance.balance) - currentReserved;

      if (availableBalance < amount) {
        throw new Error(`Insufficient balance. Available: ${availableBalance}, Required: ${amount}`);
      }

      const { error } = await supabase
        .from("user_balances")
        .update({ reserved_amount: currentReserved + amount })
        .eq("id", balance.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
    },
  });

  // Helper functions
  const getBalance = useCallback((asset_symbol: string): UserBalance | null => {
    return balances.find(b => b.asset_symbol === asset_symbol) || null;
  }, [balances]);

  const getAvailableBalance = useCallback((asset_symbol: string): number => {
    const balance = getBalance(asset_symbol);
    return balance ? balance.available_balance : 0;
  }, [getBalance]);

  const getTotalPortfolioValue = useCallback((): number => {
    return balances.reduce((total, balance) => total + balance.usd_value, 0);
  }, [balances]);

  const updateBalance = useCallback((asset_symbol: string, change: number) => {
    updateBalanceMutation.mutate({ asset_symbol, balance_change: change });
  }, [updateBalanceMutation]);

  const reserveBalance = useCallback((asset_symbol: string, amount: number) => {
    return reserveBalanceMutation.mutateAsync({ asset_symbol, amount });
  }, [reserveBalanceMutation]);

  const validateAmount = useCallback((asset_symbol: string, amount: number) => {
    if (amount <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    const availableBalance = getAvailableBalance(asset_symbol);
    if (amount > availableBalance) {
      return { 
        isValid: false, 
        error: `Insufficient balance. Available: ${availableBalance.toFixed(4)} ${asset_symbol}` 
      };
    }

    return { isValid: true };
  }, [getAvailableBalance]);

  const formatAmount = useCallback((amount: number, asset_symbol: string): string => {
    const info = ASSET_INFO[asset_symbol];
    const decimals = info?.decimals || 18;
    const displayDecimals = decimals > 6 ? 6 : decimals;
    return amount.toFixed(displayDecimals);
  }, []);

  return {
    balances,
    isLoading,
    error,
    getBalance,
    getAvailableBalance,
    getTotalPortfolioValue,
    updateBalance,
    reserveBalance,
    validateAmount,
    formatAmount,
    // Mutation states
    isUpdatingBalance: updateBalanceMutation.isPending,
    isReservingBalance: reserveBalanceMutation.isPending,
  };
}