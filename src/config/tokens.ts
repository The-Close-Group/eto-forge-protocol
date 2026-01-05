import { etoMainnet } from "@/lib/thirdweb";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;  
  decimals: number;
  isNative?: boolean;
  coingeckoId?: string; // For price fetching
  logoUri?: string;
}

import type { Chain } from "thirdweb/chains";

export interface ChainConfig {
  chain: Chain; // Thirdweb chain object
  name: string;
  nativeToken: TokenInfo;
  tokens: TokenInfo[];
  rpcUrls: string[];
  blockExplorer: string;
}

// Native token definitions - ETO L1 Only
const NATIVE_TOKENS: Record<string, TokenInfo> = {
  ETO_ETH: {
    symbol: "ETH",
    name: "Ether",
    address: "NATIVE",
    decimals: 18,
    isNative: true,
    coingeckoId: "ethereum",
  },
};

// ERC20 token definitions - ETO L1 Native Assets Only
const ERC20_TOKENS: Record<string, TokenInfo[]> = {
  // ETO L1 Mainnet - V4 Production Deployment
  etoMainnet: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x98e3B2a66A8Bf81A716A02b1379D082772e524E5", // V10
      decimals: 6,
      coingeckoId: "usd-coin",
      logoUri: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040",
    },
    {
      symbol: "MAANG",
      name: "MAANG Token",
      address: "0x5e0CBA25D4Acd25014b77E4c7908Cf1e2DA73EF8", // V10
      decimals: 18,
      coingeckoId: null, // MAANG index token
      logoUri: "/assets/maang-logo.svg",
    },
    {
      symbol: "sMAANG",
      name: "Staked MAANG",
      address: "0x0000000000000000000000000000000000000000", // Placeholder - staking receipt token
      decimals: 18,
      coingeckoId: null,
      logoUri: "/assets/maang-logo.svg",
    },
  ],
};

// Complete chain configurations - ETO L1 Only
export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  // ETO L1 Mainnet - Production
  etoMainnet: {
    chain: etoMainnet,
    name: "ETO L1",
    nativeToken: NATIVE_TOKENS.ETO_ETH,
    tokens: ERC20_TOKENS.etoMainnet,
    rpcUrls: [
      "https://eto.ash.center/rpc",
    ],
    blockExplorer: "https://eto-explorer.ash.center",
  },
};

// Helper functions
export function getTokenBySymbol(chainKey: string, symbol: string): TokenInfo | null {
  const config = CHAIN_CONFIGS[chainKey];
  if (!config) return null;
  
  // Check native token
  if (config.nativeToken.symbol === symbol) {
    return config.nativeToken;
  }
  
  // Check ERC20 tokens
  return config.tokens.find(token => token.symbol === symbol) || null;
}

export function getAllTokensForChain(chainKey: string): TokenInfo[] {
  const config = CHAIN_CONFIGS[chainKey];
  if (!config) return [];
  
  return [config.nativeToken, ...config.tokens];
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_CONFIGS);
}

export function getTokensWithCoingeckoId(): TokenInfo[] {
  const allTokens: TokenInfo[] = [];
  
  Object.values(CHAIN_CONFIGS).forEach(config => {
    // Add native token if it has coingeckoId
    if (config.nativeToken.coingeckoId) {
      allTokens.push(config.nativeToken);
    }
    
    // Add ERC20 tokens with coingeckoId
    config.tokens.forEach(token => {
      if (token.coingeckoId) {
        allTokens.push(token);
      }
    });
  });
  
  return allTokens;
}

// Export specific configurations for easy access
export const SUPPORTED_CHAINS = Object.keys(CHAIN_CONFIGS);
export const DEFAULT_CHAIN = "etoMainnet"; // Default to ETO L1 mainnet for production

// Supported tokens list for UI
export const SUPPORTED_TOKENS = {
  MAANG: {
    symbol: "MAANG",
    name: "MAANG Token",
    description: "Dynamic Reflective Index Token",
    logoUri: "/assets/maang-logo.svg",
  },
  sMAANG: {
    symbol: "sMAANG",
    name: "Staked MAANG",
    description: "Yield-bearing MAANG Receipt",
    logoUri: "/assets/maang-logo.svg",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    description: "Stablecoin pegged to USD",
    logoUri: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040",
  },
};
