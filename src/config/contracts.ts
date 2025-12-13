import { etoMainnet } from "@/lib/thirdweb";

// =============================================================================
// ETO L1 Mainnet - Chain Reset (Dec 12, 2025)
// Chain ID: 69670 | RPC: https://eto.ash.center/rpc
// Deployer: 0xF9DCd381f0e2B491bb03B1717ee3350ee1c35e15
// =============================================================================
export const CONTRACTS = {
  // Core tokens
  MAANG_TOKEN: "0xdA8ac54e6a88ceC7724993Cd602168114debb510", // DRI Token
  GOVMAANG_TOKEN: "0x735153A73b47b2f4E5a68aDfb9Da4528013150C2", // GOVDRI Token
  USDC: "0x27aC6E8be60d2d7bAd2171ae6789f3fbEf9689fd", // Mock USDC
  
  // DeFi Protocol Contracts  
  DYNAMIC_MARKET_MAKER: "0xd14Ea79ab8B06BD5D2F4c805b3D9F6D134002648", // DMMv2 CLMM
  ORACLE_AGGREGATOR: "0x432edDe96fca51943b2a65b889ED50De7E51BdF7",
  BOOTSTRAP_MAANG_CONTROLLER: "0x936D89d33AE7f78D1151C436F71d66242b603FF0", // DRI Controller
  PEG_STABILITY_MODULE: "0x059756156294103Aeb7935e8566560A17921E30F",
  
  // Vault (liquidity drip mechanism)
  SMAANG_VAULT: "0xed2EEd3257Ce0A9ECeeE1055b5e54E724E63c09a",
  
  // Governor
  GOVERNOR: "0x302714564b44c669F1678deA5a7dD541aE8a4CCc",
} as const;

// Legacy aliases for backwards compatibility
export const MOCK_USDC = CONTRACTS.USDC;
export const MOCK_USDC_ADDRESS = CONTRACTS.USDC; // V67 Mock USDC token (has faucet function)
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
  chainId: 69670,
  rpcUrl: "https://eto.ash.center/rpc",
  name: "ETO L1",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorer: "https://eto-explorer.ash.center",
};
