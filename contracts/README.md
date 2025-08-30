# MockUSDC Deployment Guide

## Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure you have GOVDRI tokens on ETO Testnet for gas fees
   - Network: ETO Testnet
   - Chain ID: 83055
   - RPC: https://subnets.avax.network/eto/testnet/rpc

## Deploy Contract

1. Deploy MockUSDC to ETO Testnet:
   ```bash
   npx hardhat run scripts/deploy-mock-usdc.js --network etoTestnet
   ```

2. Note the deployed contract address from the console output

3. Update the contract address in these files:
   - `src/components/USDCFaucet.tsx` - Update `MOCK_USDC_ADDRESS`
   - `src/hooks/useBalances.ts` - Update the mUSDC token address

## Contract Features

- **Faucet**: Users can claim 1000 mUSDC every hour
- **Mint with Permission**: Users can mint up to 10,000 mUSDC per transaction
- **Owner Mint**: Contract owner can mint unlimited tokens

## Deployed Contract
- **MockUSDC Address**: `0x2FbBC1d01dE254a72da2e573b057f123e3d9914F`
- **Network**: ETO Testnet
- **Explorer**: https://subnets-test.avax.network/eto/address/0x2FbBC1d01dE254a72da2e573b057f123e3d9914F

## Wallet Info
- Address: 0xa4e02339c313BF7Fc9e70D5E0C5c2BfEdF1B5327
- Private Key: Stored in hardhat.config.js (DO NOT COMMIT)

## Verify Contract (Optional)
```bash
npx hardhat verify --network etoTestnet <CONTRACT_ADDRESS>
```
