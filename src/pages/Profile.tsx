import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield, Bell, Key, Settings, ChevronRight, Copy, ExternalLink,
  CheckCircle2, AlertTriangle, Clock, Wallet, TrendingUp, Award, Zap,
  RefreshCw, QrCode, Link as LinkIcon, History, ArrowUpRight, ArrowDownLeft,
  Coins, Activity, Hash, Box, AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useStakingContext } from "@/contexts/StakingContext";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import SEO from "@/components/SEO";
import metamaskLogo from '@/assets/metamask-logo.svg';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

// Format wallet address for display
const formatAddress = (address: string, startChars = 6, endChars = 4) => {
  if (!address) return "—";
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Generate a deterministic color from address
const getAddressColor = (address: string) => {
  if (!address) return "hsl(160, 70%, 50%)";
  const hash = address.slice(2, 8);
  const hue = parseInt(hash, 16) % 360;
  return `hsl(${hue}, 60%, 50%)`;
};

export default function Profile() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { positions, getTotalStaked, getTotalRewards } = useStakingContext();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFullAddress, setShowFullAddress] = useState(false);
  
  // Wallet-based notifications
  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    stakingRewards: true,
    priceAlerts: false,
    governanceAlerts: true,
    securityAlerts: true
  });

  // Derive identity from wallet address
  const walletIdentity = useMemo(() => {
    if (!account?.address) return null;
    const addr = account.address.toLowerCase();
    return {
      address: account.address,
      shortAddress: formatAddress(account.address),
      color: getAddressColor(addr),
      // ENS-style identifier (mock - would come from on-chain)
      identifier: `${addr.slice(2, 6)}.eto`,
      // Activity tier based on positions
      tier: positions.length >= 5 ? 'Whale' : positions.length >= 2 ? 'Active' : positions.length >= 1 ? 'Holder' : 'New',
      // On-chain since (mock)
      firstTxDate: '—',
    };
  }, [account?.address, positions.length]);

  // Stats derived from on-chain data
  const stats = useMemo(() => [
    { 
      label: 'Total Staked', 
      value: `$${getTotalStaked().toLocaleString()}`, 
      icon: Coins, 
      trend: 'up',
      subtext: 'Across all positions'
    },
    { 
      label: 'Pending Rewards', 
      value: `+${getTotalRewards().toFixed(4)}`, 
      icon: TrendingUp, 
      trend: 'up',
      subtext: 'Claimable rewards'
    },
    { 
      label: 'Active Positions', 
      value: positions.length.toString(), 
      icon: Activity, 
      trend: 'up',
      subtext: 'Staking positions'
    },
    { 
      label: 'Wallet Tier', 
      value: walletIdentity?.tier || '—', 
      icon: Award, 
      trend: 'up',
      subtext: 'Based on activity'
    },
  ], [getTotalStaked, getTotalRewards, positions.length, walletIdentity?.tier]);

  // Recent transactions (mock - would come from on-chain indexer)
  const recentTransactions: Array<{
    hash: string;
    type: 'stake' | 'unstake' | 'claim' | 'swap' | 'transfer';
    amount: string;
    token: string;
    time: string;
    status: 'confirmed' | 'pending';
  }> = [];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing wallet data...", { id: "refresh" });
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Wallet data refreshed", { id: "refresh" });
    setIsRefreshing(false);
  };

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleViewOnExplorer = () => {
    if (account?.address) {
      window.open(`https://eto-explorer.ash.center/address/${account.address}`, '_blank');
    }
  };

  // Show profile page with connect prompt if not connected
  const isConnected = !!account?.address;

  return (
    <>
      <SEO
        title={isConnected ? `${walletIdentity?.shortAddress} | ETO Protocol` : "Profile | ETO Protocol"}
        description="View your wallet profile, staking positions, and transaction history."
      />

      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <header className="header-bar sticky top-0 z-50 backdrop-blur-sm bg-background/95">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isConnected ? `${walletIdentity?.color}20` : 'hsl(var(--muted))' }}
              >
                <Wallet className="w-5 h-5" style={{ color: isConnected ? walletIdentity?.color : 'hsl(var(--muted-foreground))' }} />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold font-mono">
                  {isConnected ? walletIdentity?.shortAddress : 'Profile'}
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  {isConnected ? 'Wallet Profile' : 'Connect wallet to view'}
                </p>
              </div>
            </div>
            {isConnected && (
              <Badge 
                variant="outline" 
                className="ml-4"
                style={{ 
                  backgroundColor: `${walletIdentity?.color}15`, 
                  color: walletIdentity?.color,
                  borderColor: `${walletIdentity?.color}40`
                }}
              >
                <Award className="w-3 h-3 mr-1" />
                {walletIdentity?.tier}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isConnected && (
              <>
                <button className="icon-btn" onClick={handleViewOnExplorer}>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  className={`icon-btn ${isRefreshing ? 'animate-spin' : ''}`}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
            <button className="icon-btn flex items-center gap-1.5">
              <span className="text-[13px]">Settings</span>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto p-6 space-y-6">
          {/* Connect Wallet Prompt - Show when not connected */}
          {!isConnected && (
            <div 
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card className="max-w-lg mx-auto">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground text-[14px] mb-6 max-w-sm mx-auto">
                    Your wallet address is your identity on ETO. Connect to view your profile, positions, and transaction history.
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
                        background: "hsl(160, 70%, 50%)",
                        color: "#000",
                        borderRadius: "10px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: "600",
                        width: "100%",
                        maxWidth: "280px",
                      },
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground mt-4">
                    We never store your private keys. Your wallet, your control.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Content - Only show when connected */}
          {isConnected && (
            <>
          {/* Wallet Identity Card */}
          <div 
            className={`cta-card transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Wallet Avatar */}
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center border"
                    style={{ 
                      background: `linear-gradient(135deg, ${walletIdentity?.color}20, ${walletIdentity?.color}05)`,
                      borderColor: `${walletIdentity?.color}30`
                    }}
                  >
                    <Hash className="w-10 h-10" style={{ color: walletIdentity?.color }} />
                  </div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: walletIdentity?.color }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      onClick={() => setShowFullAddress(!showFullAddress)}
                      className="text-2xl font-mono font-semibold hover:text-primary transition-colors cursor-pointer"
                    >
                      {showFullAddress ? account.address : walletIdentity?.shortAddress}
                    </button>
                    <button 
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  <p className="text-muted-foreground text-[13px] mb-4">
                    Click address to {showFullAddress ? 'collapse' : 'expand'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px]">
                      <Box className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Chain:</span>
                      <span className="font-medium">ETO L1</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px]">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">First tx:</span>
                      <span className="font-medium">{walletIdentity?.firstTxDate}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px]">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Positions:</span>
                      <span className="font-medium">{positions.length}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="cta" onClick={handleViewOnExplorer}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                  <Button variant="outline" onClick={handleCopyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="staking-asset-card"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-semibold tabular-nums text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-[10px] text-muted-foreground">{stat.subtext}</p>
                <div className="mt-3">
                  <Sparkline 
                    data={generateSparklineData(20, stat.trend as 'up' | 'down')} 
                    height={32}
                    variant="positive"
                    showArea={true}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Left Column - Tabs */}
            <div 
              className={`space-y-6 transition-all duration-700 delay-150 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="positions">Positions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Wallet Summary Card */}
                  <div className="active-staking-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-medium">Wallet Summary</h3>
                      <Button variant="ghost" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Wallet Address</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-mono">{formatAddress(account.address, 10, 8)}</span>
                            <button onClick={handleCopyAddress} className="text-muted-foreground hover:text-foreground">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Network</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-data-positive" />
                            <span className="text-[14px]">ETO L1 Mainnet</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Total Value</div>
                          <span className="text-[14px] font-semibold">${getTotalStaked().toLocaleString()}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Wallet Tier</div>
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: `${walletIdentity?.color}15`, 
                              color: walletIdentity?.color,
                              borderColor: `${walletIdentity?.color}40`
                            }}
                          >
                            {walletIdentity?.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Apps */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[14px] flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        Connected Apps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-[13px] font-medium">ETO Protocol</span>
                            <p className="text-[11px] text-muted-foreground">Full access</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                  <div className="active-staking-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-medium">Transaction History</h3>
                      <Button variant="ghost" size="sm" onClick={handleViewOnExplorer}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Explorer
                      </Button>
                    </div>
                    
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-2">
                        {recentTransactions.map((tx) => (
                          <div key={tx.hash} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                tx.type === 'stake' ? 'bg-primary/10 text-primary' :
                                tx.type === 'unstake' ? 'bg-warning/10 text-warning' :
                                tx.type === 'claim' ? 'bg-data-positive/10 text-data-positive' :
                                tx.type === 'swap' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {tx.type === 'stake' || tx.type === 'transfer' ? 
                                  <ArrowDownLeft className="w-4 h-4" /> : 
                                  <ArrowUpRight className="w-4 h-4" />
                                }
                              </div>
                              <div>
                                <span className="text-[13px] font-medium capitalize">{tx.type}</span>
                                <p className="text-[11px] text-muted-foreground font-mono">{formatAddress(tx.hash, 8, 6)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[13px] font-medium">{tx.amount} {tx.token}</span>
                              <p className="text-[11px] text-muted-foreground">{tx.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                          <History className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h4 className="text-[15px] font-medium mb-1">No Transactions</h4>
                        <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                          Transaction history will appear here once you start using ETO
                        </p>
                        <Button variant="outline" asChild>
                          <Link to="/buy-maang">
                            Make Your First Trade
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="positions" className="space-y-4">
                  <div className="active-staking-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-medium">Staking Positions</h3>
                      <Button variant="cta" size="sm" asChild>
                        <Link to="/staking">
                          <Zap className="w-4 h-4 mr-1" />
                          Stake More
                        </Link>
                      </Button>
                    </div>
                    
                    {positions.length > 0 ? (
                      <div className="space-y-3">
                        {positions.map((position) => (
                          <div key={position.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-primary" />
                                <span className="font-medium">{position.asset.symbol}</span>
                              </div>
                              <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                                Active
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-[12px]">
                              <div>
                                <span className="text-muted-foreground">Staked</span>
                                <p className="font-medium">{position.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">APY</span>
                                <p className="font-medium text-data-positive">{position.apy.toFixed(2)}%</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rewards</span>
                                <p className="font-medium">+{position.rewards.toFixed(4)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                          <Coins className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h4 className="text-[15px] font-medium mb-1">No Active Positions</h4>
                        <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                          Start staking to earn rewards on your assets
                        </p>
                        <Button variant="cta" asChild>
                          <Link to="/staking">
                            Start Staking
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="active-staking-card">
                    <h3 className="text-[15px] font-medium mb-5">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Get notified when transactions are confirmed' },
                        { key: 'stakingRewards', label: 'Staking Rewards', desc: 'Notifications when rewards are available' },
                        { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alerts for significant price movements' },
                        { key: 'governanceAlerts', label: 'Governance', desc: 'Proposals and voting notifications' },
                        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security notifications' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                          <div>
                            <span className="text-[13px] font-medium">{item.label}</span>
                            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch 
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked) => {
                              setNotifications(prev => ({ ...prev, [item.key]: checked }));
                              toast.success(`${item.label} ${checked ? 'enabled' : 'disabled'}`);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Wallet Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Wallet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Wallet Connected', value: true },
                    { label: 'ETO L1 Network', value: true },
                    { label: 'Transactions Enabled', value: true },
                    { label: 'Signing Enabled', value: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-[12px]">{item.label}</span>
                      {item.value ? (
                        <CheckCircle2 className="w-4 h-4 text-data-positive" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Address QR */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    Receive Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square rounded-xl bg-white p-4 flex items-center justify-center">
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground mb-2">Your ETO L1 Address</p>
                    <p className="text-[12px] font-mono break-all">{account.address}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleCopyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/dashboard">
                      <span className="text-[13px]">Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/staking">
                      <span className="text-[13px]">Staking</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/buy-maang">
                      <span className="text-[13px]">Swap Tokens</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/trade">
                      <span className="text-[13px]">Trade</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Disconnect */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] text-destructive">Disconnect</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      signOut();
                      toast.success("Wallet disconnected");
                      navigate('/');
                    }}
                  >
                    Disconnect Wallet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
}
