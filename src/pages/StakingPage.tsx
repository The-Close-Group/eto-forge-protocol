import { useState, useEffect } from 'react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, Shield, Vault, Info, Loader2, 
  ChevronRight, RefreshCw, Zap,
  Sparkles, Calculator, Wallet, Plus, Target,
  ArrowDownUp, Check
} from 'lucide-react';
import { useVaultStaking } from '@/hooks/useVaultStaking';
import { useQuery } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { DRI_TOKEN_ADDRESS, USDC_ADDRESS } from '@/config/contracts';
import { useProtocolStore, selectPrices } from '@/stores/protocolStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { Link } from 'react-router-dom';
import maangLogo from '@/assets/maang-logo.svg';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

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
  
  // Get real MAANG price from protocol store
  const prices = useProtocolStore(selectPrices);
  const maangPrice = prices.dmmPrice || 318;
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositMode, setDepositMode] = useState<'usdc' | 'maang'>('usdc');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
  const { data: vaultStats, refetch: refetchStats } = useQuery({
    queryKey: ['vault-stats'],
    queryFn: getVaultStats,
    refetchInterval: 10000,
    retry: 2,
  });

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing...", { id: "refresh" });
    await Promise.all([refetchBalances(), refetchStats()]);
    await new Promise(r => setTimeout(r, 500));
    toast.success("Data refreshed", { id: "refresh" });
    setIsRefreshing(false);
  };

  const handleDeposit = async () => {
    if (!depositAmount || !account?.address) {
      toast.error(!depositAmount ? 'Enter an amount' : 'Connect wallet first');
      return;
    }
    
    try {
      const hash = depositMode === 'usdc' ? await depositUSDC(depositAmount) : await depositDRI(depositAmount);
      if (hash) {
        setDepositAmount('');
        refetchBalances();
        refetchStats();
      }
    } catch (err) {
      toast.error('Deposit failed: ' + (err as Error).message);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawShares || !account?.address) {
      toast.error(!withdrawShares ? 'Enter shares amount' : 'Connect wallet first');
      return;
    }
    
    try {
      const hash = await redeemShares(withdrawShares);
      if (hash) {
        setWithdrawShares('');
        refetchBalances();
        refetchStats();
      }
    } catch (err) {
      toast.error('Withdrawal failed: ' + (err as Error).message);
    }
  };

  const setMaxDeposit = () => {
    if (depositMode === 'usdc' && balances?.usdc) {
      setDepositAmount((Number(balances.usdc) / 1e6).toFixed(2));
    } else if (depositMode === 'maang' && balances?.dri) {
      setDepositAmount((Number(balances.dri) / 1e18).toFixed(6));
    }
  };

  const setMaxWithdraw = () => {
    if (balances?.shares) setWithdrawShares((Number(balances.shares) / 1e18).toFixed(6));
  };

  const driBalance = balances ? (Number(balances.dri) / 1e18).toFixed(4) : '0';
  const usdcBalance = balances ? (Number(balances.usdc) / 1e6).toFixed(2) : '0';
  const sharesBalance = balances ? (Number(balances.shares) / 1e18).toFixed(4) : '0';
  const sharePrice = vaultStats?.sharePrice?.toFixed(4) || '1.0000';
  const totalAssets = vaultStats?.totalAssets ? (Number(vaultStats.totalAssets) / 1e18) : 0;
  
  // Calculate estimated value in USD: shares × sharePrice (MAANG per share) × MAANG price (USD)
  const sharesInMAANG = balances?.shares ? (Number(balances.shares) / 1e18) * (vaultStats?.sharePrice || 1) : 0;
  const estimatedValue = sharesInMAANG * maangPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-[1440px] mx-auto p-6">
        <div 
          className={`mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
            <Vault className="w-4 h-4" />
            <span>sMAANG Vault • Liquid Staking</span>
            <Badge variant="outline" className="ml-2 text-[10px]">Live</Badge>
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-2">Staking & Liquidity</h1>
          <p className="text-muted-foreground text-[15px]">
            Deposit assets to earn yield from protocol trading fees
        </p>
      </div>

        {/* Main Grid - Dashboard Style */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div 
            className={`space-y-6 transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Vault Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Vault Assets', value: `${totalAssets.toLocaleString()} MAANG`, icon: <Vault className="w-4 h-4" /> },
                { label: 'Share Price', value: sharePrice, icon: <TrendingUp className="w-4 h-4" /> },
                { label: 'Your Shares', value: sharesBalance, icon: <Wallet className="w-4 h-4" /> },
                { label: 'Est. Value', value: `$${estimatedValue.toFixed(2)}`, icon: <Calculator className="w-4 h-4" />, highlight: true },
              ].map((stat) => (
                <Card key={stat.label} className="group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      {stat.icon}
                      <span className="text-[12px]">{stat.label}</span>
            </div>
                    <div className={`text-xl font-semibold ${stat.highlight ? 'text-primary' : ''}`}>
                      {stat.value}
            </div>
        </CardContent>
      </Card>
              ))}
              </div>

            {/* Main Action Card */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Vault Operations
                  </CardTitle>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <button
                      className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                        activeTab === 'deposit' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('deposit')}
                    >
                      Deposit
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                        activeTab === 'withdraw' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('withdraw')}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {activeTab === 'deposit' ? (
                  <div className="space-y-6">
                    {/* Token Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'usdc', label: 'USDC', balance: usdcBalance, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040' },
                        { id: 'maang', label: 'MAANG', balance: driBalance, logo: maangLogo },
                      ].map((token) => (
                        <button
                          key={token.id}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative ${
                            depositMode === token.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setDepositMode(token.id as 'usdc' | 'maang')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center p-2">
                              <img src={token.logo} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <div className="font-medium">{token.label}</div>
                              <div className="text-[12px] text-muted-foreground">
                                Balance: {token.balance}
                              </div>
                            </div>
                          </div>
                          {depositMode === token.id && (
                            <Check className="w-5 h-5 text-primary absolute top-3 right-3" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount to Deposit</span>
                        <button className="text-primary text-[12px] hover:underline" onClick={setMaxDeposit}>
                          Use Max
                        </button>
                      </div>
                      <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                          placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '.');
                        if (/^\d*(?:\.\d{0,18})?$/.test(v)) setDepositAmount(v);
                          }}
                          className="text-2xl font-mono h-14 pr-20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          {depositMode.toUpperCase()}
                        </span>
                </div>
              </div>

                    {/* You Receive Preview */}
                    {depositAmount && parseFloat(depositAmount) > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] text-muted-foreground">You will receive</span>
                          <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Vault className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">
                              ~{(parseFloat(depositAmount) / (vaultStats?.sharePrice || 1)).toFixed(4)} sMAANG
                            </div>
                            <div className="text-[12px] text-muted-foreground">Vault Shares</div>
                          </div>
                        </div>
                </div>
              )}

                    {/* Deposit Button */}
                    {!account ? (
                      <ConnectButton
                        client={client}
                        wallets={wallets}
                        chain={etoMainnet}
                        chains={supportedChains}
                        connectModal={{ size: "compact" }}
                        connectButton={{
                          label: "Connect Wallet to Deposit",
                          style: {
                            width: "100%",
                            background: "hsl(160 70% 50%)",
                            color: "#000",
                            border: "none",
                            borderRadius: "12px",
                            padding: "14px",
                            fontSize: "14px",
                            fontWeight: "600",
                          },
                        }}
                      />
                    ) : (
                      <Button
                        variant="cta"
                        size="xl"
                        className="w-full"
                        onClick={handleDeposit}
                        disabled={isLoading || !depositAmount || vaultStats?.depositsPaused}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Deposit {depositMode.toUpperCase()}
                          </>
                        )}
                      </Button>
                    )}

                    {/* Gas Sponsored */}
                    <div className="flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
                      <Shield className="w-3.5 h-3.5 text-data-positive" />
                      <span>Gas fees sponsored by ETO</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Shares Input */}
              <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shares to Redeem</span>
                        <button className="text-primary text-[12px] hover:underline" onClick={setMaxWithdraw}>
                          Use Max ({sharesBalance})
                        </button>
                  </div>
                      <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                          placeholder="0.00"
                    value={withdrawShares}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '.');
                      if (/^\d*(?:\.\d{0,18})?$/.test(v)) setWithdrawShares(v);
                    }}
                          className="text-2xl font-mono h-14 pr-24"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          sMAANG
                        </span>
                </div>
              </div>

                    {/* You Receive Preview */}
              {withdrawShares && parseFloat(withdrawShares) > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] text-muted-foreground">You will receive</span>
                          <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center p-1.5">
                            <img src={maangLogo} alt="" className="w-full h-full" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">
                              ~{(parseFloat(withdrawShares) * (vaultStats?.sharePrice || 1)).toFixed(4)} MAANG
                            </div>
                            <div className="text-[12px] text-muted-foreground">Dynamic Reflective Index</div>
                          </div>
                  </div>
                </div>
              )}

                    {/* Withdraw Button */}
              <Button
                      variant="outline"
                      size="xl"
                className="w-full"
                      onClick={handleWithdraw}
                disabled={isLoading || !withdrawShares || !account}
              >
                {isLoading ? (
                  <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                        <>
                          <TrendingDown className="w-4 h-4 mr-2" />
                          Redeem Shares
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Position Card */}
            {account && balances?.shares && Number(balances.shares) > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Your Position
                    </CardTitle>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="stat-item">
                      <div className="stat-label">Staked Value</div>
                      <div className="stat-value text-lg">${estimatedValue.toFixed(2)}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Your Shares</div>
                      <div className="stat-value text-lg text-primary">{sharesBalance}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">MAANG Value</div>
                      <div className="stat-value text-lg text-data-positive">
                        {sharesInMAANG.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-[13px] text-muted-foreground">
                    <span>Position Growth (30D)</span>
                    <span className="period-badge">30D</span>
                  </div>
                  <Sparkline data={generateSparklineData(30, 'up')} height={60} variant="positive" showArea={true} />
                </CardContent>
              </Card>
            )}

            {/* How It Works */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  How Liquid Staking Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: '1', title: 'Deposit', desc: 'Add USDC or MAANG to the vault' },
                    { step: '2', title: 'Receive', desc: 'Get sMAANG vault shares' },
                    { step: '3', title: 'Earn', desc: 'Vault earns trading fees' },
                    { step: '4', title: 'Redeem', desc: 'Withdraw anytime for MAANG' },
                  ].map((item) => (
                    <div key={item.step} className="relative p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center mb-3">
                        {item.step}
                      </div>
                      <div className="font-medium text-[14px] mb-1">{item.title}</div>
                      <div className="text-[12px] text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div 
            className={`space-y-5 transition-all duration-700 delay-200 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* CTA Card */}
            <div className="cta-card">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5">
                    <img src={maangLogo} alt="" className="w-full h-full" />
                  </div>
                  <div>
                    <div className="font-semibold">sMAANG Vault</div>
                    <div className="text-[11px] text-muted-foreground">Liquid Staking</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-[11px] text-muted-foreground mb-1">Share Price</div>
                  <div className="text-[42px] font-semibold tracking-tight leading-none text-primary">
                    {sharePrice}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">MAANG per share</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>No lock-up period</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>Compound rewards automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>Withdraw anytime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Quick Actions</CardTitle>
        </CardHeader>
              <CardContent className="space-y-0.5">
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/trade">
                    <span className="text-[13px]">Trade MAANG</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/dashboard">
                    <span className="text-[13px]">View Dashboard</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/faucet">
                    <span className="text-[13px]">Get Test Tokens</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
        </CardContent>
      </Card>

            {/* Refresh Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
