
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create the thirdweb client with your Client ID
const clientId = import.meta.env.VITE_THIRD_WEB_CLIENT_ID;

if (!clientId) {
  throw new Error('Thirdweb Client ID is required. Set VITE_THIRD_WEB_CLIENT_ID in .env');
}

export const client = createThirdwebClient({
  clientId,
  secretKey: import.meta.env.VITE_THIRD_WEB_API_KEY
});

// Update all chains to use public RPCs
export const ethereum = defineChain({
  id: 1,
  rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", // Use your own or public
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Etherscan", url: "https://etherscan.io" }],
});
export const polygon = defineChain({
  id: 137,
  rpc: "https://polygon-rpc.com",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  blockExplorers: [{ name: "PolygonScan", url: "https://polygonscan.com" }],
});

export const arbitrum = defineChain({
  id: 42161,
  rpc: "https://arb1.arbitrum.io/rpc",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Arbiscan", url: "https://arbiscan.io" }],
});

export const optimism = defineChain({
  id: 10,
  rpc: "https://mainnet.optimism.io",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Etherscan", url: "https://optimistic.etherscan.io" }],
});

export const avalanche = defineChain({
  id: 43114,
  rpc: "https://api.avax.network/ext/bc/C/rpc",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  blockExplorers: [{ name: "SnowTrace", url: "https://snowtrace.io" }],
});

export const bitcoin = defineChain({
  id: 0,
  rpc: "https://bitcoin-rpc.com", // Placeholder; use a real Bitcoin RPC
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 8 },
  blockExplorers: [{ name: "Blockchair", url: "https://blockchair.com/bitcoin" }],
});

export const solana = defineChain({
  id: 900,
  rpc: "https://api.mainnet-beta.solana.com",
  nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
  blockExplorers: [{ name: "Solana Explorer", url: "https://explorer.solana.com" }],
});

// New ETO Testnet chain
export const etoTestnet = defineChain({
  id: 83055,
  rpc: "https://subnets.avax.network/eto/testnet/rpc",
  nativeCurrency: {
    name: "GOVDRI",
    symbol: "GOVDRI",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "ETO Explorer",
      url: "https://subnets-test.avax.network/eto",
    },
  ],
  testnet: true,
});

// Supported chains array
export const supportedChains = [
  ethereum,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  bitcoin,
  solana,
  etoTestnet
];
