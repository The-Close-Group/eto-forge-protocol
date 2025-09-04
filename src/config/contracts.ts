import { etoTestnet } from "@/lib/thirdweb";

// ETO Testnet DeFi Protocol Contract Addresses
export const CONTRACTS = {
  // Core tokens
  DRI_TOKEN: "0xd84d467b36e38ea5fb488298ac24dd926cf17f92",
  GOVDRI_TOKEN: "0x20321616839be8e25ef651ead40df7b3783cf705",
  MOCK_USDC: "0xBDd8A29859C96EB305A012C2ae286782B063238c",
  
  // DeFi Protocol Contracts
  DYNAMIC_MARKET_MAKER: "0xda60301ab3ffd71cc044f0b93d63745de7c815a3", // MAANG token DMM
  ORACLE: "0xa4e02339c313BF7Fc9e70D5E0C5c2BfEdF1B5327",
  BOOTSTRAP_DRI_CONTROLLER: "0xe34f0dad64e6591416abdd31e9fca86222e2a4dc",
  PEG_STABILITY_MODULE: "0x08550550bbb3f4c154ecd1b54e537109ed9d3ffe",
} as const;

// Individual address exports for convenience
export const ORACLE_ADDRESS = CONTRACTS.ORACLE;
export const DMM_ADDRESS = CONTRACTS.DYNAMIC_MARKET_MAKER;
export const DRI_TOKEN_ADDRESS = CONTRACTS.DRI_TOKEN;
export const GOVDRI_TOKEN_ADDRESS = CONTRACTS.GOVDRI_TOKEN;
export const MOCK_USDC_ADDRESS = CONTRACTS.MOCK_USDC;
export const BOOTSTRAP_DRI_CONTROLLER_ADDRESS = CONTRACTS.BOOTSTRAP_DRI_CONTROLLER;
export const PEG_STABILITY_MODULE_ADDRESS = CONTRACTS.PEG_STABILITY_MODULE;

// Contract ABIs
export const ORACLE_ABI = [
  {
    "inputs": [{"name": "token", "type": "address"}],
    "name": "getPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLatestPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const DMM_ABI = [
  {
    "inputs": [],
    "name": "getCurrentPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSpotPrice",
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
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "usdcAmount", "type": "uint256"}],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenAmount", "type": "uint256"}],
    "name": "sellTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "usdcAmount", "type": "uint256"}],
    "name": "getBuyPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenAmount", "type": "uint256"}],
    "name": "getSellPrice",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
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
    chain: etoTestnet,
  };
}
