/**
 * ETO Faucet Lambda
 * Chain ID: 69670 | RPC: https://eto.ash.center/rpc
 * 
 * Sends 0.1 ETH + 1000 mUSDC to requesting wallet with 24-hour cooldown
 */

const { ethers } = require('ethers');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Configuration from environment
const CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://eto.ash.center/rpc',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '69670'),
  ETH_DRIP_AMOUNT: process.env.ETH_DRIP_AMOUNT || '0.1',
  USDC_DRIP_AMOUNT: process.env.USDC_DRIP_AMOUNT || '1000', // 1000 USDC
  COOLDOWN_HOURS: parseInt(process.env.COOLDOWN_HOURS || '24'),
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE || 'gas-faucet-requests',
  // Mock USDC contract on ETO L1 (Chain ID: 69670)
  USDC_CONTRACT: '0x27aC6E8be60d2d7bAd2171ae6789f3fbEf9689fd',
};

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

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
async function sendGas(wallet, toAddress) {
  const balance = await wallet.provider.getBalance(wallet.address);
  const dripAmount = ethers.parseEther(CONFIG.ETH_DRIP_AMOUNT);

  if (balance < dripAmount) {
    throw new Error('Faucet ETH balance too low');
  }

  console.log(`Sending ${CONFIG.ETH_DRIP_AMOUNT} ETH from ${wallet.address} to ${toAddress}`);

  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: dripAmount,
  });

  console.log(`ETH Transaction sent: ${tx.hash}`);
  await tx.wait(1);
  console.log(`ETH Transaction confirmed`);

  return tx.hash;
}

/**
 * Send mock USDC to address
 */
async function sendUSDC(wallet, toAddress) {
  const usdcContract = new ethers.Contract(CONFIG.USDC_CONTRACT, ERC20_ABI, wallet);
  
  // Get decimals (USDC typically has 6)
  const decimals = await usdcContract.decimals();
  const dripAmount = ethers.parseUnits(CONFIG.USDC_DRIP_AMOUNT, decimals);
  
  // Check faucet USDC balance
  const balance = await usdcContract.balanceOf(wallet.address);
  if (balance < dripAmount) {
    console.warn('Faucet USDC balance too low, skipping USDC transfer');
    return null;
  }

  console.log(`Sending ${CONFIG.USDC_DRIP_AMOUNT} mUSDC from ${wallet.address} to ${toAddress}`);

  const tx = await usdcContract.transfer(toAddress, dripAmount);
  console.log(`USDC Transaction sent: ${tx.hash}`);
  await tx.wait(1);
  console.log(`USDC Transaction confirmed`);

  return tx.hash;
}

/**
 * Send both ETH and USDC
 */
async function sendFaucetTokens(toAddress) {
  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FAUCET_PRIVATE_KEY not configured');
  }

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL, CONFIG.CHAIN_ID);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Send ETH first (required)
  const ethTxHash = await sendGas(wallet, toAddress);
  
  // Try to send USDC (optional - don't fail if USDC balance is low)
  let usdcTxHash = null;
  try {
    usdcTxHash = await sendUSDC(wallet, toAddress);
  } catch (error) {
    console.warn('USDC transfer failed:', error.message);
  }

  return { ethTxHash, usdcTxHash };
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

    // Send ETH + USDC
    const { ethTxHash, usdcTxHash } = await sendFaucetTokens(address);

    // Record the request
    await recordRequest(address, ethTxHash);

    // Build response message
    const amounts = [`${CONFIG.ETH_DRIP_AMOUNT} ETH`];
    if (usdcTxHash) {
      amounts.push(`${CONFIG.USDC_DRIP_AMOUNT} mUSDC`);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        ethTxHash,
        usdcTxHash,
        ethAmount: CONFIG.ETH_DRIP_AMOUNT,
        usdcAmount: usdcTxHash ? CONFIG.USDC_DRIP_AMOUNT : '0',
        message: `Sent ${amounts.join(' + ')} to your wallet`,
        explorer: `https://eto-explorer.ash.center/tx/${ethTxHash}`,
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
