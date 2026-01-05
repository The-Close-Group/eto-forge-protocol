import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/thirdweb";
import { getContract, getRpcClient, eth_getBalance } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { getEtoBalance, getEtoTokenBalance } from "@/lib/etoRpc";
import { useActiveAccount } from "thirdweb/react";
import { useUserState } from "@/contexts/UserStateContext";
import { useCallback } from "react";
import { CHAIN_CONFIGS, getAllTokensForChain, DEFAULT_CHAIN, SUPPORTED_CHAINS } from "@/config/tokens";
import { usePrices } from "./usePrices";

export interface MultiChainBalance {
  symbol: string;
  balance: string;
  decimals: number;
  isNative: boolean;
  usdValue: string;
  chainName: string;
  chainKey: string;
}

export function useBalances(enabledChains: string[] = [DEFAULT_CHAIN]) {
  const account = useActiveAccount();
  const address = account?.address;
  
  // Use the new user state system
  const userState = useUserState();
  
  // Get price data for USD value calculations
  const { getTokenPrice } = usePrices();

  // Validate and filter enabled chains
  const validEnabledChains = enabledChains.filter(chain => SUPPORTED_CHAINS.includes(chain));

  // Multi-chain blockchain balance query (native + ERC20 tokens)
  const { data: blockchainBalances, isLoading: isLoadingBlockchain } = useQuery({
    queryKey: ["multi-chain-balances", address, validEnabledChains.join(",")],
    enabled: !!address && validEnabledChains.length > 0, // Enable when wallet is connected
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address || validEnabledChains.length === 0) return [];

      const allResults: MultiChainBalance[] = [];

      // Fetch balances from all enabled chains
      for (const chainKey of validEnabledChains) {
        const chainConfig = CHAIN_CONFIGS[chainKey];
        if (!chainConfig) continue;

        try {
          // Fetch native token balance
          try {
            let nativeBalance: bigint;
            
            // Use direct RPC for ETO L1 (chainKey === 'etoMainnet')
            if (chainKey === 'etoMainnet') {
              nativeBalance = await getEtoBalance(address as `0x${string}`);
            } else {
              const rpcRequest = getRpcClient({ client, chain: chainConfig.chain });
              nativeBalance = await eth_getBalance(rpcRequest, { address });
            }
            
            const formatted = Number(nativeBalance) / 10 ** chainConfig.nativeToken.decimals;
            
            const price = getTokenPrice(chainConfig.nativeToken.symbol);
            const usdValue = formatted * price;
            
            allResults.push({
              symbol: chainConfig.nativeToken.symbol,
              balance: formatted.toFixed(4),
              decimals: chainConfig.nativeToken.decimals,
              isNative: true,
              usdValue: usdValue.toFixed(2),
              chainName: chainConfig.name,
              chainKey,
            });
          } catch (error) {
            console.warn(`Failed to fetch native balance for ${chainConfig.nativeToken.symbol} on ${chainConfig.name}:`, error);
            
            allResults.push({
              symbol: chainConfig.nativeToken.symbol,
              balance: "0.0000",
              decimals: chainConfig.nativeToken.decimals,
              isNative: true,
              usdValue: "0.00",
              chainName: chainConfig.name,
              chainKey,
            });
          }

          // Fetch ERC20 token balances
          for (const token of chainConfig.tokens) {
            try {
              let balance: bigint;
              
              // Use direct RPC for ETO L1
              if (chainKey === 'etoMainnet') {
                balance = await getEtoTokenBalance(
                  token.address as `0x${string}`,
                  address as `0x${string}`
                );
              } else {
                const contract = getContract({ 
                  client, 
                  chain: chainConfig.chain, 
                  address: token.address 
                });
                balance = await balanceOf({ contract, address });
              }
              
              const formatted = Number(balance) / 10 ** token.decimals;
              const price = getTokenPrice(token.symbol);
              const usdValue = formatted * price;
              
              allResults.push({
                symbol: token.symbol,
                balance: formatted.toFixed(4),
                decimals: token.decimals,
                isNative: false,
                usdValue: usdValue.toFixed(2),
                chainName: chainConfig.name,
                chainKey,
              });
            } catch (error) {
              console.warn(`Failed to fetch balance for ${token.symbol} on ${chainConfig.name}:`, error);
              allResults.push({
                symbol: token.symbol,
                balance: "0.0000",
                decimals: token.decimals,
                isNative: false,
                usdValue: "0.00",
                chainName: chainConfig.name,
                chainKey,
              });
            }
          }
        } catch (chainError) {
          console.warn(`Failed to fetch balances from ${chainConfig.name}:`, chainError);
        }
      }
      
      return allResults;
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

  // Calculate total portfolio value including blockchain balances
  const getTotalPortfolioValueWithBlockchain = useCallback((): number => {
    const userStateTotal = getTotalPortfolioValue();
    const blockchainTotal = blockchainBalances?.reduce((total, balance) => {
      return total + parseFloat(balance.usdValue);
    }, 0) || 0;
    
    return userStateTotal + blockchainTotal;
  }, [getTotalPortfolioValue, blockchainBalances]);

  return {
    // Enhanced balance management
    balances: getAllBalances(),
    getBalance,
    getAvailableBalance,
    getTotalPortfolioValue,
    getTotalPortfolioValueWithBlockchain,
    validateAmount,
    formatAmount,
    parseAmount,
    updateBalance,
    
    // Legacy compatibility
    legacyBalances,
    
    // Enhanced blockchain data with native tokens
    blockchainBalances: blockchainBalances || [],
    isLoadingBlockchain,
    
    // Enhanced multi-chain helper functions
    getBlockchainBalance: (symbol: string, chainKey?: string) => {
      if (chainKey) {
        return blockchainBalances?.find(b => b.symbol === symbol && b.chainKey === chainKey)?.balance || "0.0000";
      }
      return blockchainBalances?.find(b => b.symbol === symbol)?.balance || "0.0000";
    },
    getBlockchainUsdValue: (symbol: string, chainKey?: string) => {
      if (chainKey) {
        return blockchainBalances?.find(b => b.symbol === symbol && b.chainKey === chainKey)?.usdValue || "0.00";
      }
      return blockchainBalances?.find(b => b.symbol === symbol)?.usdValue || "0.00";
    },
    getBalancesByChain: (chainKey: string) => {
      return blockchainBalances?.filter(b => b.chainKey === chainKey) || [];
    },
    getNativeTokenBalance: (chainKey: string) => {
      return blockchainBalances?.find(b => b.chainKey === chainKey && b.isNative);
    },
    getTotalValueByChain: (chainKey: string) => {
      return blockchainBalances
        ?.filter(b => b.chainKey === chainKey)
        .reduce((total, balance) => total + parseFloat(balance.usdValue), 0) || 0;
    },
    
    // Chain information  
    enabledChains: validEnabledChains,
    allSupportedChains: SUPPORTED_CHAINS,
    getTokensForChain: (chainKey: string) => getAllTokensForChain(chainKey),
    
    // Loading state - use user state loading
    isLoading: userState.isLoading || isLoadingBlockchain
  } as const;
}

// Helper functions for asset metadata using token registry
function getAssetName(symbol: string): string {
  // Search through all chain configs for the token
  for (const chainConfig of Object.values(CHAIN_CONFIGS)) {
    // Check native token
    if (chainConfig.nativeToken.symbol === symbol) {
      return chainConfig.nativeToken.name;
    }
    
    // Check ERC20 tokens
    const token = chainConfig.tokens.find(t => t.symbol === symbol);
    if (token) {
      return token.name;
    }
  }
  
  // Fallback for unknown tokens
  return symbol;
}

function getAssetDecimals(symbol: string): number {
  // Search through all chain configs for the token
  for (const chainConfig of Object.values(CHAIN_CONFIGS)) {
    // Check native token
    if (chainConfig.nativeToken.symbol === symbol) {
      return chainConfig.nativeToken.decimals;
    }
    
    // Check ERC20 tokens
    const token = chainConfig.tokens.find(t => t.symbol === symbol);
    if (token) {
      return token.decimals;
    }
  }
  
  // Fallback for unknown tokens
  return 18;
}
