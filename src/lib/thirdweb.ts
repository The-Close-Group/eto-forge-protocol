import { createThirdwebClient } from "thirdweb";
import type { Chain } from "thirdweb/chains";

// Create the thirdweb client with your Client ID
const clientId = import.meta.env.VITE_THIRD_WEB_CLIENT_ID;

if (!clientId) {
  throw new Error('Thirdweb Client ID is required. Set VITE_THIRD_WEB_CLIENT_ID in .env');
}

export const client = createThirdwebClient({
  clientId,
  secretKey: import.meta.env.VITE_THIRD_WEB_API_KEY
});

// ETO L1 Mainnet (Production) - Chain ID 69670
export const etoMainnet: Chain = {
  id: 69670,
  name: "ETO L1 Mainnet",
  rpc: "https://eto.ash.center/rpc",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "ETO Explorer",
      url: "https://eto-explorer.ash.center",
    },
  ],
};

// Chain params for wallet_addEthereumChain - use this to force wallet to update
export const etoMainnetParams = {
  chainId: "0x11026", // 69670 in hex
  chainName: "ETO L1 Mainnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://eto.ash.center/rpc"],
  blockExplorerUrls: ["https://eto-explorer.ash.center"],
};

// Supported chains array - ONLY ETO L1 for DRI Protocol
export const supportedChains = [etoMainnet];

// Default chain for the protocol
export const defaultChain = etoMainnet;
