import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Shield, Vault, Info } from 'lucide-react';
import { useVaultStaking } from '@/hooks/useVaultStaking';
import { useQuery } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { DRI_TOKEN_ADDRESS, USDC_ADDRESS, SMAANG_VAULT_ADDRESS } from '@/config/contracts';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export default function StakingPage() {
  const account = useActiveAccount();
  const { depositUSDC, depositDRI, redeemShares, getVaultShares, getVaultStats, isLoading } = useVaultStaking();
  
  // Deposit state
  const [depositMode, setDepositMode] = useState<'usdc' | 'dri'>('usdc');
  const [depositAmount, setDepositAmount] = useState('');
  
  // Withdraw state
  const [withdrawShares, setWithdrawShares] = useState('');

  // Fetch balances
  const { data: balances, refetch: refetchBalances } = useQuery({
    queryKey: ['staking-balances', account?.address],
    queryFn: async () => {
      if (!account?.address) return { dri: 0n, usdc: 0n, shares: 0n };
      
      const [dri, usdc, shares] = await Promise.all([
        etoPublicClient.readContract({
          address: DRI_TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
        etoPublicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
        getVaultShares(),
      ]);
      
      return { dri, usdc, shares };
    },
    enabled: !!account?.address,
    refetchInterval: 5000,
  });

  // Fetch vault stats
  const { data: vaultStats } = useQuery({
    queryKey: ['vault-stats'],
    queryFn: getVaultStats,
    refetchInterval: 10000,
  });

  const handleDeposit = async () => {
    console.log('[StakingPage] handleDeposit called', { depositAmount, depositMode, account: account?.address });
    
    if (!depositAmount) {
      console.log('[StakingPage] No deposit amount');
      toast.error('Please enter an amount');
      return;
    }
    
    if (!account?.address) {
      console.log('[StakingPage] No account connected');
      toast.error('Please connect your wallet');
      return;
    }
    
    console.log('[StakingPage] Starting deposit...', { mode: depositMode, amount: depositAmount });
    
    let hash: string | null = null;
    try {
      if (depositMode === 'usdc') {
        console.log('[StakingPage] Calling depositUSDC...');
        hash = await depositUSDC(depositAmount);
      } else {
        console.log('[StakingPage] Calling depositDRI (MAANG)...');
        hash = await depositDRI(depositAmount);
      }
      console.log('[StakingPage] Deposit result:', hash);
    } catch (err) {
      console.error('[StakingPage] Deposit error:', err);
      toast.error('Deposit failed: ' + (err as Error).message);
    }
    
    if (hash) {
      setDepositAmount('');
      refetchBalances();
    }
  };

  const handleWithdraw = async () => {
    console.log('[StakingPage] handleWithdraw called', { withdrawShares, account: account?.address });
    
    if (!withdrawShares) {
      console.log('[StakingPage] No withdraw shares');
      toast.error('Please enter shares to withdraw');
      return;
    }
    
    if (!account?.address) {
      console.log('[StakingPage] No account connected');
      toast.error('Please connect your wallet');
      return;
    }
    
    console.log('[StakingPage] Starting withdrawal...', { shares: withdrawShares });
    
    let hash: string | null = null;
    try {
      console.log('[StakingPage] Calling redeemShares...');
      hash = await redeemShares(withdrawShares);
      console.log('[StakingPage] Withdraw result:', hash);
    } catch (err) {
      console.error('[StakingPage] Withdraw error:', err);
      toast.error('Withdrawal failed: ' + (err as Error).message);
    }
    
    if (hash) {
      setWithdrawShares('');
      refetchBalances();
    }
  };

  const setMaxDeposit = () => {
    if (depositMode === 'usdc' && balances?.usdc) {
      setDepositAmount((Number(balances.usdc) / 1e6).toFixed(2));
    } else if (depositMode === 'dri' && balances?.dri) {
      setDepositAmount((Number(balances.dri) / 1e18).toFixed(6));
    }
  };

  const setMaxWithdraw = () => {
    if (balances?.shares) {
      setWithdrawShares((Number(balances.shares) / 1e18).toFixed(6));
    }
  };

  const driBalance = balances ? (Number(balances.dri) / 1e18).toFixed(6) : '0';
  const usdcBalance = balances ? (Number(balances.usdc) / 1e6).toFixed(2) : '0';
  const sharesBalance = balances ? (Number(balances.shares) / 1e18).toFixed(6) : '0';
  const sharePrice = vaultStats?.sharePrice?.toFixed(4) || '1.0000';
  const totalAssets = vaultStats?.totalAssets ? (Number(vaultStats.totalAssets) / 1e18).toLocaleString() : '0';

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Staking & Liquidity</h1>
        <p className="text-muted-foreground">
          Deposit into the sMAANG Vault and earn from protocol liquidity
        </p>
      </div>

      {/* Vault Info Card */}
      <Card className="mb-6 bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
              <div className="text-xl font-bold">{totalAssets} MAANG</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Share Price</div>
              <div className="text-xl font-bold">{sharePrice}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Your Shares</div>
              <div className="text-xl font-bold">{sharesBalance}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deposit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Deposit to Vault
              </CardTitle>
              <CardDescription>
                Deposit USDC or MAANG to receive sMAANG vault shares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deposit Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={depositMode === 'usdc' ? 'default' : 'outline'}
                  onClick={() => setDepositMode('usdc')}
                  className="flex-1"
                >
                  USDC
                </Button>
                <Button
                  variant={depositMode === 'dri' ? 'default' : 'outline'}
                  onClick={() => setDepositMode('dri')}
                  className="flex-1"
                >
                  MAANG
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {depositMode === 'usdc' ? 'USDC Amount' : 'MAANG Amount'}
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Balance: {depositMode === 'usdc' ? `${usdcBalance} USDC` : `${driBalance} MAANG`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '.');
                      if (depositMode === 'usdc') {
                        if (/^\d*(?:\.\d{0,6})?$/.test(v)) setDepositAmount(v);
                      } else {
                        if (/^\d*(?:\.\d{0,18})?$/.test(v)) setDepositAmount(v);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={setMaxDeposit} size="sm">
                    MAX
                  </Button>
                </div>
              </div>

              {vaultStats?.depositsPaused && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Vault deposits are currently paused
                  </AlertDescription>
                </Alert>
              )}

              {/* Debug: show why button might be disabled */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground mb-2">
                  Debug: isLoading={String(isLoading)}, amount={depositAmount || 'empty'}, 
                  account={account?.address?.slice(0,8) || 'none'}, 
                  depositsPaused={String(!!vaultStats?.depositsPaused)}
                </div>
              )}
              <Button
                className="w-full"
                onClick={() => {
                  console.log('[Button] Clicked! Calling handleDeposit...');
                  handleDeposit();
                }}
                disabled={isLoading || !depositAmount || !account || vaultStats?.depositsPaused}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Deposit ${depositMode.toUpperCase()}`
                )}
              </Button>

              {account && (
                <div className="text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Gas fees sponsored</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Withdraw from Vault
              </CardTitle>
              <CardDescription>
                Redeem your sMAANG shares for MAANG
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Shares to Redeem</label>
                  <div className="text-xs text-muted-foreground">
                    Your Shares: {sharesBalance} sMAANG
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={withdrawShares}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '.');
                      if (/^\d*(?:\.\d{0,18})?$/.test(v)) setWithdrawShares(v);
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={setMaxWithdraw} size="sm">
                    MAX
                  </Button>
                </div>
              </div>

              {withdrawShares && parseFloat(withdrawShares) > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="text-muted-foreground">You will receive approximately:</div>
                  <div className="text-lg font-semibold">
                    {(parseFloat(withdrawShares) * (vaultStats?.sharePrice || 1)).toFixed(6)} MAANG
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  console.log('[Button] Withdraw clicked! Calling handleWithdraw...');
                  handleWithdraw();
                }}
                disabled={isLoading || !withdrawShares || !account}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Redeem Shares'
                )}
              </Button>

              {account && (
                <div className="text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Gas fees sponsored</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Vault className="h-4 w-4" />
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Deposit</strong>: Add USDC or MAANG to receive sMAANG vault shares</p>
          <p>• <strong>Earn</strong>: The vault deploys your assets to DMM & PSM for yield</p>
          <p>• <strong>Withdraw</strong>: Redeem shares anytime for your proportional MAANG</p>
          <p>• <strong>Share Price</strong>: Grows as the vault earns trading fees</p>
        </CardContent>
      </Card>
    </div>
  );
}
