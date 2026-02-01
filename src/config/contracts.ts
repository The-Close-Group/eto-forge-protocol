import { etoMainnet } from "@/lib/thirdweb";

// =============================================================================
// ETO L1 Mainnet - Option B Full Migration v2 (Jan 26, 2026)
// Chain ID: 69670 | RPC: https://eto.ash.center/rpc
// Keeper: 0xf44e2eB892a821d851702374545F162dDFa6abd4
// =============================================================================
export const CONTRACTS = {
  // Core tokens
  INDEX_TOKEN: "0x1F50AC5eFC0b8Bc17cCAa7fD035b6D616E9312F0", // INDEX Token (A16Z)
  MAANG_TOKEN: "0x1F50AC5eFC0b8Bc17cCAa7fD035b6D616E9312F0", // Alias for INDEX
  GOVMAANG_TOKEN: "0xa766d01Fe9a0965400556D02382848Bb3c95e118", // GOVDRI Token (unchanged)
  USDC: "0xd6126b8EB24f1184e985cfd8FeCa4a000558b8a6", // USDC

  // DeFi Protocol Contracts
  DYNAMIC_MARKET_MAKER: "0x1a39bd02dd9cc0b56c48561ee9ad237c1186ce9d", // DMM
  ORACLE_AGGREGATOR: "0x897f6132B0075325034f9445769CFA4bbC571DCe",
  BOOTSTRAP_MAANG_CONTROLLER: "0x52F10C85c7CCBC3bf740E43a10C2c76e002ccf7F", // Controller
  PEG_STABILITY_MODULE: "0x2f5c1d9f2f6e1125006e3e1b58cc5d7de78cf8ec", // PSM

  // Vault (liquidity drip mechanism)
  SMAANG_VAULT: "0x8c452efd81b77459c111365ae95f0979edba116a",

  // DMM Adapter (bridges Uniswap V3 style to vault interface)
  DMM_ADAPTER: "0x97792d7ae3CE8FBC9ecd71B48632F6101744e695",

  // Governor
  GOVERNOR: "0xA7ACbda68e060EC2517Db78552bEb9B225e0a12A",

  // Faucets (v2 - supports gasless claims)
  GAS_FAUCET: "0x429534387e36B956D07ce6ba7f03a482b3e4148A",
} as const;

// Deprecated contracts (kept for reference)
export const DEPRECATED_CONTRACTS = {
  // Old deployment (Dec 14, 2025)
  MAANG_TOKEN_V1: "0xdA8ac54e6a88ceC7724993Cd602168114debb510",
  USDC_V1: "0x27aC6E8be60d2d7bAd2171ae6789f3fbEf9689fd",
  DYNAMIC_MARKET_MAKER_V1: "0x95bfb9c0e9CE0fFFd528DF91E56c7e1F8123c79B",
  ORACLE_AGGREGATOR_V1: "0x877325Dd4504C149cFdDC3E9d943c46fa30a5c31",
  BOOTSTRAP_MAANG_CONTROLLER_V1: "0x192878967d654d3F0dc14F78b52a93D3Bf8C745e",
  PEG_STABILITY_MODULE_V1: "0x5011519DB4b33b8307B5A71636FC7eF92e423058",
  SMAANG_VAULT_V1: "0x22be7cc41ed9e22d5f5457be5ddc5666a7853647",

  // From migration JSON
  Controller_v1: "0x5ce602208b8D9B60F1d1F75491FE2cB46D0a9299",
  Controller_v2: "0xF2c5171678f228dF54a0FDe06B03b19C97a3A547",
  DMM_v1: "0x5aefFc6D05Bf6cA4de88F40D85Ae80818E91b750",
  DMM_v2: "0xD0ae93DdE32553B1ecaAd7187bA6b309Be47476d",
  PSM_v1: "0x9D1Dc2b0909b97088534fFF5dc2Bae192717c846",
  PSM_v2: "0xB8fe5Ee07cA00eF5325B130a79437eED0A3fC2C4",
  Vault_v1: "0xf0Ef12071fB52eD5427B12403251A3638dA8e605",
  Vault_v2: "0x15E443469A253326e66363A237f3346A3Ea4BbA8",
} as const;

// Legacy aliases for backwards compatibility
export const MOCK_USDC = CONTRACTS.USDC;
export const MOCK_USDC_ADDRESS = CONTRACTS.USDC; // V67 Mock USDC token (has faucet function)
export const ORACLE = CONTRACTS.ORACLE_AGGREGATOR;

// Individual address exports for convenience
export const INDEX_TOKEN_ADDRESS = CONTRACTS.INDEX_TOKEN;
export const ORACLE_ADDRESS = CONTRACTS.ORACLE_AGGREGATOR;
export const DMM_ADDRESS = CONTRACTS.DYNAMIC_MARKET_MAKER;
export const DRI_TOKEN_ADDRESS = CONTRACTS.MAANG_TOKEN; // Keep old export name for compatibility
export const MAANG_TOKEN_ADDRESS = CONTRACTS.MAANG_TOKEN;
export const GOVDRI_TOKEN_ADDRESS = CONTRACTS.GOVMAANG_TOKEN; // Keep old export name for compatibility
export const GOVMAANG_TOKEN_ADDRESS = CONTRACTS.GOVMAANG_TOKEN;
export const USDC_ADDRESS = CONTRACTS.USDC;
export const CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_MAANG_CONTROLLER;
export const BOOTSTRAP_DRI_CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_MAANG_CONTROLLER; // Keep old export name for compatibility
export const BOOTSTRAP_MAANG_CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_MAANG_CONTROLLER;
export const PEG_STABILITY_MODULE_ADDRESS = CONTRACTS.PEG_STABILITY_MODULE;
export const PSM_ADDRESS = CONTRACTS.PEG_STABILITY_MODULE;
export const VAULT_ADDRESS = CONTRACTS.SMAANG_VAULT;
export const SMAANG_VAULT_ADDRESS = CONTRACTS.SMAANG_VAULT;
export const DMM_ADAPTER_ADDRESS = CONTRACTS.DMM_ADAPTER;
export const GAS_FAUCET_ADDRESS = CONTRACTS.GAS_FAUCET;

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

// Gas Faucet ABI (v2 - supports gasless claims)
export const GAS_FAUCET_ABI = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "nonce", "type": "uint256"},
      {"name": "signature", "type": "bytes"}
    ],
    "name": "claimFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getClaimMessage",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "nonces",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "canClaim",
    "outputs": [
      {"name": "canClaim", "type": "bool"},
      {"name": "nextClaimTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "timeUntilNextClaim",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "balance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DRIP_AMOUNT",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "COOLDOWN",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

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
