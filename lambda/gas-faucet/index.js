/**
 * ETO Gas Faucet Lambda
 * Chain ID: 69670 | RPC: https://eto.ash.center/rpc
 * 
 * Sends 0.1 ETH to requesting wallet with 24-hour cooldown
 */

const { ethers } = require('ethers');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Configuration from environment
const CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://eto.ash.center/rpc',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '69670'),
  DRIP_AMOUNT: process.env.DRIP_AMOUNT || '0.1',
  COOLDOWN_HOURS: parseInt(process.env.COOLDOWN_HOURS || '24'),
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE || 'gas-faucet-requests',
};

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Validate Ethereum address format
 */
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if address is on cooldown
 * @returns {Object} { onCooldown: boolean, timeRemaining?: number, lastTxHash?: string }
 */
async function checkCooldown(address) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      Key: { walletAddress: address.toLowerCase() },
    }));

    if (!result.Item) {
      return { onCooldown: false };
    }

    const lastRequestTime = result.Item.lastRequestTime;
    const cooldownMs = CONFIG.COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeSinceLastRequest = Date.now() - lastRequestTime;

    if (timeSinceLastRequest < cooldownMs) {
      const timeRemaining = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000);
      return {
        onCooldown: true,
        timeRemaining,
        lastTxHash: result.Item.lastTxHash,
      };
    }

    return { onCooldown: false };
  } catch (error) {
    console.error('DynamoDB read error:', error);
    // If DynamoDB fails, allow the request (fail open for UX)
    return { onCooldown: false };
  }
}

/**
 * Record successful faucet request
 */
async function recordRequest(address, txHash) {
  try {
    await docClient.send(new PutCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      Item: {
        walletAddress: address.toLowerCase(),
        lastRequestTime: Date.now(),
        lastTxHash: txHash,
        totalRequests: 1, // Could increment with UpdateCommand
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days TTL
      },
    }));
  } catch (error) {
    console.error('DynamoDB write error:', error);
    // Don't fail the request if DynamoDB write fails
  }
}

/**
 * Send ETH to address
 */
async function sendGas(toAddress) {
  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FAUCET_PRIVATE_KEY not configured');
  }

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL, CONFIG.CHAIN_ID);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Check faucet balance
  const balance = await provider.getBalance(wallet.address);
  const dripAmount = ethers.parseEther(CONFIG.DRIP_AMOUNT);

  if (balance < dripAmount) {
    throw new Error('Faucet balance too low');
  }

  console.log(`Sending ${CONFIG.DRIP_AMOUNT} ETH from ${wallet.address} to ${toAddress}`);

  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: dripAmount,
  });

  console.log(`Transaction sent: ${tx.hash}`);

  // Wait for confirmation
  const receipt = await tx.wait(1);
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

/**
 * Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { address } = body;

    // Validate address
    if (!address) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Missing wallet address',
        }),
      };
    }

    if (!isValidAddress(address)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Invalid wallet address format',
        }),
      };
    }

    // Check cooldown
    const cooldownStatus = await checkCooldown(address);
    if (cooldownStatus.onCooldown) {
      const hours = Math.floor(cooldownStatus.timeRemaining / 3600);
      const minutes = Math.floor((cooldownStatus.timeRemaining % 3600) / 60);

      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Cooldown active',
          message: `Please wait ${hours}h ${minutes}m before requesting again`,
          timeRemaining: cooldownStatus.timeRemaining,
          lastTxHash: cooldownStatus.lastTxHash,
        }),
      };
    }

    // Send gas
    const txHash = await sendGas(address);

    // Record the request
    await recordRequest(address, txHash);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        txHash,
        amount: CONFIG.DRIP_AMOUNT,
        message: `Sent ${CONFIG.DRIP_AMOUNT} ETH to your wallet`,
        explorer: `https://eto-explorer.ash.center/tx/${txHash}`,
      }),
    };

  } catch (error) {
    console.error('Faucet error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Faucet error',
        message: error.message || 'Failed to send gas',
      }),
    };
  }
};
