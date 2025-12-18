import { etoMainnet } from "@/lib/thirdweb";

// =============================================================================
// ETO L1 Mainnet - DMMv2 Complete System (Dec 14, 2025)
// Chain ID: 69670 | RPC: https://eto.ash.center/rpc
// Deployer & Keeper: 0x3a7523d36935384ad1c42bb03Ac2B9d15929aca4
// =============================================================================
export const CONTRACTS = {
  // Core tokens
  MAANG_TOKEN: "0xdA8ac54e6a88ceC7724993Cd602168114debb510", // DRI Token
  GOVMAANG_TOKEN: "0xa766d01Fe9a0965400556D02382848Bb3c95e118", // GOVDRI Token
  USDC: "0x27aC6E8be60d2d7bAd2171ae6789f3fbEf9689fd", // Mock USDC

  // DeFi Protocol Contracts
  DYNAMIC_MARKET_MAKER: "0x95bfb9c0e9CE0fFFd528DF91E56c7e1F8123c79B", // DMMv2 CLMM
  ORACLE_AGGREGATOR: "0x877325Dd4504C149cFdDC3E9d943c46fa30a5c31",
  BOOTSTRAP_MAANG_CONTROLLER: "0x192878967d654d3F0dc14F78b52a93D3Bf8C745e", // DRI Controller
  PEG_STABILITY_MODULE: "0x5011519DB4b33b8307B5A71636FC7eF92e423058",

  // Vault (liquidity drip mechanism)
  SMAANG_VAULT: "0x22be7cc41ed9e22d5f5457be5ddc5666a7853647",

  // DMM Adapter (bridges Uniswap V3 style to vault interface)
  DMM_ADAPTER: "0x97792d7ae3CE8FBC9ecd71B48632F6101744e695",

  // Governor
  GOVERNOR: "0xA7ACbda68e060EC2517Db78552bEb9B225e0a12A",
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
export const DMM_ADAPTER_ADDRESS = CONTRACTS.DMM_ADAPTER;

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
