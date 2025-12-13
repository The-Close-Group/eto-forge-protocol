import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, Shield, Bell, Key, Settings, ChevronRight, Copy, ExternalLink,
  CheckCircle2, AlertTriangle, Clock, Wallet, TrendingUp, Award, Zap,
  RefreshCw, Edit3, Camera, Mail, Phone, Building2, FileText, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useStakingContext } from "@/contexts/StakingContext";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import SEO from "@/components/SEO";
import { useGraphUserStats, getUserSwaps } from "@/lib/graphql";
import { useQuery } from "@tanstack/react-query";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export default function Profile() {
  const account = useActiveAccount();
  const { user, signOut } = useAuth();
  const { positions, getTotalStaked, getTotalRewards } = useStakingContext();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile data - uses wallet address if available
  const [profile, setProfile] = useState({
    displayName: account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "User",
    username: account?.address ? `@${account.address.slice(2, 10)}` : "@user",
    email: "",
    phone: "",
    company: "",
    role: "",
    bio: "",
    verificationStatus: "unverified",
    kycLevel: 0,
    riskScore: 0,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    tier: "BASIC"
  });

  // Update profile when account changes
  useEffect(() => {
    if (account?.address) {
      setProfile(prev => ({
        ...prev,
        displayName: `${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
        username: `@${account.address.slice(2, 10)}`,
      }));
    }
  }, [account?.address]);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
    marketAlerts: true,
    orderAlerts: true
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing profile...", { id: "refresh" });
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Profile refreshed", { id: "refresh" });
    setIsRefreshing(false);
  };

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const stats = [
    { label: 'Total Staked', value: `$${getTotalStaked().toLocaleString()}`, icon: Wallet, trend: 'up' },
    { label: 'Total Rewards', value: `+${getTotalRewards().toFixed(4)}`, icon: TrendingUp, trend: 'up' },
    { label: 'Active Positions', value: positions.length.toString(), icon: Zap, trend: 'up' },
    { label: 'Member Tier', value: profile.tier, icon: Award, trend: 'up' },
  ];

  // Fetch user activity from subgraph
  const { data: userSwaps } = useQuery({
    queryKey: ['user-swaps', account?.address],
    queryFn: () => account?.address ? getUserSwaps(account.address, 10) : Promise.resolve([]),
    enabled: !!account?.address,
    staleTime: 30_000,
  });

  const { data: userStats } = useGraphUserStats(account?.address);

  type ActivityType = 'stake' | 'claim' | 'wallet' | 'profile' | 'swap';
  
  // Transform subgraph data to activity format
  const recentActivity: { action: string; time: string; type: ActivityType }[] = (userSwaps || []).slice(0, 4).map(swap => {
    const timestamp = parseInt(swap.timestamp) * 1000;
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let timeAgo = `${seconds}s ago`;
    if (seconds >= 60) timeAgo = `${Math.floor(seconds / 60)}m ago`;
    if (seconds >= 3600) timeAgo = `${Math.floor(seconds / 3600)}h ago`;
    if (seconds >= 86400) timeAgo = `${Math.floor(seconds / 86400)}d ago`;
    
    return {
      action: `Swapped ${parseFloat(swap.amountIn).toFixed(2)} tokens`,
      time: timeAgo,
      type: 'stake' as ActivityType, // Show as stake for UI styling
    };
  });

  // Add placeholder if no activity yet
  if (recentActivity.length === 0) {
    recentActivity.push(
      { action: 'No recent activity', time: 'Connect wallet to see history', type: 'wallet' }
    );
  }

  return (
    <>
      <SEO
        title="My Profile | ETO Protocol"
        description="Manage your profile, settings, and account preferences."
      />

      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <header className="header-bar sticky top-0 z-50 backdrop-blur-sm bg-background/95">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold">My Profile</h1>
                <p className="text-[11px] text-muted-foreground">Account Settings & Preferences</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 ml-4">
              <Award className="w-3 h-3 mr-1" />
              {profile.tier}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <button className="icon-btn">
              <Bell className="w-4 h-4" />
            </button>
            <button 
              className={`icon-btn ${isRefreshing ? 'animate-spin' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="icon-btn flex items-center gap-1.5">
              <span className="text-[13px]">Settings</span>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto p-6 space-y-6">
          {/* Profile Header Card */}
          <div 
            className={`cta-card transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-semibold">{profile.displayName}</h2>
                    {profile.verificationStatus === 'verified' && (
                      <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{profile.username}</p>
                  <p className="text-[13px] text-muted-foreground max-w-lg">{profile.bio}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      {profile.company}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Member since {profile.memberSince}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="cta" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  {account?.address ? (
                    <Button variant="outline" onClick={handleCopyAddress}>
                      <Copy className="w-4 h-4 mr-2" />
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </Button>
                  ) : (
                    <ConnectButton
                      client={client}
                      wallets={wallets}
                      chain={etoMainnet}
                      chains={supportedChains}
                      connectModal={{ size: "compact" }}
                      connectButton={{
                        label: "Connect Wallet",
                        style: {
                          background: "transparent",
                          color: "hsl(var(--foreground))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "10px",
                          padding: "10px 16px",
                          fontSize: "13px",
                          fontWeight: "500",
                        },
                      }}
                    />
                  )}
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-semibold tabular-nums text-foreground">
                  {stat.value}
                </div>
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
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="api">API Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Profile Details Card */}
                  <div className="active-staking-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-medium">Profile Details</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Email</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[14px]">{profile.email}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Phone</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[14px]">{profile.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Company</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[14px]">{profile.company}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Role</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Award className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[14px]">{profile.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[14px] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activity.type === 'stake' ? 'bg-primary/10 text-primary' :
                              activity.type === 'claim' ? 'bg-data-positive/10 text-data-positive' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {activity.type === 'stake' ? <Zap className="w-4 h-4" /> :
                               activity.type === 'claim' ? <TrendingUp className="w-4 h-4" /> :
                               activity.type === 'wallet' ? <Wallet className="w-4 h-4" /> :
                               <User className="w-4 h-4" />}
                            </div>
                            <span className="text-[13px]">{activity.action}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="active-staking-card">
                    <h3 className="text-[15px] font-medium mb-5">Security Status</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-data-positive" />
                          <span className="text-[12px] text-muted-foreground">Verification</span>
                        </div>
                        <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                          {profile.verificationStatus}
                        </Badge>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-[12px] text-muted-foreground">KYC Level</span>
                        </div>
                        <span className="text-xl font-semibold">Level {profile.kycLevel}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-data-positive" />
                          <span className="text-[12px] text-muted-foreground">Risk Score</span>
                        </div>
                        <span className="text-xl font-semibold text-data-positive">{profile.riskScore}/100</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-data-positive" />
                          <div>
                            <span className="text-[13px] font-medium">Two-Factor Authentication</span>
                            <p className="text-[11px] text-muted-foreground">Secure your account with 2FA</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-primary" />
                          <div>
                            <span className="text-[13px] font-medium">Connected Wallet</span>
                            <p className="text-[11px] text-muted-foreground">
                              {account?.address ? `${account.address.slice(0, 10)}...${account.address.slice(-8)}` : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        {account?.address ? (
                          <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Connected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="active-staking-card">
                    <h3 className="text-[15px] font-medium mb-5">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security notifications' },
                        { key: 'marketAlerts', label: 'Market Alerts', desc: 'Price and market updates' },
                        { key: 'orderAlerts', label: 'Order Alerts', desc: 'Trade execution notifications' },
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

                <TabsContent value="api" className="space-y-4">
                  <div className="active-staking-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-medium">API Keys</h3>
                      <Button variant="cta" size="sm">
                        <Key className="w-4 h-4 mr-2" />
                        Generate Key
                      </Button>
                    </div>
                    
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <Key className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h4 className="text-[15px] font-medium mb-1">No API Keys</h4>
                      <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                        Generate API keys to access your account programmatically
                      </p>
                      <Button variant="outline">
                        Learn More
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Account Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Email Verified', value: true },
                    { label: 'KYC Complete', value: true },
                    { label: '2FA Enabled', value: true },
                    { label: 'Wallet Connected', value: !!account?.address },
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

              {/* Risk Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-data-positive mb-1">{profile.riskScore}</div>
                    <div className="text-[12px] text-muted-foreground">Risk Score</div>
                  </div>
                  <Progress value={profile.riskScore} className="h-2" />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Your account has a low risk profile based on your trading history and verification status.
                  </p>
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
                      <span className="text-[13px]">My Staking</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/trade">
                      <span className="text-[13px]">Trade</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                    <Link to="/system-health">
                      <span className="text-[13px]">System Health</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      signOut();
                      toast.success("Signed out successfully");
                    }}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

