import { etoMainnet } from "@/lib/thirdweb";

// =============================================================================
// ETO L1 Mainnet - V10 Paper Trading Deployment (Nov 26, 2025)
// Chain ID: 69420 | RPC: https://eto.ash.center/rpc
// Features: Paper trading mode enabled, oracle staleness checks bypassed
// =============================================================================
export const CONTRACTS = {
  // Core tokens
  MAANG_TOKEN: "0x5e0CBA25D4Acd25014b77E4c7908Cf1e2DA73EF8",
  GOVMAANG_TOKEN: "0x69a8C883aAE8faE6A8756e18582568ba5c879274",
  USDC: "0x98e3B2a66A8Bf81A716A02b1379D082772e524E5",
  
  // DeFi Protocol Contracts  
  DYNAMIC_MARKET_MAKER: "0x411c954D5874B2aB1d28740587AdE93a06EF05cB",
  ORACLE_AGGREGATOR: "0xf4cef743e2a505CDFd2a2Fb138920CDaa1297C86",
  BOOTSTRAP_MAANG_CONTROLLER: "0x6d1d273Ae139780268770Fb6D830d8BD7982D045",
  PEG_STABILITY_MODULE: "0x4b68e8ff7A27ef299f2a8c62adE766dd6F227e0E",
  
  // Vault (liquidity drip mechanism)
  SMAANG_VAULT: "0x8DBfEEF5bf229d5Da3E2302b332F8372E81d9291",
} as const;

// Legacy aliases for backwards compatibility
export const MOCK_USDC = CONTRACTS.USDC;
export const ORACLE = CONTRACTS.ORACLE_AGGREGATOR;

// Individual address exports for convenience
export const ORACLE_ADDRESS = CONTRACTS.ORACLE_AGGREGATOR;
export const DMM_ADDRESS = CONTRACTS.DYNAMIC_MARKET_MAKER;
export const DRI_TOKEN_ADDRESS = CONTRACTS.MAANG_TOKEN; // Keep old export name for compatibility
export const MAANG_TOKEN_ADDRESS = CONTRACTS.MAANG_TOKEN;
export const GOVDRI_TOKEN_ADDRESS = CONTRACTS.GOVMAANG_TOKEN; // Keep old export name for compatibility
export const GOVMAANG_TOKEN_ADDRESS = CONTRACTS.GOVMAANG_TOKEN;
export const USDC_ADDRESS = CONTRACTS.USDC;
export const BOOTSTRAP_DRI_CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_MAANG_CONTROLLER; // Keep old export name for compatibility
export const BOOTSTRAP_MAANG_CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_MAANG_CONTROLLER;
export const PEG_STABILITY_MODULE_ADDRESS = CONTRACTS.PEG_STABILITY_MODULE;
export const SMAANG_VAULT_ADDRESS = CONTRACTS.SMAANG_VAULT;

// Contract ABIs - V10 Production
export const ORACLE_ABI = [
  {
    "inputs": [],
    "name": "getAggregatedPrice",
    "outputs": [
      {"name": "price", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// V4 Dynamic Market Maker ABI (concentrated liquidity AMM)
export const DMM_ABI = [
  // Price functions
  {
    "inputs": [],
    "name": "getCurrentPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenIn", "type": "address"}, {"name": "amountIn", "type": "uint256"}],
    "name": "quote",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Swap function
  {
    "inputs": [
      {"name": "tokenIn", "type": "address"}, 
      {"name": "amountIn", "type": "uint256"}, 
      {"name": "minAmountOut", "type": "uint256"}
    ],
    "name": "swap",
    "outputs": [{"name": "amountOut", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Liquidity info
  {
    "inputs": [],
    "name": "getTotalLiquidity",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserLiquidity",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Token addresses
  {
    "inputs": [],
    "name": "driToken",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcToken",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // State
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Liquidity functions
  {
    "inputs": [
      {"name": "driAmount", "type": "uint256"}, 
      {"name": "usdcAmount", "type": "uint256"}, 
      {"name": "minLiquidityOut", "type": "uint256"}
    ],
    "name": "addLiquidity",
    "outputs": [{"name": "liquidity", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "liquidity", "type": "uint256"}],
    "name": "removeLiquidity",
    "outputs": [
      {"name": "driAmount", "type": "uint256"}, 
      {"name": "usdcAmount", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Controller ABI
export const CONTROLLER_ABI = [
  {
    "inputs": [],
    "name": "reflectivePrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "halted",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidityPool",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pegStabilityModule",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// PSM ABI
export const PSM_ABI = [
  {
    "inputs": [{"name": "usdcAmount", "type": "uint256"}],
    "name": "mint",
    "outputs": [{"name": "driOut", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "driAmount", "type": "uint256"}],
    "name": "redeem",
    "outputs": [{"name": "usdcOut", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "driReserve",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcReserve",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply", 
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Helper function to get contract configuration
export function getContractConfig(contractName: keyof typeof CONTRACTS) {
  return {
    address: CONTRACTS[contractName],
    chain: etoMainnet,
  };
}

// Chain configuration
export const CHAIN_CONFIG = {
  chainId: 69420,
  rpcUrl: "https://eto.ash.center/rpc",
  name: "ETO L1",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorer: "https://eto-explorer.ash.center",
};
