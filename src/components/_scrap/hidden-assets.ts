/**
 * Hidden Asset Configurations
 * 
 * These assets have been removed from the main asset grid on the Trade page.
 * They can be restored by adding them back to the stakingAssets array in Trade.tsx
 */

// USDC Asset Card - Hidden to even out the 3-column grid layout
export const hiddenUSDCAsset = {
  id: 'usdc',
  name: 'USD Coin',
  symbol: 'USDC',
  type: 'stablecoin',
  logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
  color: '#2775ca',
  rewardRate: 1.51,
  riskLevel: 'low' as const,
  tvl: 1200000,
};

