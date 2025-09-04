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

## Deployed Contracts

### Core Tokens
- **MockUSDC Address**: `0xBDd8A29859C96EB305A012C2ae286782B063238c`
- **DRI Token**: `0xd84d467b36e38ea5fb488298ac24dd926cf17f92`
- **GOVDRI Token**: `0x20321616839be8e25ef651ead40df7b3783cf705`

### DeFi Protocol Contracts
- **MAANG Token (DMM)**: `0xda60301ab3ffd71cc044f0b93d63745de7c815a3`
- **Oracle**: `0xa4e02339c313BF7Fc9e70D5E0C5c2BfEdF1B5327`
- **Bootstrap DRI Controller**: `0xe34f0dad64e6591416abdd31e9fca86222e2a4dc`
- **Peg Stability Module**: `0x08550550bbb3f4c154ecd1b54e537109ed9d3ffe`

- **Network**: ETO Testnet
- **Explorer**: https://subnets-test.avax.network/eto/

## Wallet Info
- Address: 0xa4e02339c313BF7Fc9e70D5E0C5c2BfEdF1B5327
- Private Key: Stored in hardhat.config.js (DO NOT COMMIT)

## Verify Contract (Optional)
```bash
npx hardhat verify --network etoTestnet <CONTRACT_ADDRESS>
```
