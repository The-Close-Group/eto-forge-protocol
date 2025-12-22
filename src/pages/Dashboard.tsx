import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, Wallet, ArrowUpRight, Clock, RefreshCw, ChevronRight, 
  ChevronDown, Zap, Search, Settings, Bell, Plus, BarChart3,
  User, LogOut, TrendingUp, TrendingDown, Copy,
  Calculator, Shield, AlertTriangle, Sparkles
} from "lucide-react";
import { WalletValueCard } from "@/components/dashboard/WalletValueCard";
import { HoldingsCard } from "@/components/dashboard/HoldingsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import maangLogo from "@/assets/maang-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
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
import metamaskLogo from '@/assets/metamask-logo.svg';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export default function Dashboard() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { signOut } = useAuth();
  
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletAddressOpen, setWalletAddressOpen] = useState(false);
  const [walletAddressInput, setWalletAddressInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // NOTE: Notifications are empty - real notifications should come from backend/events
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; time: string; read: boolean }>>([]);
  
  // Trigger fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  const { data: protocolStats, isLoading: isLoadingProtocol, refetch: refetchStats } = useProtocolStats();
  const { data: protocolActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useProtocolActivity();
  
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
      await Promise.all([refetchStats(), refetchActivity()]);
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

  const handleWalletAddressSubmit = () => {
    if (!walletAddressInput.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddressInput)) {
      toast.error("Invalid Ethereum address format");
      return;
    }
    toast.success(`Viewing portfolio for ${walletAddressInput.slice(0, 6)}...${walletAddressInput.slice(-4)}`);
    setWalletAddressOpen(false);
    setWalletAddressInput('');
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
      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Assets</DialogTitle>
            <DialogDescription>Find staking assets by name or symbol</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {assets
                .filter(a => 
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(asset => (
                  <button
                    key={asset.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      navigate('/buy-maang', { state: { selectedToken: asset.symbol } });
                    }}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
                      style={{ background: `${asset.color}15` }}
                    >
                      <img src={asset.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{asset.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {getEffectiveAPY(asset.baseAPY, investmentPeriod, autoCompound).toFixed(2)}% APY
                      </div>
                    </div>
                    <div className={`text-[12px] font-medium ${asset.riskLevel === 'low' ? 'text-data-positive' : asset.riskLevel === 'high' ? 'text-data-negative' : 'text-warning'}`}>
                      {asset.riskLevel}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Address Dialog */}
      <Dialog open={walletAddressOpen} onOpenChange={setWalletAddressOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Portfolio</DialogTitle>
            <DialogDescription>Enter any Ethereum wallet address to view its staking portfolio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="0x..."
              value={walletAddressInput}
              onChange={(e) => setWalletAddressInput(e.target.value)}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWalletAddressOpen(false)}>
                Cancel
              </Button>
              <Button variant="cta" className="flex-1" onClick={handleWalletAddressSubmit}>
                View Portfolio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Fixed Top Header Bar - All elements aligned right */}
      <header className="fixed top-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border-subtle left-0 md:left-[60px]">
        <div className="flex items-center justify-end gap-4 px-6 py-3">
          {/* Action Icons Group */}
          <div className="flex items-center gap-2">
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
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[13px] text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
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
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="search-input" onClick={() => setSearchOpen(true)}>
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
            </button>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="icon-btn flex items-center gap-1.5">
                  <span className="text-[13px]">Settings</span>
                  <Settings className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Appearance settings coming soon")}>
                  Appearance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Notification settings coming soon")}>
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/system-health')}>
                  System Health
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border-subtle" />

          {/* Account Info Group - Deposit | Name | Avatar */}
          <div className="flex items-center gap-4">
            <button className="deposit-btn" onClick={handleStake}>
              Deposit
              <Plus className="w-3.5 h-3.5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <span className="text-[14px] font-medium">Ryan Crawford</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-muted-foreground">@ryan997</span>
                    <span className="pro-badge">PRO</span>
                  </div>
                  <div className="user-avatar" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
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
          </div>
        </div>
      </header>

      {/* Scrollable Dashboard Content - offset for fixed header */}
      <div 
        className={`dashboard-container pt-16 transition-all duration-700 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Main Dashboard Grid - Full Width Chart + Bottom Row */}
        <div className="dashboard-grid">
          {/* Full Width - Wallet Value Card with Chart */}
          <div 
            className={`transition-all duration-700 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <WalletValueCard
              totalValue={getTotalStaked() + getTotalRewards() > 0 ? getTotalStaked() + getTotalRewards() : 41812.14}
              changePercent={4.6}
              realizedPL={1429.00}
              unrealizedPL={-521.10}
              projectedGrowth={1864.04}
              netChange={495.68}
            />
          </div>

          {/* Holdings Card - Full Width Row */}
          <div 
            className={`transition-all duration-700 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <HoldingsCard />
          </div>
          
          {/* Transactions Card - Full Width Row Below */}
          <div 
            className={`transition-all duration-700 ease-out delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <TransactionsCard
              transactions={[
                { id: '1', type: 'receive', token: 'MAANG', amount: 125.50, time: '08:21 AM', status: 'confirmed', showChart: true },
                { id: '2', type: 'send', token: 'USDC', amount: -500.00, time: '05.12.2024', status: 'confirmed' },
                { id: '3', type: 'reward', token: 'sMAANG', amount: 12.34, time: '05:19 AM', status: 'confirmed', showChart: true },
                { id: '4', type: 'receive', token: 'MAANG', amount: 250.00, time: '05.12.2024', status: 'confirmed', highlighted: true },
                { id: '5', type: 'receive', token: 'USDC', amount: 1500.00, time: '05.12.2024', status: 'confirmed', showChart: true },
                { id: '6', type: 'send', token: 'sMAANG', amount: -45.00, time: '04.12.2024', status: 'pending' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
