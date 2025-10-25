import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActiveAccount } from 'thirdweb/react';
import { ArrowDownUp, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Stargate Finance supported chains
const STARGATE_CHAINS = [
  { key: 'ethereum', name: 'Ethereum', chainId: 1 },
  { key: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
  { key: 'base', name: 'Base', chainId: 8453 },
  { key: 'polygon', name: 'Polygon', chainId: 137 },
  { key: 'optimism', name: 'Optimism', chainId: 10 },
  { key: 'avalanche', name: 'Avalanche', chainId: 43114 },
];

// Common tokens available on multiple chains
const CROSS_CHAIN_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'WETH', name: 'Wrapped Ethereum' },
];

interface StargateQuote {
  srcChainKey: string;
  dstChainKey: string;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  dstAmountMin: string;
  fee: string;
  estimatedTime: string;
}

export default function Bridge() {
  const account = useActiveAccount();
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('eto'); // ETO as destination
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('mUSDC'); // Convert to mUSDC on ETO
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<StargateQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get quote with demo $0.10 fee
  const getStargateQuote = async () => {
    if (!amount || !account?.address) return;

    setIsLoadingQuote(true);
    try {
      // Demo quote calculation with $0.10 fee
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const bridgeFee = 0.10;
      const amountNum = parseFloat(amount);
      const receivedAmount = amountNum - bridgeFee;
      
      const demoQuote: StargateQuote = {
        srcChainKey: fromChain,
        dstChainKey: 'eto',
        srcToken: fromToken,
        dstToken: toToken,
        srcAmount: amount,
        dstAmountMin: receivedAmount.toFixed(2),
        fee: `$${bridgeFee.toFixed(2)}`,
        estimatedTime: '2-5 minutes'
      };
      
      setQuote(demoQuote);
      toast.success('Quote generated successfully!');
    } catch (error) {
      console.error('Quote generation error:', error);
      toast.error('Unable to get quote. Please try again.');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Execute cross-chain swap
  const executeSwap = async () => {
    if (!quote || !account) return;

    setIsExecuting(true);
    try {
      // This would integrate with Stargate's transaction execution
      // For now, we'll show a placeholder
      toast.info('Cross-chain bridge integration coming soon!');
      
      // TODO: Implement actual Stargate transaction execution
      // 1. Prepare transaction from quote
      // 2. Sign with user's wallet
      // 3. Submit to source chain
      // 4. Monitor cross-chain execution
      
    } catch (error) {
      console.error('Swap execution error:', error);
      toast.error('Bridge execution failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6 max-w-2xl">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Cross-Chain Bridge</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bridge tokens from other chains to ETO Testnet using Stargate Finance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5" />
              Stargate Bridge
            </CardTitle>
            <CardDescription>
              Seamlessly transfer tokens across chains to trade on ETO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* From Chain & Token */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">From Chain</Label>
                  <Select value={fromChain} onValueChange={setFromChain}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STARGATE_CHAINS.map((chain) => (
                        <SelectItem key={chain.key} value={chain.key}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">From Token</Label>
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CROSS_CHAIN_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 sm:h-10"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                <ArrowDownUp className="h-4 w-4" />
              </div>
            </div>

            {/* To Chain & Token (Fixed to ETO) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">To Chain</Label>
                  <div className="px-3 py-2.5 sm:py-2 border rounded-md bg-muted h-11 sm:h-10 flex items-center">
                    ETO Testnet
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">To Token</Label>
                  <div className="px-3 py-2.5 sm:py-2 border rounded-md bg-muted h-11 sm:h-10 flex items-center">
                    Mock USDC (mUSDC)
                  </div>
                </div>
              </div>

              {quote && (
                <div className="space-y-2">
                  <Label>You'll Receive</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted font-mono">
                    ~{quote.dstAmountMin} mUSDC
                  </div>
                </div>
              )}
            </div>

            {/* Quote & Execute */}
            <div className="space-y-3 sm:space-y-4">
              <Button
                onClick={getStargateQuote}
                disabled={!amount || !account || isLoadingQuote}
                className="w-full h-11 sm:h-10"
                variant="outline"
              >
                {isLoadingQuote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  'Get Quote'
                )}
              </Button>

              {quote && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bridge Fee</span>
                      <span className="font-mono">{quote.fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Estimated Time</span>
                      <span>{quote.estimatedTime}</span>
                    </div>
                  </div>

                  <Button
                    onClick={executeSwap}
                    disabled={isExecuting}
                    className="w-full h-11 sm:h-10"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executing Bridge...
                      </>
                    ) : (
                      'Execute Cross-Chain Bridge'
                    )}
                  </Button>
                </div>
              )}
            </div>

            {!account && (
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                Connect your wallet to start cross-chain bridging
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <strong>Bridge to ETO:</strong> Transfer tokens from any supported chain to ETO Testnet
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <strong>Auto-Convert:</strong> Tokens are automatically converted to mUSDC on ETO
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <strong>Start Trading:</strong> Use mUSDC to trade MAANG via DMM on ETO
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Link */}
        <div className="flex justify-center">
          <Button variant="ghost" asChild>
            <a
              href="https://stargate.finance/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Powered by Stargate Finance
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
