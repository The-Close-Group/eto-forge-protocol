import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, Wallet, ArrowUpRight, Clock, RefreshCw, ChevronRight, 
  ChevronDown, Zap, Lock, Bell, Plus, BarChart3,
  Menu, User, LogOut, TrendingUp, TrendingDown, Check, X, Copy,
  Calculator, PieChart, Shield, AlertTriangle, Sparkles, Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveAccount, ConnectButton, useSwitchActiveWalletChain, useActiveWallet } from "thirdweb/react";
import { client, etoMainnet, supportedChains, etoMainnetParams } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
import { useOraclePriceHistory, useStakingStats, useVaultSnapshotHistory, useUserStakingStats, useUserDepositsAndWithdrawals, timeFilterToHours } from "@/lib/graphql";
import { useQuery } from "@tanstack/react-query";
import { etoPublicClient } from "@/lib/etoRpc";
import { SMAANG_VAULT_ADDRESS } from "@/config/contracts";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import { toast } from "sonner";
import { useStakingContext } from "@/contexts/StakingContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export default function Dashboard() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { signOut } = useAuth();
  const switchChain = useSwitchActiveWalletChain();
  const activeWallet = useActiveWallet();
  
  // Staking context
  const { 
    assets,
    selectedAsset,
    selectAsset,
    investmentPeriod,
    setInvestmentPeriod,
    stakeAmount,
    setStakeAmount,
    autoCompound,
    setAutoCompound,
    calculateProjection,
    getEffectiveAPY,
    positions,
    addPosition,
    removePosition,
    getTotalStaked,
    getTotalRewards,
    timeFilter,
    setTimeFilter,
    sortOrder,
    setSortOrder,
    getRiskScore,
  } = useStakingContext();
  
  // UI states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  // NOTE: Notifications are empty - real notifications should come from backend/events
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; time: string; read: boolean }>>([]);
  
  const { data: protocolStats, isLoading: isLoadingProtocol, refetch: refetchStats } = useProtocolStats();
  const { data: protocolActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useProtocolActivity();
  
  // Convert time filter to hours for data queries
  const timeFilterHours = useMemo(() => timeFilterToHours(timeFilter), [timeFilter]);
  
  // Subgraph data for sparklines - real oracle price history (responds to time filter)
  const { data: oraclePriceData, isLoading: isLoadingPriceHistory } = useOraclePriceHistory(timeFilterHours);
  
  // Subgraph staking stats - real data from vault snapshots (responds to time filter)
  const { data: stakingStats, isLoading: isLoadingStakingStats } = useStakingStats(timeFilterHours);
  const { data: vaultHistory } = useVaultSnapshotHistory(timeFilterHours);
  
  // User-specific staking stats from subgraph (live data for connected wallet)
  const { data: userStakingStats, isLoading: isLoadingUserStats } = useUserStakingStats(account?.address);
  
  // Real user deposits/withdrawals from subgraph (actual staking positions)
  const { data: userStakingData, isLoading: isLoadingUserStaking } = useUserDepositsAndWithdrawals(account?.address);
  
  // On-chain vault balance - fallback when subgraph is unavailable
  const VAULT_ABI = [
    { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'totalAssets', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  ] as const;
  
  const { data: onChainVaultData, isLoading: isLoadingOnChainVault, refetch: refetchOnChainVault } = useQuery({
    queryKey: ['on-chain-vault-balance', account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      
      const [shares, totalAssets, totalSupply] = await Promise.all([
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalAssets',
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalSupply',
        }),
      ]);
      
      const sharePrice = totalSupply > 0n ? Number(totalAssets) / Number(totalSupply) : 1;
      const sharesFormatted = Number(shares) / 1e18;
      const assetsValue = sharesFormatted * sharePrice;
      
      return {
        shares,
        sharesFormatted,
        totalAssets,
        totalSupply,
        sharePrice,
        assetsValue, // Value in MAANG
        hasPosition: shares > 0n,
      };
    },
    enabled: !!account?.address,
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // 30 seconds
  });
  
  const hasWallet = !!account?.address;

  // Calculate current projection
  const currentProjection = useMemo(() => 
    calculateProjection(stakeAmount, investmentPeriod),
    [calculateProjection, stakeAmount, investmentPeriod]
  );

  // Sort and filter assets
  const sortedAssets = useMemo(() => {
    let sorted = [...assets];
    switch (sortOrder) {
      case 'apy':
        sorted.sort((a, b) => getEffectiveAPY(b.baseAPY, investmentPeriod, autoCompound) - getEffectiveAPY(a.baseAPY, investmentPeriod, autoCompound));
        break;
      case 'tvl':
        sorted.sort((a, b) => b.tvl - a.tvl);
        break;
      case 'risk':
        const riskOrder = { low: 0, medium: 1, high: 2 };
        sorted.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
        break;
    }
    return sorted.slice(0, 3); // Top 3
  }, [assets, sortOrder, getEffectiveAPY, investmentPeriod, autoCompound]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing data...", { id: "refresh" });
    
    try {
      await Promise.all([refetchStats(), refetchActivity(), refetchOnChainVault()]);
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Data refreshed successfully", { id: "refresh" });
    } catch (error) {
      toast.error("Failed to refresh data", { id: "refresh" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStake = () => {
    if (!hasWallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!selectedAsset) {
      toast.error("Please select an asset to stake");
      return;
    }
    setStakeDialogOpen(true);
  };

  const handleConfirmStake = () => {
    if (!selectedAsset) return;
    addPosition(selectedAsset.id, stakeAmount, investmentPeriod);
    setStakeDialogOpen(false);
    setStakeAmount(100); // Reset
  };

  const handleUnstake = (positionId: string) => {
    setSelectedPositionId(positionId);
    setUnstakeDialogOpen(true);
  };

  const handleConfirmUnstake = () => {
    if (selectedPositionId) {
      removePosition(selectedPositionId);
      setUnstakeDialogOpen(false);
      setSelectedPositionId(null);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sliderPosition = ((investmentPeriod - 1) / 11) * 100;

  // Get active position for display
  const activePosition = positions[0];
  const activeAsset = activePosition ? assets.find(a => a.id === activePosition.assetId) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Stake Dialog */}
      <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Confirm Staking
            </DialogTitle>
            <DialogDescription>Review your staking details before confirming</DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-6 py-4">
              {/* Asset Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
                  style={{ background: `${selectedAsset.color}15` }}
                >
                  <img src={selectedAsset.logo} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{selectedAsset.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedAsset.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {currentProjection.effectiveAPY.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Effective APY</div>
                </div>
              </div>

              {/* Amount Input */}
        <div className="space-y-2">
                <Label>Stake Amount ({selectedAsset.symbol})</Label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                  min={selectedAsset.minStake}
                  max={selectedAsset.maxStake}
                  className="text-lg font-mono"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {selectedAsset.minStake}</span>
                  <span>Max: {selectedAsset.maxStake}</span>
                </div>
              </div>

              {/* Lock Period */}
              <div className="space-y-3">
                <Label>Lock Period</Label>
                <div className="flex gap-2">
                  {selectedAsset.lockPeriods.map(months => (
                    <Button
                      key={months}
                      variant={investmentPeriod === months ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInvestmentPeriod(months)}
                      className="flex-1"
                    >
                      {months}M
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-compound */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Auto-compound rewards</span>
                </div>
                <Switch checked={autoCompound} onCheckedChange={setAutoCompound} />
              </div>

              {/* Projection Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Principal</div>
                  <div className="font-semibold">{stakeAmount.toLocaleString()} {selectedAsset.symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Est. Rewards</div>
                  <div className="font-semibold text-primary">+{currentProjection.totalRewards.toFixed(4)} {selectedAsset.symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Monthly Rewards</div>
                  <div className="font-semibold">{currentProjection.monthlyRewards.toFixed(4)} {selectedAsset.symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">End Value</div>
                  <div className="font-semibold">{currentProjection.endValue.toLocaleString()} {selectedAsset.symbol}</div>
                </div>
              </div>

              {/* Risk Indicator */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Shield className={`w-5 h-5 ${currentProjection.riskScore < 40 ? 'text-data-positive' : currentProjection.riskScore < 70 ? 'text-warning' : 'text-data-negative'}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">Risk Score</div>
                  <Progress value={currentProjection.riskScore} className="h-1.5 mt-1" />
                </div>
                <span className="text-sm font-medium">{currentProjection.riskScore}/100</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStakeDialogOpen(false)}>Cancel</Button>
            <Button variant="cta" onClick={handleConfirmStake}>
              Confirm Stake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unstake Dialog */}
      <Dialog open={unstakeDialogOpen} onOpenChange={setUnstakeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Confirm Unstaking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unstake this position? You may lose some pending rewards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnstakeDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmUnstake}>
              Confirm Unstake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Staking Calculator
            </DialogTitle>
            <DialogDescription>Calculate your potential rewards</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Amount Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Stake Amount</Label>
                <span className="text-sm font-mono">${stakeAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$100</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* Period Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Lock Period</Label>
                <span className="text-sm font-mono">{investmentPeriod} months</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 month</span>
                <span>12 months</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4">
              {assets.slice(0, 4).map(asset => {
                const projection = calculateProjection(stakeAmount, investmentPeriod, asset.id);
                return (
                  <div 
                    key={asset.id} 
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAsset?.id === asset.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => selectAsset(asset.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img src={asset.logo} alt="" className="w-5 h-5" />
                      <span className="font-medium text-sm">{asset.symbol}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">{projection.effectiveAPY.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">
                      +{projection.totalRewards.toFixed(2)} rewards
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCalculatorOpen(false)}>Close</Button>
            <Button variant="cta" onClick={() => { setCalculatorOpen(false); handleStake(); }}>
              Stake Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Header Bar */}
      <header className="header-bar sticky top-0 z-50 backdrop-blur-sm bg-background/95">
        <div className="flex items-center gap-4">
          {hasWallet ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="user-avatar" />
                    <div className="flex items-center gap-2">
                      {account?.address && (
                        <span className="text-[13px] text-muted-foreground">
                          {account.address.slice(0, 6)}...{account.address.slice(-4)}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/staking')}>
                    <Wallet className="w-4 h-4 mr-2" />
                    My Stakings
                  </DropdownMenuItem>
                  {account?.address && (
                    <DropdownMenuItem onClick={handleCopyAddress}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="deposit-btn ml-4" onClick={handleStake}>
                Deposit
                <Lock className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={etoMainnet}
                chains={supportedChains}
                connectModal={{ size: "wide" }}
                connectButton={{
                  label: "Connect Wallet",
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "hsl(160 70% 50%)",
                    color: "#000",
                    border: "2px solid #000",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    boxShadow: "4px 4px 0px 0px #000",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  },
                }}
                onConnect={async (wallet) => {
                  console.log('Wallet connected:', wallet);
                  const address = wallet.getAccount()?.address;
                  if (address) {
                    try {
                      if (activeWallet && typeof (activeWallet as any).request === "function") {
                        await (activeWallet as any).request({
                          method: 'wallet_addEthereumChain',
                          params: [etoMainnetParams],
                        });
                        console.log('ETO L1 chain config updated');
                      }
                    } catch (addError: any) {
                      console.log('Chain add result:', addError?.message || 'success');
                    }

                    try {
                      await switchChain(etoMainnet);
                      toast.success('Connected to ETO L1');
                    } catch (error) {
                      console.error('Failed to switch chain:', error);
                      toast.error('Please switch to ETO L1 manually in your wallet');
                    }

                    const isNewUser = !localStorage.getItem('eto-user-onboarded');
                    if (isNewUser) {
                      navigate('/faucet');
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="icon-btn relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] font-bold flex items-center justify-center text-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-[13px] font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <button className="text-[11px] text-primary hover:underline" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0"
                    onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                  >
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium">{notif.title}</div>
                        <div className="text-[12px] text-muted-foreground">{notif.message}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{notif.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="icon-btn" onClick={() => setCalculatorOpen(true)}>
            <Calculator className="w-4 h-4" />
          </button>

          <button 
            className={`icon-btn ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto p-6 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-1.5">
              <span>Recommended coins for {timeFilter.toLowerCase()}</span>
              <Clock className="w-3.5 h-3.5" />
              <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium">
                {assets.length} Assets
              </span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight">Top Staking Assets</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {(['24H', '7D', '30D'] as const).map(time => (
              <button 
                key={time}
                className={`filter-pill ${timeFilter === time ? 'filter-pill-active' : ''}`}
                onClick={() => { setTimeFilter(time); toast.info(`Showing ${time} data`); }}
              >
                {time}
              </button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="filter-dropdown">
                  {sortOrder === 'apy' ? 'APY' : sortOrder === 'tvl' ? 'TVL' : 'Risk'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOrder('apy')}>
                  {sortOrder === 'apy' && <Check className="w-4 h-4 mr-2" />}
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Highest APY
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('tvl')}>
                  {sortOrder === 'tvl' && <Check className="w-4 h-4 mr-2" />}
                  <PieChart className="w-4 h-4 mr-2" />
                  Highest TVL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('risk')}>
                  {sortOrder === 'risk' && <Check className="w-4 h-4 mr-2" />}
                  <Shield className="w-4 h-4 mr-2" />
                  Lowest Risk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
                       </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Asset Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedAssets.map((asset) => {
                const effectiveAPY = getEffectiveAPY(asset.baseAPY, investmentPeriod, autoCompound);
                // Use real subgraph data for MAANG price history, fallback to seeded generated data
                const hasRealData = asset.symbol === 'MAANG' && oraclePriceData?.sparklineData && oraclePriceData.sparklineData.length > 5;
                const sparkData = hasRealData 
                  ? oraclePriceData.sparklineData 
                  : generateSparklineData(30, asset.riskLevel === 'high' ? 'down' : 'up', asset.id);
                const isSelected = selectedAsset?.id === asset.id;
                
                // Handle click - navigate directly to the relevant page
                const handleCardClick = () => {
                  selectAsset(asset.id);
                  // Navigate to the appropriate page
                  if (asset.id === 'smaang') {
                    navigate('/staking');
                  } else {
                    // MAANG and USDC both go to buy-maang
                    navigate('/buy-maang');
                  }
                };
                     
                    return (
                  <div 
                    key={asset.id}

                    className={`staking-asset-card cursor-pointer group ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={handleCardClick}
                  >
                    <div className="flex items-center justify-between mb-3">

                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
                          style={{ background: `${asset.color}15` }}
                        >
                          <img src={asset.logo} alt={asset.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground">{asset.type.toUpperCase()}</div>
                          <div className="text-[13px] font-medium">{asset.name}</div>
                        </div>
                                </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                    
                    {/* Price Display */}
                    <div className="mb-2 pb-2 border-b border-border/30">
                      <div className="text-[10px] text-muted-foreground mb-0.5">Price</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[18px] font-semibold tracking-tight">
                          ${asset.price >= 1 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">USD</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">Reward Rate</div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[24px] font-semibold tracking-tight">{effectiveAPY.toFixed(2)}</span>
                        <span className="text-base text-muted-foreground font-normal">%</span>
                                </div>
                              </div>
                    
                    <div className={`status-badge ${asset.riskLevel === 'low' ? 'status-badge-positive' : asset.riskLevel === 'high' ? 'status-badge-negative' : ''} mb-3`}>
                      <span className="w-[5px] h-[5px] rounded-full bg-current" />
                      {asset.riskLevel} risk
                    </div>
                    
                    <div className="relative">
                      <Sparkline 
                        data={sparkData} 
                        height={55}
                        variant={asset.riskLevel !== 'high' ? 'positive' : 'negative'}
                        showArea={true}
                        showEndValue={true}
                        endValue={`$${(asset.tvl / 1000000).toFixed(1)}M TVL`}
                      />
                    </div>
                          </div>
                );
              })}
            </div>

            {/* Your Active Stakings - Using Real Subgraph Data */}
            <div className="active-staking-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-medium flex items-center gap-2">
                  Your active stakings ({userStakingData?.activePositionCount ?? (onChainVaultData?.hasPosition ? 1 : positions.length)})
                  {(userStakingData || onChainVaultData?.hasPosition) && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                </h2>
                <div className="flex items-center gap-0.5">
                  <button className={`icon-btn ${showChart ? 'bg-muted' : ''}`} onClick={() => setShowChart(!showChart)}>
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button className="icon-btn" onClick={handleStake}>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className={`icon-btn ${isRefreshing || isLoadingUserStaking ? 'animate-spin' : ''}`} onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!hasWallet ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-[15px] font-medium mb-1">Connect Wallet</h3>
                  <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                    Connect your wallet to view and manage your staking positions
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
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "2px solid #000",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        boxShadow: "4px 4px 0px 0px #000",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      },
                    }}
                  />
                </div>
              ) : isLoadingUserStaking || isLoadingOnChainVault ? (
                <div className="space-y-4 py-6">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : ((userStakingData?.activePositionCount ?? 0) === 0 && !onChainVaultData?.hasPosition && positions.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Target className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-[15px] font-medium mb-1">No Active Positions</h3>
                  <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                    Start staking to earn rewards on your crypto assets
                  </p>
                  <Button variant="cta" onClick={handleStake}>
                    Start Staking
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {showChart && (
                    <div className="p-4 rounded-xl bg-muted/30 mb-4">
                      <div className="text-[13px] text-muted-foreground mb-2">Portfolio Performance</div>
                      <Sparkline data={generateSparklineData(50, 'up', 'portfolio-performance')} height={100} variant="accent" showArea={true} />
                    </div>
                  )}

                  {/* Active Position - Using Real Subgraph Data or On-Chain Fallback */}
                  {(userStakingData?.netStaked ?? 0) > 0 || onChainVaultData?.hasPosition || (activePosition && activeAsset) ? (
                    <div className="pb-5 border-b border-border-subtle">
                      <div className="flex items-start gap-3 mb-4">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ background: `${activeAsset?.color || '#4dd4ac'}15` }}
                        >
                          <img src={activeAsset?.logo || '/assets/maang-logo.svg'} alt="" className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-0.5">
                            <span>
                              {onChainVaultData?.hasPosition 
                                ? 'On-chain balance'
                                : `Last Update — ${userStakingData?.positions?.[0] 
                                    ? Math.floor((Date.now() - userStakingData.positions[0].timestamp) / (1000 * 60)) 
                                    : activePosition 
                                      ? Math.floor((Date.now() - activePosition.startDate.getTime()) / (1000 * 60))
                                      : 0} minutes ago`}
                            </span>
                            <Clock className="w-3 h-3" />
                            {(userStakingData || onChainVaultData?.hasPosition) && <span className="text-[8px] text-primary/60 uppercase ml-1">live</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[18px] font-semibold">Stake {activeAsset?.name || 'MAANG'} ({activeAsset?.symbol || 'MAANG'})</h3>
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: activeAsset?.color || '#4dd4ac' }}
                            >
                              <img src={activeAsset?.logo || '/assets/maang-logo.svg'} alt="" className="w-3 h-3 brightness-0 invert" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">
                          {onChainVaultData?.hasPosition ? 'Staked Balance, sMAANG' : `Current Reward Balance, ${activeAsset?.symbol || 'MAANG'}`}
                          {(userStakingData || onChainVaultData?.hasPosition) && <span className="text-[8px] text-primary/60 uppercase ml-1">live</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[46px] font-medium tracking-tight leading-none tabular-nums">
                            {onChainVaultData?.hasPosition 
                              ? onChainVaultData.sharesFormatted.toFixed(2)
                              : (userStakingData?.estimatedRewards ?? activePosition?.earnedRewards ?? 0).toFixed(5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Stats Grid - Using Real User Subgraph Data or On-Chain Fallback */}
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { 
                        label: 'Total Staked', 
                        value: userStakingData?.netStaked && userStakingData.netStaked > 0
                          ? `$${userStakingData.netStaked.toLocaleString(undefined, { maximumFractionDigits: 2 })}` 
                          : onChainVaultData?.hasPosition
                            ? `${onChainVaultData.sharesFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} sMAANG`
                            : stakingStats 
                              ? `$${stakingStats.totalStaked.toLocaleString(undefined, { maximumFractionDigits: 1 })}` 
                              : `$${getTotalStaked().toLocaleString()}`,
                        live: !!userStakingData || !!onChainVaultData?.hasPosition || !!stakingStats
                      },
                      { 
                        label: 'Total Rewards', 
                        value: userStakingData?.estimatedRewards && userStakingData.estimatedRewards > 0
                          ? `+${userStakingData.estimatedRewards.toFixed(4)}` 
                          : onChainVaultData?.hasPosition
                            ? `+${((onChainVaultData.assetsValue - onChainVaultData.sharesFormatted) > 0 ? (onChainVaultData.assetsValue - onChainVaultData.sharesFormatted) : 0).toFixed(4)}`
                            : stakingStats 
                              ? `+${stakingStats.totalRewards.toFixed(4)}` 
                              : `+${getTotalRewards().toFixed(4)}`,
                        live: !!userStakingData || !!onChainVaultData?.hasPosition || !!stakingStats
                      },
                      { 
                        label: 'Active Positions', 
                        value: userStakingData?.activePositionCount && userStakingData.activePositionCount > 0
                          ? userStakingData.activePositionCount.toString() 
                          : onChainVaultData?.hasPosition
                            ? '1'
                            : stakingStats 
                              ? stakingStats.activePositions.toString() 
                              : positions.length.toString(),
                        live: !!userStakingData || !!onChainVaultData?.hasPosition || !!stakingStats
                      },
                      { 
                        label: 'Avg APY', 
                        value: stakingStats 
                          ? `${stakingStats.avgAPY.toFixed(2)}%` 
                          : `${(positions.reduce((sum, p) => sum + p.apy, 0) / positions.length || 7.5).toFixed(2)}%`,
                        live: !!stakingStats
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="stat-item">
                        <div className="stat-label flex items-center gap-1">
                          {stat.label}
                          {stat.live && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                        </div>
                        <div className="stat-value">{(isLoadingStakingStats || isLoadingUserStaking) ? <Skeleton className="h-5 w-16" /> : stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Stats - Using Subgraph Data */}
                  <div className="grid grid-cols-4 gap-6 pt-5 border-t border-border-subtle">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Staked Tokens Trend</span>
                        <span className="period-badge">{timeFilter}</span>
                        {vaultHistory?.sparklineData && vaultHistory.sparklineData.length > 0 && (
                          <span className="text-[8px] text-primary/60 uppercase">live</span>
                        )}
                      </div>
                      <Sparkline 
                        data={vaultHistory?.sparklineData && vaultHistory.sparklineData.length > 5 
                          ? vaultHistory.sparklineData.slice(-18) 
                          : generateSparklineData(18, 'up', 'staked-tokens-trend')} 
                        height={36} 
                        variant="positive" 
                        showArea={false} 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Price</span>
                        <span className="period-badge">{timeFilter}</span>
                        {oraclePriceData?.sparklineData && oraclePriceData.sparklineData.length > 0 && (
                          <span className="text-[8px] text-primary/60 uppercase">live</span>
                        )}
                      </div>
                      <Sparkline 
                        data={oraclePriceData?.sparklineData && oraclePriceData.sparklineData.length > 5 
                          ? oraclePriceData.sparklineData.slice(-18) 
                          : generateSparklineData(18, 'up', 'price-trend')} 
                        height={36} 
                        variant="positive" 
                        showArea={false} 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Staking Ratio</span>
                        <span className="period-badge">{timeFilter}</span>
                        {stakingStats && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                      </div>
                      <div className="text-[26px] font-semibold tracking-tight">
                        {isLoadingStakingStats ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          `${(stakingStats?.stakingRatio ?? 60.6).toFixed(1)}%`
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Reward Rate</span>
                        {stakingStats && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[26px] font-semibold tracking-tight">
                          {isLoadingStakingStats ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            `${(stakingStats?.rewardRate ?? currentProjection.effectiveAPY).toFixed(2)}%`
                          )}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{timeFilter} Avg</span>
                      </div>
                      <div className="slider-track">
                        <div 
                          className="slider-fill" 
                          style={{ 
                            width: `${Math.min((stakingStats?.rewardRate ?? currentProjection.effectiveAPY) * 5, 100)}%` 
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Protocol Activity */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-[15px]">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Protocol Activity
                  </div>
                  <button 
                    className={`text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoadingActivity ? (
                    <>
                      <Skeleton className="h-14 w-full rounded-lg" />
                      <Skeleton className="h-14 w-full rounded-lg" />
                    </>
                  ) : protocolActivity && protocolActivity.length > 0 ? (
                    protocolActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${
                            activity.type === 'drip_execute' ? 'bg-data-positive/10 text-data-positive' :
                            activity.type === 'drip_commit' ? 'bg-primary/10 text-primary' :
                            activity.type === 'deposit' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {activity.type === 'drip_execute' ? '⚡' :
                             activity.type === 'drip_commit' ? '📝' :
                             activity.type === 'deposit' ? '+' : '?'}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">{activity.description}</div>
                            {activity.amount && (
                              <div className="text-[11px] text-muted-foreground">{activity.amount}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className="text-[11px] text-muted-foreground">{activity.timeAgo}</div>
                            <div className="text-[10px] text-muted-foreground">Block #{activity.blockNumber}</div>
                          </div>
                          {activity.txHash && (
                            <a 
                              href={`https://eto-explorer.ash.center/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-btn p-1.5"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-10 text-[13px]">
                      No recent protocol activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Liquid Staking Portfolio CTA */}
            <div className="cta-card">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] font-medium">Stakent</span>
                    <span className="text-[9px] align-super text-muted-foreground">®</span>
        </div>
                  <span className="new-badge">New</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-2 leading-tight">Liquid Staking Portfolio</h3>
                <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
                  An all-in-one portfolio that helps you make smarter investments into Ethereum Liquid Staking
                </p>
                
                <div className="space-y-2.5">
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={etoMainnet}
                    chains={supportedChains}
                    connectModal={{ size: "compact" }}
                    connectButton={{
                      label: "Connect Wallet  🦊",
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "2px solid #000",
                        borderRadius: "5px",
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: "600",
                        boxShadow: "4px 4px 0px 0px #000",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      },
                    }}
                  />
                  
                </div>
              </div>
        </div>

          
            {/* Protocol Stats */}
          <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center justify-between">
                  Protocol Stats
                  <button className={`${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh}>
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </CardTitle>
            </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Total Value Locked</span>
                  <span className="text-[13px] font-medium">
                    {isLoadingProtocol ? <Skeleton className="h-4 w-16" /> : 
                      `$${(protocolStats?.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                    Your Total Staked
                    {userStakingStats && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                  </span>
                  <span className="text-[13px] font-medium">
                    {isLoadingUserStats ? (
                      <Skeleton className="h-4 w-16" />
                    ) : hasWallet && userStakingStats ? (
                      `$${userStakingStats.netStaked.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    ) : (
                      '$0'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                    Pending Rewards
                    {userStakingStats && <span className="text-[8px] text-primary/60 uppercase">live</span>}
                  </span>
                  <span className="text-[13px] font-medium text-primary">
                    {isLoadingUserStats ? (
                      <Skeleton className="h-4 w-12" />
                    ) : hasWallet && userStakingStats ? (
                      `+${userStakingStats.estimatedRewards.toFixed(4)}`
                    ) : (
                      '+0'
                    )}
                  </span>
              </div>
            </CardContent>
          </Card>
          
            {/* Quick Actions */}
          <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Quick Actions</CardTitle>
            </CardHeader>
              <CardContent className="space-y-0.5">
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/trade">
                    <span className="text-[13px]">Start Trading</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-between h-9 px-3" onClick={() => setCalculatorOpen(true)}>
                  <span className="text-[13px]">Staking Calculator</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/faucet">
                    <span className="text-[13px]">Get mUSDC</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
            </div>
      </div>
    </div>
  );
}
