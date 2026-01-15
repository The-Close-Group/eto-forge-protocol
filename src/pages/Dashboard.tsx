import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, Wallet, ArrowUpRight, Clock, RefreshCw, ChevronRight, 
  ChevronDown, Zap, Search, Settings, Bell, Plus, BarChart3,
  User, LogOut, TrendingUp, TrendingDown, Copy, Check,
  Calculator, Shield, AlertTriangle, Sparkles, Globe, ChevronUp, FlaskConical
} from "lucide-react";
import { WalletValueCard } from "@/components/dashboard/WalletValueCard";
import { HoldingsCard } from "@/components/dashboard/HoldingsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import maangLogo from "@/assets/maang-logo.svg";
import a16zLogo from "@/assets/a16z-logo.svg";
import ycLogo from "@/assets/ycombinator-logo.svg";
import sequoiaLogo from "@/assets/sequoia-logo.svg";
import lightspeedLogo from "@/assets/lightspeed-logo.svg";
import { Link, useNavigate } from "react-router-dom";

// Searchable assets for global search
const SEARCHABLE_ASSETS = [
  { id: 'maang', symbol: 'MAANG', name: 'MAANG Token', description: 'ETO Protocol native token', logo: maangLogo, price: 12.50, change: 4.6 },
  { id: 'smaang', symbol: 'sMAANG', name: 'Staked MAANG', description: 'Liquid staking derivative', logo: maangLogo, price: 13.25, change: 3.2 },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', description: 'Stablecoin pegged to USD', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040', price: 1.00, change: 0.0 },
  { id: 'ycombinator', symbol: 'YC', name: 'Y Combinator Index', description: 'YC portfolio companies index', logo: ycLogo, price: 145.80, change: 2.34 },
  { id: 'sequoia', symbol: 'SEQ', name: 'Sequoia Capital Index', description: 'Sequoia portfolio index', logo: sequoiaLogo, price: 238.50, change: 2.18 },
  { id: 'lightspeed', symbol: 'LSVP', name: 'Lightspeed Index', description: 'Lightspeed Ventures portfolio', logo: lightspeedLogo, price: 98.25, change: 1.95 },
  { id: 'a16z', symbol: 'A16Z', name: 'a16z Index', description: 'Andreessen Horowitz portfolio', logo: a16zLogo, price: 312.40, change: 3.15 },
];
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
  const [addressCopied, setAddressCopied] = useState(false);
  // NOTE: Notifications are empty - real notifications should come from backend/events
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; time: string; read: boolean }>>([]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Wallet display address (use connected account or fallback)
  const displayAddress = account?.address || '0x1234...5678';
  const shortAddress = account?.address ? formatAddress(account.address) : '0x12...5678';
  
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
    const address = account?.address || displayAddress;
    if (address) {
      navigator.clipboard.writeText(address);
      setAddressCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setAddressCopied(false), 2000);
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
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setSearchQuery('');
      }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-[15px]">Search Assets</DialogTitle>
          </DialogHeader>
          
          <div className="p-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-border/50"
                autoFocus
              />
            </div>
          </div>

          <div className="border-t border-border/50 max-h-[320px] overflow-y-auto">
            {SEARCHABLE_ASSETS
              .filter(a => 
                a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).length > 0 ? (
              <div className="p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">Assets</div>
                {SEARCHABLE_ASSETS
                  .filter(a => 
                    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        navigate(`/execute/${asset.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">{asset.symbol}</span>
                          <span className="text-[11px] text-muted-foreground">{asset.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{asset.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[13px] font-medium">${asset.price.toFixed(2)}</div>
                        <div className={`text-[11px] flex items-center justify-end gap-0.5 ${asset.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          <TrendingUp className="w-3 h-3" />
                          {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No assets found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 p-3 bg-muted/20">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Click an asset to trade</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">esc</kbd>
                <span>to close</span>
              </div>
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
              <Button variant="outline" className="flex-1" onClick={handleWalletAddressSubmit}>
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
            <Button variant="outline" onClick={handleConfirmStake}>
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
            <Button variant="outline" onClick={() => { setCalculatorOpen(false); handleStake(); }}>
              Stake Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Navigation Bar - Professional Financial Dashboard */}
      <nav className="fixed top-0 right-0 left-0 md:left-[90px] z-40 h-14 bg-background border-b border-border/50">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          
          {/* Left Section - Paper Trading, Network & Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Paper Trading Indicator */}
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
              <FlaskConical className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline text-[10px] sm:text-[11px] font-medium text-amber-500">Paper Trading</span>
              <span className="sm:hidden text-[10px] font-medium text-amber-500">Paper</span>
            </div>

            {/* Network Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/40">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[11px] font-medium text-foreground">ETO L1</span>
            </div>

            {/* Wallet Address */}
            <button 
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all group"
            >
              <Wallet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-[11px] sm:text-[12px] font-mono text-foreground max-w-[80px] sm:max-w-none truncate">{shortAddress}</span>
              {addressCopied ? (
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              )}
            </button>
          </div>

          {/* Center Section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-full max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px] flex-1 text-left">Search assets, transactions...</span>
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-background/50 rounded border border-border/30">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Section - Actions & Account */}
          <div className="flex items-center gap-1">
            {/* Mobile Search */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-[12px] font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <button className="text-[11px] text-primary hover:underline" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <Bell className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1.5" />
                      <p className="text-[11px] text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className="px-3 py-2 hover:bg-muted/50 cursor-pointer border-b border-border/20 last:border-0"
                        onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                      >
                        <div className="flex gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium">{notif.title}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1">{notif.message}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                  Appearance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/system-health')}>
                  System Health
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-border/40 mx-1.5" />

            {/* Deposit Button */}
            <button 
              onClick={handleStake}
              className="hidden sm:flex h-8 px-3.5 items-center gap-1.5 rounded-md text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
          </div>
        </div>
      </nav>

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
                { id: '1', type: 'receive', token: 'MAANG', amount: 125.50, time: '08:21 AM', status: 'confirmed' },
                { id: '2', type: 'send', token: 'USDC', amount: -500.00, time: '05.12.2024', status: 'confirmed' },
                { id: '3', type: 'reward', token: 'sMAANG', amount: 12.34, time: '05:19 AM', status: 'confirmed' },
                { id: '4', type: 'receive', token: 'MAANG', amount: 250.00, time: '05.12.2024', status: 'confirmed' },
                { id: '5', type: 'receive', token: 'USDC', amount: 1500.00, time: '05.12.2024', status: 'confirmed' },
                { id: '6', type: 'send', token: 'sMAANG', amount: -45.00, time: '04.12.2024', status: 'pending' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
