import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, Wallet, ArrowUpRight, Clock, RefreshCw, ChevronRight, 
  ChevronDown, Zap, Lock, Search, Settings, Bell, Plus, BarChart3,
  Menu, User, LogOut, TrendingUp, TrendingDown, Check, X, Copy,
  Calculator, PieChart, Shield, AlertTriangle, Sparkles, Target
} from "lucide-react";
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
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Staking reward received", message: "+12.5 MAANG", time: "2m ago", read: false },
    { id: 2, title: "Price alert triggered", message: "MAANG crossed $1.50", time: "15m ago", read: false },
    { id: 3, title: "Unstaking complete", message: "500 USDC available", time: "1h ago", read: true },
    { id: 4, title: "New staking tier", message: "sMAANG Premium now available", time: "3h ago", read: true },
  ]);
  
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
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      selectAsset(asset.id);
                      setSearchOpen(false);
                      setSearchQuery('');
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
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
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

      {/* Top Header Bar */}
      <header className="header-bar sticky top-0 z-50 backdrop-blur-sm bg-background/95">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="user-avatar" />
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-muted-foreground">@ryan997</span>
                  <span className="pro-badge">PRO</span>
                </div>
                <span className="text-[14px] font-medium">Ryan Crawford</span>
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
                const sparkData = generateSparklineData(30, asset.riskLevel === 'high' ? 'down' : 'up');
                const isSelected = selectedAsset?.id === asset.id;
                
                return (
                  <div 
                    key={asset.id}
                    className={`staking-asset-card cursor-pointer group ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => selectAsset(asset.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
                          style={{ background: `${asset.color}15` }}
                        >
                          <img src={asset.logo} alt={asset.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground">{asset.type.toUpperCase()}</div>
                          <div className="text-[13px] font-medium">{asset.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    
                    <div className="mb-3">
                      <div className="reward-rate-label">Reward Rate</div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="reward-rate">{effectiveAPY.toFixed(2)}</span>
                        <span className="text-xl text-muted-foreground font-normal">%</span>
                      </div>
                    </div>
                    
                    <div className={`status-badge ${asset.riskLevel === 'low' ? 'status-badge-positive' : asset.riskLevel === 'high' ? 'status-badge-negative' : ''} mb-4`}>
                      <span className="w-[6px] h-[6px] rounded-full bg-current" />
                      {asset.riskLevel} risk
                    </div>
                    
                    <div className="relative">
                      <Sparkline 
                        data={sparkData} 
                        height={60}
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

            {/* Your Active Stakings */}
            <div className="active-staking-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-medium">Your active stakings ({positions.length})</h2>
                <div className="flex items-center gap-0.5">
                  <button className={`icon-btn ${showChart ? 'bg-muted' : ''}`} onClick={() => setShowChart(!showChart)}>
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button className="icon-btn" onClick={handleStake}>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className={`icon-btn ${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh}>
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
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px 24px",
                        fontSize: "13px",
                        fontWeight: "600",
                      },
                    }}
                  />
                </div>
              ) : positions.length === 0 ? (
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
                      <Sparkline data={generateSparklineData(50, 'up')} height={100} variant="accent" showArea={true} />
                    </div>
                  )}

                  {activePosition && activeAsset && (
                    <div className="pb-5 border-b border-border-subtle">
                      <div className="flex items-start gap-3 mb-4">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ background: `${activeAsset.color}15` }}
                        >
                          <img src={activeAsset.logo} alt="" className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-0.5">
                            <span>Last Update — {Math.floor((Date.now() - activePosition.startDate.getTime()) / (1000 * 60))} minutes ago</span>
                            <Clock className="w-3 h-3" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[18px] font-semibold">Stake {activeAsset.name} ({activeAsset.symbol})</h3>
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: activeAsset.color }}
                            >
                              <img src={activeAsset.logo} alt="" className="w-3 h-3 brightness-0 invert" />
                            </div>
                            <button className="text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-1 ml-2">
                              View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Current Reward Balance, {activeAsset.symbol}</div>
                        <div className="flex items-center gap-4">
                          <span className="text-[46px] font-medium tracking-tight leading-none tabular-nums">
                            {activePosition.earnedRewards.toFixed(5)}
                          </span>
                          <Button variant="cta" size="default" onClick={handleStake}>
                            Upgrade
                          </Button>
                          <Button variant="outline" size="default" onClick={() => handleUnstake(activePosition.id)}>
                            Unstake
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { label: 'Total Staked', value: `$${getTotalStaked().toLocaleString()}` },
                      { label: 'Total Rewards', value: `+${getTotalRewards().toFixed(4)}` },
                      { label: 'Active Positions', value: positions.length.toString() },
                      { label: 'Avg APY', value: `${(positions.reduce((sum, p) => sum + p.apy, 0) / positions.length || 0).toFixed(2)}%` },
                    ].map((stat) => (
                      <div key={stat.label} className="stat-item">
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Stats */}
                  <div className="grid grid-cols-4 gap-6 pt-5 border-t border-border-subtle">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Staked Tokens Trend</span>
                        <span className="period-badge">24H</span>
                      </div>
                      <Sparkline data={generateSparklineData(18, 'up')} height={36} variant="positive" showArea={false} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Price</span>
                        <span className="period-badge">24H</span>
                      </div>
                      <Sparkline data={generateSparklineData(18, 'up')} height={36} variant="positive" showArea={false} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-muted-foreground">Staking Ratio</span>
                        <span className="period-badge">24H</span>
                      </div>
                      <div className="text-[26px] font-semibold tracking-tight">60.6%</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-2">Reward Rate</div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[26px] font-semibold tracking-tight">{currentProjection.effectiveAPY.toFixed(2)}%</span>
                        <span className="text-[11px] text-muted-foreground">24H Avg</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill" style={{ width: `${Math.min(currentProjection.effectiveAPY * 5, 100)}%` }} />
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
                      label: "Connect with Wallet  🦊",
                      style: {
                        width: "100%",
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "none",
                        borderRadius: "12px",
                        padding: "13px 18px",
                        fontSize: "13px",
                        fontWeight: "600",
                      },
                    }}
                  />
                  
                  <Button variant="ctaDark" className="w-full h-11" onClick={() => setWalletAddressOpen(true)}>
                    Enter a Wallet Address
                    <Lock className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Investment Period - Fully Interactive */}
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[14px] font-medium">Investment Period</h3>
                  <span className="period-badge-active">{investmentPeriod} Month{investmentPeriod > 1 ? 's' : ''}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-5">Contribution Period (Month)</p>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  {[1, 3, 6, 12].map(months => (
                    <button
                      key={months}
                      className={months === investmentPeriod ? 'period-badge-active' : 'period-badge'}
                      onClick={() => {
                        setInvestmentPeriod(months);
                        toast.info(`Investment period set to ${months} month${months > 1 ? 's' : ''}`);
                      }}
                    >
                      {months} Month{months > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={investmentPeriod}
                    onChange={(e) => setInvestmentPeriod(parseInt(e.target.value))}
                    className="w-full h-[3px] bg-muted rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary
                      [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(160 70% 50%) 0%, hsl(160 70% 50%) ${sliderPosition}%, hsl(240 4% 20%) ${sliderPosition}%, hsl(240 4% 20%) 100%)`
                    }}
                  />
                </div>

                {/* APY Preview */}
                {selectedAsset && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-muted-foreground">Effective APY</span>
                      <span className="text-[14px] font-semibold text-primary">
                        {currentProjection.effectiveAPY.toFixed(2)}%
                      </span>
                    </div>
                    {autoCompound && (
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Auto-compound enabled
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <span className="text-[13px] text-muted-foreground">Your Total Staked</span>
                  <span className="text-[13px] font-medium">
                    ${getTotalStaked().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Pending Rewards</span>
                  <span className="text-[13px] font-medium text-primary">
                    +{getTotalRewards().toFixed(4)}
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
