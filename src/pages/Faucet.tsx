import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { 
  Droplets, ExternalLink, Loader2, Wallet, ChevronRight, 
  Zap, Shield, Clock, CheckCircle2, AlertCircle, Coins,
  ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USDC_ADDRESS } from '@/config/contracts';
import { etoPublicClient } from '@/lib/etoRpc';
import { encodeFunctionData, parseGwei } from 'viem';
import { Progress } from '@/components/ui/progress';
import metamaskLogo from '@/assets/metamask-logo.svg';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

const ETO_CHAIN_ID_HEX = '0x10F2C'; // 69420

const mockUSDCABI = [
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
] as const;

const ETO_CHAIN_PARAMS = {
  chainId: ETO_CHAIN_ID_HEX,
  chainName: 'ETO L1 Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://eto.ash.center/rpc'],
  blockExplorerUrls: ['https://eto-explorer.ash.center'],
};

export default function Faucet() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error("No wallet detected");
      return;
    }

    setIsLoading(true);
    setTxHash(null);
    setClaimSuccess(false);
    setProgress(10);

    try {
      // 1. Switch/add chain
      setProgress(20);
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ETO_CHAIN_ID_HEX }],
        });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ETO_CHAIN_PARAMS],
          });
        }
      }

      setProgress(40);
      // 2. Encode the faucet() call
      const data = encodeFunctionData({
        abi: mockUSDCABI,
        functionName: 'faucet',
      });

      // 3. Get correct nonce from our RPC
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
      });

      setProgress(50);
      // 4. Estimate gas
      let gasEstimate: bigint;
      try {
        gasEstimate = await etoPublicClient.estimateGas({
          account: account.address as `0x${string}`,
          to: USDC_ADDRESS as `0x${string}`,
          data,
        });
      } catch {
        gasEstimate = 100000n;
      }

      toast.info("Confirm the transaction in your wallet...");
      setProgress(60);

      // 5. Send transaction
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: USDC_ADDRESS,
          data: data,
          gas: `0x${(gasEstimate * 15n / 10n).toString(16)}`,
          gasPrice: `0x${parseGwei('1.5').toString(16)}`,
          nonce: `0x${nonce.toString(16)}`,
        }],
      });

      if (!hash || typeof hash !== 'string') {
        throw new Error("Wallet didn't return a transaction hash");
      }

      setTxHash(hash);
      setProgress(80);
      toast.success("Transaction sent! Waiting for confirmation...");

      // 6. Wait for receipt
      const receipt = await etoPublicClient.waitForTransactionReceipt({ 
        hash: hash as `0x${string}`,
        timeout: 60_000,
      });

      setProgress(100);
      if (receipt.status === 'success') {
        setClaimSuccess(true);
        toast.success("Successfully claimed 10,000 mUSDC!");
        queryClient.invalidateQueries({ queryKey: ["multi-chain-balances"] });
      } else {
        toast.error("Transaction failed on-chain");
      }
    } catch (error: any) {
      console.error("Faucet error:", error);
      setProgress(0);
      
      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error("Transaction rejected");
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
          <h1 className="text-[28px] font-semibold tracking-tight mb-2">mUSDC Faucet</h1>
          <p className="text-[14px] text-muted-foreground max-w-lg">
            Get free Mock USDC tokens on ETO L1 to start paper trading. No real money required.
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
                      <div className="text-[12px] text-muted-foreground">Chain ID: 69420</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-muted-foreground space-y-1.5 pt-2">
                    <p>• Network will be automatically added if not present</p>
                    <p>• Make sure you have some ETH for gas fees</p>
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
