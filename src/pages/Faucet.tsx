import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '@/components/layout/TopNavBar';
import {
  Droplets, ExternalLink, Loader2, Wallet, ChevronRight,
  Zap, Shield, Clock, CheckCircle2, AlertCircle, Coins,
  ArrowRight, Sparkles, RefreshCw, Fuel, Pen
} from 'lucide-react';
import { useActiveAccount, useSendTransaction, useDisconnect, ConnectButton, useWalletBalance } from 'thirdweb/react';
import { prepareTransaction } from 'thirdweb';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USDC_ADDRESS, GAS_FAUCET_ADDRESS, GAS_FAUCET_ABI } from '@/config/contracts';
import { etoPublicClient } from '@/lib/etoRpc';
import { encodeFunctionData, createWalletClient, custom } from 'viem';
import { Progress } from '@/components/ui/progress';
import { useGasFaucet } from '@/hooks/useGasFaucet';
import metamaskLogo from '@/assets/metamask-logo.svg';

// Gas Faucet API URL (for gasless claims)
const GAS_FAUCET_API_URL = import.meta.env.VITE_GAS_FAUCET_API_URL || 'http://localhost:3001';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

const mockUSDCABI = [
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
] as const;

// Chain ID for display
const CHAIN_ID_DISPLAY = 69670;

