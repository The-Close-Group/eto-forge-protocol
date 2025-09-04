import { defineChain } from "thirdweb/chains";
import { ethereum, polygon, arbitrum, optimism, avalanche } from "thirdweb/chains";
import { etoTestnet } from "@/lib/thirdweb";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;  
  decimals: number;
  isNative?: boolean;
  coingeckoId?: string; // For price fetching
  logoUri?: string;
}

export interface ChainConfig {
  chain: any; // Thirdweb chain object
  name: string;
  nativeToken: TokenInfo;
  tokens: TokenInfo[];
  rpcUrls: string[];
  blockExplorer: string;
}

// Native token definitions
const NATIVE_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "NATIVE",
    decimals: 18,
    isNative: true,
    coingeckoId: "ethereum",
  },
  MATIC: {
    symbol: "MATIC", 
    name: "Polygon",
    address: "NATIVE",
    decimals: 18,
    isNative: true,
    coingeckoId: "matic-network",
  },
  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    address: "NATIVE", 
    decimals: 18,
    isNative: true,
    coingeckoId: "avalanche-2",
  },
  GOVDRI: {
    symbol: "GOVDRI",
    name: "GOVDRI Token",
    address: "NATIVE",
    decimals: 18,
    isNative: true,
    coingeckoId: null, // Custom token, no CoinGecko ID
  },
};

// ERC20 token definitions by chain
const ERC20_TOKENS: Record<string, TokenInfo[]> = {
  ethereum: [
    {
      symbol: "USDC",
      name: "USD Coin", 
      address: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606eb48",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 
      decimals: 18,
      coingeckoId: "weth",
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
      coingeckoId: "wrapped-bitcoin",
    },
  ],
  polygon: [
    {
      symbol: "USDC",
      name: "USD Coin (PoS)",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum (PoS)",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
      coingeckoId: "weth",
    },
  ],
  arbitrum: [
    {
      symbol: "USDC",
      name: "USD Coin (Arb1)",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      coingeckoId: "weth",
    },
  ],
  optimism: [
    {
      symbol: "USDC",
      name: "USD Coin (Optimism)",
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      coingeckoId: "weth",
    },
  ],
  avalanche: [
    {
      symbol: "USDC",
      name: "USD Coin (Avalanche)",
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      decimals: 18,
      coingeckoId: "weth",
    },
  ],
  etoTestnet: [
            {
          symbol: "mUSDC",
          name: "Mock USD Coin",
          address: "0xBDd8A29859C96EB305A012C2ae286782B063238c",
          decimals: 6,
          coingeckoId: null, // Custom token, not on CoinGecko
        },
    {
      symbol: "MAANG",
      name: "MAANG Token",
      address: "0xda60301ab3ffd71cc044f0b93d63745de7c815a3",
      decimals: 18,
      coingeckoId: null, // Custom DMM token
    },
    {
      symbol: "DRI",
      name: "DRI Token",
      address: "0xd84d467b36e38ea5fb488298ac24dd926cf17f92",
      decimals: 18,
      coingeckoId: null, // Custom DeFi token
    },
  ],
};

// Complete chain configurations
export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  ethereum: {
    chain: ethereum,
    name: "Ethereum",
    nativeToken: NATIVE_TOKENS.ETH,
    tokens: ERC20_TOKENS.ethereum,
    rpcUrls: [
      "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", // Replace with actual key
      "https://eth-mainnet.public.blastapi.io",
      "https://ethereum.publicnode.com",
    ],
    blockExplorer: "https://etherscan.io",
  },
  polygon: {
    chain: polygon,
    name: "Polygon",
    nativeToken: NATIVE_TOKENS.MATIC,
    tokens: ERC20_TOKENS.polygon,
    rpcUrls: [
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon",
      "https://polygon.publicnode.com",
    ],
    blockExplorer: "https://polygonscan.com",
  },
  arbitrum: {
    chain: arbitrum,
    name: "Arbitrum One",
    nativeToken: NATIVE_TOKENS.ETH,
    tokens: ERC20_TOKENS.arbitrum,
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
      "https://arbitrum.publicnode.com",
    ],
    blockExplorer: "https://arbiscan.io",
  },
  optimism: {
    chain: optimism,
    name: "Optimism",
    nativeToken: NATIVE_TOKENS.ETH,
    tokens: ERC20_TOKENS.optimism,
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism",
      "https://optimism.publicnode.com",
    ],
    blockExplorer: "https://optimistic.etherscan.io",
  },
  avalanche: {
    chain: avalanche,
    name: "Avalanche C-Chain",
    nativeToken: NATIVE_TOKENS.AVAX,
    tokens: ERC20_TOKENS.avalanche,
    rpcUrls: [
      "https://api.avax.network/ext/bc/C/rpc",
      "https://rpc.ankr.com/avalanche",
      "https://avalanche.publicnode.com",
    ],
    blockExplorer: "https://snowtrace.io",
  },
  etoTestnet: {
    chain: etoTestnet,
    name: "ETO Testnet",
    nativeToken: NATIVE_TOKENS.GOVDRI,
    tokens: ERC20_TOKENS.etoTestnet,
    rpcUrls: [
      "https://subnets.avax.network/eto/testnet/rpc",
    ],
    blockExplorer: "https://subnets-test.avax.network/eto",
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
export const DEFAULT_CHAIN = "etoTestnet"; // Default to ETO testnet for development
