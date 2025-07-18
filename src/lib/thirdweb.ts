
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id-here"
});

// Define supported chains
export const ethereum = defineChain(1);
export const polygon = defineChain(137);
export const arbitrum = defineChain(42161);

export const supportedChains = [ethereum, polygon, arbitrum];