export default function Faucet() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ethBalance, setEthBalance] = useState<string | null>(null);

  // Gas faucet hook
  const gasFaucet = useGasFaucet();
  const [gasClaimLoading, setGasClaimLoading] = useState(false);
  const [gasClaimSuccess, setGasClaimSuccess] = useState(false);
  const [gasTxHash, setGasTxHash] = useState<string | null>(null);

  // Thirdweb transaction hook
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const { disconnect } = useDisconnect();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check ETH balance for gas
  const checkGasBalance = async () => {
    if (!account?.address) return;
    try {
      const balance = await etoPublicClient.getBalance({
        address: account.address as `0x${string}`
      });
      setEthBalance((Number(balance) / 1e18).toFixed(6));
    } catch (e) {
      console.error('Error checking balance:', e);
    }
  };

  // Check balance when account changes
  useEffect(() => {
    if (account?.address) {
      checkGasBalance();
    }
  }, [account?.address]);

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check gas balance first
    if (ethBalance !== null && parseFloat(ethBalance) < 0.0001) {
      toast.error("You need ETH on ETO L1 for gas fees. Claim gas first!");
      return;
    }

    setIsLoading(true);
    setTxHash(null);
    setClaimSuccess(false);
    setProgress(10);

    try {
      setProgress(30);
      // Encode the faucet() call
      const data = encodeFunctionData({
        abi: mockUSDCABI,
        functionName: 'faucet',
      });

      setProgress(50);
      toast.info("Confirm the transaction in your wallet...");

      // Use viem directly with window.ethereum to avoid thirdweb session issues
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No wallet found. Please install MetaMask.");
      }

      // Request account access first (required for window.ethereum)
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available. Please connect your wallet.");
      }
      const fromAddress = accounts[0];

      // Check current chain - only switch if needed
      const chainIdHex = '0x11026'; // 69670 in hex
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });

      if (currentChainId !== chainIdHex) {
        const chainConfig = {
          chainId: chainIdHex,
          chainName: 'ETO L1 Mainnet',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://eto.ash.center/rpc'],
          blockExplorerUrls: ['https://eto-explorer.ash.center'],
        };

        // Try to switch first, if fails add the chain
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
            // Chain not found - try to add it
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chainConfig],
              });
            } catch (addError: any) {
              if (addError.code === 4001) {
                throw new Error('You rejected the network addition request');
              } else if (addError.message?.includes('same RPC endpoint') ||
                         addError.message?.includes('Condrieu') ||
                         addError.code === -32002) {
                throw new Error('RPC conflict detected. Please remove the Condrieu network (chain 69420) from your wallet and try again.');
              }
              throw addError;
            }
          } else if (switchError.code === 4001) {
            throw new Error('You rejected the network switch request');
          } else {
            throw switchError;
          }
        }
      }

      setProgress(60);

      // Send transaction directly via window.ethereum
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: USDC_ADDRESS,
          data: data,
        }],
      });

      if (!hash) {
        throw new Error("Transaction failed - no hash returned");
      }
      setTxHash(hash);
      setProgress(80);
      toast.success("Transaction sent! Waiting for confirmation...");

      // Wait for receipt
      const receipt = await etoPublicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      setProgress(100);
      if (receipt.status === 'success') {
        setClaimSuccess(true);
        toast.success("Successfully claimed 10,000 mUSDC!");
        queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
        checkGasBalance(); // Refresh ETH balance
      } else {
        toast.error("Transaction failed on-chain");
      }
    } catch (error: any) {
      console.error("Faucet error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error data:", error.data);
      setProgress(0);

      // Error code 4100 = account not authorized, 4001 = user rejected
      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error("Transaction rejected");
      } else if (error.code === 4100 || error.message?.includes('not been authorized')) {
        // Account not authorized in wallet - need to reconnect
        toast.error("Wallet not authorized. Please reconnect.");
        setSessionExpired(true);
      } else if (error.message?.includes('Session expired') || error.message?.includes('reconnect') || error.data?.originalError?.includes('Session expired')) {
        setSessionExpired(true);
        toast.error("Wallet session expired. Please reconnect your wallet.");
      } else {
        toast.error(error.shortMessage || error.message || "Transaction failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('eto-user-onboarded', 'true');
    navigate('/dashboard');
  };

  // Check if user has gas for transactions
  const hasGasForTx = ethBalance !== null && parseFloat(ethBalance) >= 0.0001;

  // Gasless claim via API (for users with 0 gas)
  const handleGaslessClaimViaAPI = async () => {
    if (!account?.address) return;

    try {
      // Step 1: Get the message hash to sign from the contract
      toast.info("Step 1/3: Getting claim message...");
      const messageHash = await etoPublicClient.readContract({
        address: GAS_FAUCET_ADDRESS as `0x${string}`,
        abi: GAS_FAUCET_ABI,
        functionName: 'getClaimMessage',
        args: [account.address as `0x${string}`],
      });

      // Step 2: Have user sign the message (this is FREE - no gas needed)
      toast.info("Step 2/3: Sign the message in your wallet (FREE)...");

      // Convert bytes32 to Uint8Array for signing
      const messageBytes = new Uint8Array(
        (messageHash as string).slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      // Use thirdweb account's signMessage with raw bytes
      const signature = await account.signMessage({
        message: { raw: messageBytes },
      });

      if (!signature) {
        throw new Error("Signature rejected or failed");
      }

      // Step 3: Submit to API
      toast.info("Step 3/3: Submitting claim...");
      const response = await fetch(`${GAS_FAUCET_API_URL}/api/claim-gas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: account.address,
          signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setGasTxHash(data.txHash);
      setGasClaimSuccess(true);
      toast.success(`Successfully claimed ${gasFaucet.dripAmount} ETH (gasless)!`);
      checkGasBalance();
      gasFaucet.refresh();
    } catch (error: any) {
      console.error("Gasless claim error:", error);

      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error("Signature rejected");
      } else if (error.message?.includes('fetch')) {
        toast.error("API unavailable. Try the regular claim method.");
      } else {
        toast.error(error.message || "Gasless claim failed");
      }
    }
  };

  // Handle gas faucet claim (regular or gasless)
  const handleGasClaim = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!gasFaucet.isDeployed) {
      toast.error("Gas faucet not deployed yet");
      return;
    }

    setGasClaimLoading(true);
    setGasTxHash(null);
    setGasClaimSuccess(false);

    try {
      // If user has no gas, use gasless claim
      if (!hasGasForTx) {
        await handleGaslessClaimViaAPI();
        return;
      }

      // Regular claim (user pays gas)
      toast.info("Confirm the transaction in your wallet...");

      // Encode the claim() call
      const data = encodeFunctionData({
        abi: [{ inputs: [], name: "claim", outputs: [], stateMutability: "nonpayable", type: "function" }],
        functionName: 'claim',
      });

      // Use viem directly with window.ethereum to avoid thirdweb session issues
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No wallet found. Please install MetaMask.");
      }

      // Request account access first
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available. Please connect your wallet.");
      }
      const fromAddress = accounts[0];

      // Send transaction directly via window.ethereum
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: GAS_FAUCET_ADDRESS,
          data: data,
        }],
      });

      if (!hash) {
        throw new Error("Transaction failed - no hash returned");
      }
      setGasTxHash(hash);
      toast.success("Transaction sent! Waiting for confirmation...");

      // Wait for receipt
      const receipt = await etoPublicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      if (receipt.status === 'success') {
        setGasClaimSuccess(true);
        toast.success(`Successfully claimed ${gasFaucet.dripAmount} ETH!`);
        checkGasBalance(); // Refresh ETH balance
        gasFaucet.refresh(); // Refresh faucet state
      } else {
        toast.error("Transaction failed on-chain");
      }
    } catch (error: any) {
      console.error("Gas claim error:", error);

      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error("Transaction rejected");
      } else if (error.message?.includes('AlreadyClaimedToday')) {
        toast.error("You've already claimed today. Try again tomorrow!");
      } else if (error.message?.includes('Session expired') || error.message?.includes('reconnect') || error.data?.originalError?.includes('Session expired')) {
        setSessionExpired(true);
        toast.error("Wallet session expired. Please reconnect your wallet.");
      } else {
        toast.error(error.message || "Claim failed");
      }
    } finally {
      setGasClaimLoading(false);
    }
  };

  // Handle wallet reconnection
  const handleReconnect = () => {
    disconnect();
    setSessionExpired(false);
    toast.info("Wallet disconnected. Please reconnect to continue.");
  };

  // Clear session expired when account changes (user reconnected)
  useEffect(() => {
    if (account?.address && sessionExpired) {
      setSessionExpired(false);
      toast.success("Wallet reconnected! You can now try again.");
    }
  }, [account?.address]);

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <div className="max-w-[1200px] mx-auto p-6 pt-20 pb-24 md:pb-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
            <Coins className="w-4 h-4" />
            <span>Testnet Tokens</span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-2">ETO Faucets</h1>
          <p className="text-[14px] text-muted-foreground max-w-lg">
            Get free tokens on ETO L1 to start paper trading. Claim gas for transactions and mUSDC for trading.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Faucet Card */}
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="flex items-center gap-3 text-[18px]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  Claim mUSDC
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Amount Display */}
                <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-[13px] text-muted-foreground mb-2">Amount to receive</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[42px] font-semibold tracking-tight">10,000</span>
                    <span className="text-[18px] text-muted-foreground">mUSDC</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-2">
                    ≈ $10,000 USD (Paper Trading)
                  </div>
                </div>

                {/* Progress Bar (when loading) */}
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted-foreground">Processing transaction...</span>
                      <span className="text-primary font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Success State */}
                {claimSuccess && (
                  <div className="p-4 rounded-xl bg-data-positive/10 border border-data-positive/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-data-positive shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[14px] font-medium text-data-positive">Claim Successful!</div>
                      <div className="text-[13px] text-muted-foreground mt-1">
                        10,000 mUSDC has been added to your wallet. You're ready to start trading!
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Link */}
                {txHash && (
                  <a 
                    href={`https://eto-explorer.ash.center/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium">View Transaction</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                )}

                {/* Session Expired Warning */}
                {sessionExpired && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-red-500">Session Expired</div>
                      <div className="text-[13px] text-muted-foreground mt-1">
                        Your wallet session has expired. Please reconnect to continue.
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-red-500/30 text-red-500 hover:bg-red-500/10"
                        onClick={handleReconnect}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reconnect Wallet
                      </Button>
                    </div>
                  </div>
                )}

                {/* Gas Balance Warning */}
                {account && !sessionExpired && ethBalance !== null && parseFloat(ethBalance) < 0.001 && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[14px] font-medium text-yellow-500">Insufficient Gas</div>
                      <div className="text-[13px] text-muted-foreground mt-1">
                        You have {ethBalance} ETH. You need some ETH on ETO L1 to pay for gas fees.
                        Claim gas below first, or use the{' '}
                        <a
                          href="https://eto.ash.center/bridge"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          ETO Bridge
                        </a>.
                      </div>
                    </div>
                  </div>
                )}

                {/* Gas Balance Display (when connected) */}
                {account && ethBalance !== null && parseFloat(ethBalance) >= 0.001 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-[13px]">
                    <span className="text-muted-foreground">Your Gas Balance</span>
                    <span className="font-medium">{ethBalance} ETH</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!account ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="text-[15px] font-medium mb-1">Connect Your Wallet</h3>
                      <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                        Connect your wallet to claim free mUSDC tokens
                      </p>
                      <ConnectButton
                        client={client}
                        wallets={wallets}
                        chain={etoMainnet}
                        chains={supportedChains}
                        connectModal={{ size: "compact" }}
                        connectButton={{
                          label: "Connect Wallet",
                          style: {
                            background: "hsl(160 70% 50%)",
                            color: "#000",
                            border: "none",
                            borderRadius: "12px",
                            padding: "14px 28px",
                            fontSize: "14px",
                            fontWeight: "600",
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleFaucet}
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                        className="w-full h-14 text-[15px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Droplets className="mr-2 h-5 w-5" />
                            Claim 10,000 mUSDC
                          </>
                        )}
                      </Button>

                      {claimSuccess && (
          <Button 
            onClick={handleContinue}
                          variant="outline"
            size="lg"
                          className="w-full h-12"
          >
                          Continue to Dashboard
                          <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
                      )}
                    </>
                  )}
        </div>
              </CardContent>
            </Card>

            {/* Gas Faucet Card */}
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="flex items-center gap-3 text-[18px]">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-yellow-500" />
                  </div>
                  Claim Gas (ETH)
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Amount Display */}
                <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-[13px] text-muted-foreground mb-2">Amount to receive</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[42px] font-semibold tracking-tight">{gasFaucet.dripAmount}</span>
                    <span className="text-[18px] text-muted-foreground">ETH</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-2">
                    Daily limit • {gasFaucet.faucetBalance} ETH remaining in faucet
                  </div>
                </div>

                {/* Cooldown Timer */}
                {account && !gasFaucet.canClaim && gasFaucet.timeRemaining > 0 && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-[13px] font-medium">Cooldown Active</div>
                      <div className="text-[12px] text-muted-foreground">
                        {gasFaucet.formatTimeRemaining(gasFaucet.timeRemaining)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {gasClaimSuccess && (
                  <div className="p-4 rounded-xl bg-data-positive/10 border border-data-positive/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-data-positive shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[14px] font-medium text-data-positive">Gas Claimed!</div>
                      <div className="text-[13px] text-muted-foreground mt-1">
                        {gasFaucet.dripAmount} ETH has been added to your wallet for gas fees.
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Link */}
                {gasTxHash && (
                  <a
                    href={`https://eto-explorer.ash.center/tx/${gasTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-yellow-500/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium">View Transaction</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {gasTxHash.slice(0, 10)}...{gasTxHash.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                  </a>
                )}

                {/* Not Deployed Warning */}
                {!gasFaucet.isDeployed && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[14px] font-medium">Coming Soon</div>
                      <div className="text-[13px] text-muted-foreground mt-1">
                        The gas faucet is not deployed yet. For now, bridge ETH from another network.
                      </div>
                    </div>
                  </div>
                )}

                {/* Gasless Mode Indicator */}
                {account && !hasGasForTx && gasFaucet.canClaim && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-[13px]">
                    <Pen className="w-4 h-4 text-primary" />
                    <span>
                      <strong>Gasless Mode:</strong> You'll sign a free message, we'll submit the transaction for you.
                    </span>
                  </div>
                )}

                {/* Claim Button */}
                {gasFaucet.isDeployed && account && (
                  <Button
                    onClick={handleGasClaim}
                    disabled={gasClaimLoading || !gasFaucet.canClaim}
                    variant="outline"
                    size="lg"
                    className="w-full h-14 text-[15px] border-yellow-500/30 hover:bg-yellow-500/10"
                  >
                    {gasClaimLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {!hasGasForTx ? 'Processing Gasless Claim...' : 'Claiming...'}
                      </>
                    ) : !gasFaucet.canClaim ? (
                      <>
                        <Clock className="mr-2 h-5 w-5" />
                        {gasFaucet.formatTimeRemaining(gasFaucet.timeRemaining)}
                      </>
                    ) : !hasGasForTx ? (
                      <>
                        <Pen className="mr-2 h-5 w-5" />
                        Sign to Claim {gasFaucet.dripAmount} ETH (Free)
                      </>
                    ) : (
                      <>
                        <Fuel className="mr-2 h-5 w-5" />
                        Claim {gasFaucet.dripAmount} ETH
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Network Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  Network Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">ETO L1 Network</div>
                      <div className="text-[12px] text-muted-foreground">Chain ID: {CHAIN_ID_DISPLAY}</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-muted-foreground space-y-1.5 pt-2">
                    <p>• Network will be automatically added if not present</p>
                    <p>• Claim gas first, then mUSDC for trading</p>
                    <p>• If transaction gets stuck, try increasing gas price</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Features Card */}
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Why Use the Faucet?
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {[
                  {
                    icon: Shield,
                    title: 'Risk-Free Trading',
                    description: 'Practice with fake money, real market conditions'
                  },
                  {
                    icon: Zap,
                    title: 'Instant Delivery',
                    description: 'Tokens arrive in seconds after confirmation'
                  },
                  {
                    icon: RefreshCw,
                    title: 'Unlimited Claims',
                    description: 'Come back anytime you need more tokens'
                  },
                  {
                    icon: Clock,
                    title: 'No Waiting Period',
                    description: 'Start trading immediately after claiming'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{feature.title}</div>
                      <div className="text-[12px] text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-10 px-3"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="text-[13px]">Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-10 px-3"
                  onClick={() => navigate('/trade')}
                >
                  <span className="text-[13px]">Start Trading</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-10 px-3"
                  onClick={() => navigate('/staking')}
                >
                  <span className="text-[13px]">Explore Staking</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <a 
                  href="https://eto-explorer.ash.center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full h-10 px-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span className="text-[13px]">Block Explorer</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>

            {/* Token Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Token Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Token</span>
                  <span className="text-[13px] font-medium">mUSDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Network</span>
                  <span className="text-[13px] font-medium">ETO L1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Decimals</span>
                  <span className="text-[13px] font-medium">6</span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="text-[12px] text-muted-foreground mb-1">Contract Address</div>
                  <div className="text-[11px] font-mono text-muted-foreground break-all">
                    {USDC_ADDRESS}
          </div>
          </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
