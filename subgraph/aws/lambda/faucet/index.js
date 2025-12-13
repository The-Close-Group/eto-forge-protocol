/**
 * ETO Protocol Faucet - AWS Lambda
 * Chain ID: 69670 | RPC: https://eto.ash.center/rpc
 * 
 * Automatically sends gas (ETH) and USDC to new users when they connect.
 * Deployed as AWS Lambda behind API Gateway.
 * 
 * Environment Variables:
 *   - FAUCET_PRIVATE_KEY: Private key of the faucet wallet
 *   - GAS_AMOUNT: Amount of ETH to send (default: 0.01)
 *   - USDC_AMOUNT: Amount of USDC to send (default: 1000)
 *   - COOLDOWN_HOURS: Hours between claims (default: 24)
 *   - DYNAMODB_TABLE: DynamoDB table name for rate limiting
 */

const { ethers } = require('ethers');
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');

// Configuration
const ETO_RPC = 'https://eto.ash.center/rpc';
const CHAIN_ID = 69670;

// Contract addresses (Chain ID: 69670 - Dec 12, 2025 deployment)
const USDC_ADDRESS = '0x27aC6E8be60d2d7bAd2171ae6789f3fbEf9689fd';

// USDC has a faucet function that mints tokens
const USDC_ABI = [
  'function faucet() external',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

// DynamoDB client for rate limiting
const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Check if address has claimed recently
 */
async function checkCooldown(address) {
  const tableName = process.env.DYNAMODB_TABLE || 'eto-faucet-claims';
  const cooldownHours = parseInt(process.env.COOLDOWN_HOURS || '24', 10);
  
  try {
    const result = await dynamodb.send(new GetItemCommand({
      TableName: tableName,
      Key: { address: { S: address.toLowerCase() } },
    }));
    
    if (result.Item && result.Item.lastClaim) {
      const lastClaim = parseInt(result.Item.lastClaim.N, 10);
      const hoursSince = (Date.now() - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSince < cooldownHours) {
        return {
          onCooldown: true,
          hoursRemaining: Math.ceil(cooldownHours - hoursSince),
        };
      }
    }
    
    return { onCooldown: false };
  } catch (error) {
    console.error('DynamoDB error:', error);
    // If DynamoDB fails, allow the claim (better UX)
    return { onCooldown: false };
  }
}

/**
 * Record a claim in DynamoDB
 */
async function recordClaim(address, gasHash, usdcHash) {
  const tableName = process.env.DYNAMODB_TABLE || 'eto-faucet-claims';
  
  try {
    await dynamodb.send(new PutItemCommand({
      TableName: tableName,
      Item: {
        address: { S: address.toLowerCase() },
        lastClaim: { N: Date.now().toString() },
        gasTxHash: { S: gasHash || '' },
        usdcTxHash: { S: usdcHash || '' },
        chainId: { N: CHAIN_ID.toString() },
      },
    }));
  } catch (error) {
    console.error('Failed to record claim:', error);
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  
  try {
    // Parse request
    const body = JSON.parse(event.body || '{}');
    const { address } = body;
    
    // Validate address
    if (!address || !ethers.isAddress(address)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid wallet address' }),
      };
    }
    
    // Check cooldown
    const cooldownCheck = await checkCooldown(address);
    if (cooldownCheck.onCooldown) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: `Please wait ${cooldownCheck.hoursRemaining} hours before claiming again`,
          cooldownRemaining: cooldownCheck.hoursRemaining,
        }),
      };
    }
    
    // Get faucet wallet
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!privateKey) {
      console.error('FAUCET_PRIVATE_KEY not configured');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Faucet not configured' }),
      };
    }
    
    // Connect to ETO L1
    const provider = new ethers.JsonRpcProvider(ETO_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const gasAmount = process.env.GAS_AMOUNT || '0.01';
    const usdcAmount = process.env.USDC_AMOUNT || '1000';
    
    console.log(`Faucet request from ${address}`);
    console.log(`Faucet wallet: ${wallet.address}`);
    
    // Check faucet balance
    const faucetBalance = await provider.getBalance(wallet.address);
    const sendAmount = ethers.parseEther(gasAmount);
    
    if (faucetBalance < sendAmount * 2n) { // Keep some reserve
      console.error('Faucet balance too low:', ethers.formatEther(faucetBalance));
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Faucet temporarily unavailable. Please try again later.' }),
      };
    }
    
    // Send gas (ETH)
    console.log(`Sending ${gasAmount} ETH to ${address}...`);
    const gasTx = await wallet.sendTransaction({
      to: address,
      value: sendAmount,
    });
    const gasReceipt = await gasTx.wait();
    console.log(`Gas sent: ${gasTx.hash}`);
    
    // Send USDC (call faucet function on USDC contract, then transfer)
    // Note: If the USDC contract has a faucet function, we call it for the user
    // Otherwise, we transfer from our balance
    let usdcTx = null;
    let usdcHash = '';
    
    try {
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
      
      // Check if we have USDC to send
      const usdcBalance = await usdcContract.balanceOf(wallet.address);
      const usdcSendAmount = ethers.parseUnits(usdcAmount, 6); // USDC has 6 decimals
      
      if (usdcBalance >= usdcSendAmount) {
        console.log(`Sending ${usdcAmount} USDC to ${address}...`);
        usdcTx = await usdcContract.transfer(address, usdcSendAmount);
        await usdcTx.wait();
        usdcHash = usdcTx.hash;
        console.log(`USDC sent: ${usdcHash}`);
      } else {
        console.log(`Insufficient USDC balance: ${ethers.formatUnits(usdcBalance, 6)}`);
      }
    } catch (usdcError) {
      console.error('USDC transfer failed:', usdcError.message);
      // Continue - gas was sent successfully
    }
    
    // Record claim
    await recordClaim(address, gasTx.hash, usdcHash);
    
    // Success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: `Successfully sent ${gasAmount} ETH${usdcHash ? ` and ${usdcAmount} USDC` : ''}!`,
        gasTxHash: gasTx.hash,
        usdcTxHash: usdcHash || null,
        gasAmount,
        usdcAmount: usdcHash ? usdcAmount : null,
        explorerUrl: `https://eto-explorer.ash.center/tx/${gasTx.hash}`,
      }),
    };
    
  } catch (error) {
    console.error('Faucet error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to send funds' }),
    };
  }
};
