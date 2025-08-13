import { useQuery } from "@tanstack/react-query";
import { client, ethereum } from "@/lib/thirdweb";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useActiveAccount } from "thirdweb/react";

const TOKENS = [
  // USDC mainnet
  { symbol: "USDC", address: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606eb48", decimals: 6 },
  // WETH mainnet
  { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
];

export function useBalances() {
  const account = useActiveAccount();
  const address = account?.address;

  const { data, isLoading } = useQuery({
    queryKey: ["balances", address],
    enabled: !!address,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address) return { totalUSD: 0, tokens: [] as Array<{ symbol: string; balance: string }> };

      // For demo, fetch ERC20 balances; native balance conversion omitted for simplicity
      const results: Array<{ symbol: string; balance: string }> = [];
      for (const t of TOKENS) {
        const contract = getContract({ client, chain: ethereum, address: t.address });
        const bal = await balanceOf({ contract, address });
        const formatted = Number(bal) / 10 ** t.decimals;
        results.push({ symbol: t.symbol, balance: formatted.toFixed(4) });
      }
      return { totalUSD: 0, tokens: results };
    },
  });

  return { balances: data, isLoading } as const;
}
