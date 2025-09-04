// Test utilities - FOR TESTING ONLY, NOT FOR PRODUCTION

export const TEST_PRIVATE_KEY = "0xe555d4ec5d27fe54ae0ef4b30d81fe429799763f920de796d776cd03c4a3bd36";

// Helper to get test account address from private key
export function getTestAccountAddress(): string {
  // This would be the address derived from the private key
  // In a real implementation, you'd derive this from the private key
  return "0x..."; // Replace with actual derived address
}

// Note: This private key is ONLY for testing the DMM functionality
// Never use this in production or with real funds
export const TEST_WALLET_CONFIG = {
  privateKey: TEST_PRIVATE_KEY,
  // Add other test configuration as needed
};
