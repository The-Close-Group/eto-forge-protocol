import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserBalances } from "./useUserBalances";
import { useWallet } from "./useWallet";

export interface TradeParams {
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  executionPrice: number;
  orderId?: string;
}

export function useTradeExecution() {
  const { user } = useAuth();
  const { updateBalance } = useUserBalances();
  const { walletAddress } = useWallet();
  const queryClient = useQueryClient();

  const executeTradeTransaction = useMutation({
    mutationFn: async (params: TradeParams) => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!walletAddress) throw new Error("Wallet not connected");

      const { fromAsset, toAsset, fromAmount, toAmount, executionPrice, orderId } = params;

      // Simulate blockchain transaction
      const transactionHash = generateMockTxHash();

      // Record trade in database
      const { data: trade, error } = await supabase
        .from("trade_history")
        .insert({
          user_id: user.id,
          from_asset: fromAsset,
          to_asset: toAsset,
          from_amount: fromAmount,
          to_amount: toAmount,
          execution_price: executionPrice,
          transaction_hash: transactionHash,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      // Update user balances
      updateBalance(fromAsset, -fromAmount);
      updateBalance(toAsset, toAmount);

      return { trade, transactionHash };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      queryClient.invalidateQueries({ queryKey: ["trade-history"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-snapshots"] });
    },
  });

  return {
    executeTrade: executeTradeTransaction.mutateAsync,
    isExecuting: executeTradeTransaction.isPending,
    error: executeTradeTransaction.error,
  };
}

function generateMockTxHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}