
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create the thirdweb client with your Client ID
export const client = createThirdwebClient({
  clientId: "274d030c6ddb7171139eb300bc6d7465"
});

// Define supported chains
export const ethereum = defineChain(1);
export const polygon = defineChain(137);
export const arbitrum = defineChain(42161);

export const supportedChains = [ethereum, polygon, arbitrum];
