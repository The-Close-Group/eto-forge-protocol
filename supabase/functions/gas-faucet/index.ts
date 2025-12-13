import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ETO L1 RPC endpoint
const ETO_RPC = "https://eto.ash.center/rpc";

// Faucet configuration
const GAS_AMOUNT = "0.01"; // 0.01 ETH per claim
const COOLDOWN_HOURS = 24; // Hours between claims

// Simple rate limiting store (in production, use Redis or database)
const claimHistory = new Map<string, number>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return new Response(
        JSON.stringify({ error: "Invalid wallet address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Check cooldown
    const lastClaim = claimHistory.get(normalizedAddress);
    if (lastClaim) {
      const hoursSinceClaim = (Date.now() - lastClaim) / (1000 * 60 * 60);
      if (hoursSinceClaim < COOLDOWN_HOURS) {
        const hoursRemaining = Math.ceil(COOLDOWN_HOURS - hoursSinceClaim);
        return new Response(
          JSON.stringify({ 
            error: `Please wait ${hoursRemaining} hours before claiming again`,
            cooldownRemaining: hoursRemaining 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get faucet private key from environment
    const faucetPrivateKey = Deno.env.get("GAS_FAUCET_PRIVATE_KEY");
    if (!faucetPrivateKey) {
      console.error("GAS_FAUCET_PRIVATE_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Faucet not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Import ethers for transaction signing
    const { ethers } = await import("https://esm.sh/ethers@6.9.0");

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(ETO_RPC);
    const wallet = new ethers.Wallet(faucetPrivateKey, provider);

    // Check faucet balance
    const faucetBalance = await provider.getBalance(wallet.address);
    const sendAmount = ethers.parseEther(GAS_AMOUNT);

    if (faucetBalance < sendAmount) {
      console.error("Faucet balance too low:", ethers.formatEther(faucetBalance));
      return new Response(
        JSON.stringify({ error: "Faucet temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send gas to user
    const tx = await wallet.sendTransaction({
      to: address,
      value: sendAmount,
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    // Record claim
    claimHistory.set(normalizedAddress, Date.now());

    console.log(`Gas sent to ${address}: ${tx.hash}`);

    return new Response(
      JSON.stringify({
        success: true,
        txHash: tx.hash,
        amount: GAS_AMOUNT,
        message: `Successfully sent ${GAS_AMOUNT} ETH for gas!`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Gas faucet error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send gas" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

