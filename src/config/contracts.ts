import { etoMainnet } from "@/lib/thirdweb";

// =============================================================================
// ETO L1 Mainnet - V67 Deployment (Dec 1, 2025)
// Chain ID: 69420 | RPC: https://eto.ash.center/rpc
// Features: Paper trading mode enabled, oracle staleness checks bypassed
// Deployer: 0xE9F99D0DC9788C18F6e27a696238e0d4e0ABB329
// =============================================================================
export const CONTRACTS = {
  // Core tokens
  MAANG_TOKEN: "0xcDc5A61974E385d3cE5C1eEB6AA2cDcE7DFbD520",
  GOVMAANG_TOKEN: "0x3bb00B75dE7ED537f1a822622F2003339EF33FAB",
  USDC: "0x38b151DFa17F7b633F1DF1d15896324A25e4A75e",
  
  // DeFi Protocol Contracts  
  DYNAMIC_MARKET_MAKER: "0xda1A772B83D0C71770e02E607F1eCCBaa27d911b",
  ORACLE_AGGREGATOR: "0x3E100b518F0Fc2CC0065F129cc5663a271910238",
  BOOTSTRAP_MAANG_CONTROLLER: "0x288f79DE46e5D731A249589214A44d69C26e2bbc",
  PEG_STABILITY_MODULE: "0x2Cf9d2b9315781115650CF2c96Af6253d2e55784",
  
  // Vault (liquidity drip mechanism)
  SMAANG_VAULT: "0x7B084e69F730779b52cFF90cEc3aA2De1Eec5e13",
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
