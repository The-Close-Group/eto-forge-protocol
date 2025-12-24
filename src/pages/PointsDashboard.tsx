import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TopNavBar } from "@/components/layout/TopNavBar";
import {
  Trophy, TrendingUp, Clock, ChevronRight, ChevronDown,
  RefreshCw, Target, Award, Users, Copy, ExternalLink,
  ArrowUpRight, BarChart3, Plus, Lock, Hash, Bug, MessageSquare,
  Droplets, Vote, ArrowDownUp, Milestone, Share2, HelpCircle,
  Calendar, Gift, Zap, CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { toast } from "sonner";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import SEO from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import metamaskLogo from '@/assets/metamask-logo.svg';

const wallets = [
  createWallet("io.metamask", { metadata: { iconUrl: metamaskLogo } }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

// Point values - All sources
const POINT_VALUES = {
  // High Value Actions
  referral: 100,        // Both parties get this
  bugReport: 75,        // Valid bug reports
  feedback: 50,         // Design/UX feedback
  
  // Protocol Actions
  staking: 25,          // Per stake action
  liquidity: 25,        // Adding liquidity
  governance: 20,       // Voting on proposals
  
  // Trading Actions
  trading: 10,          // Per buy/sell
  volumeMilestone: 50,  // Every $1k volume
  
  // Engagement Actions
  dailyLogin: 5,        // Daily check-in
  socialShare: 15,      // Twitter/Discord share
  communityHelp: 10,    // Helping others in Discord
  
  // Achievement Bonuses
  earlyAdopter: 200,    // One-time for early users
  firstTrade: 25,       // First trade bonus
  firstStake: 50,       // First stake bonus
  holdingBonus: 5,      // Per week of holding
};

// Format wallet address
const formatAddress = (address: string, startChars = 6, endChars = 4) => {
  if (!address) return "—";
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Top 3 featured point sources (highest value)
const featuredCategories = [
  {
    id: "referral",
    type: "REFERRAL",
    name: "Referrals",
    points: POINT_VALUES.referral,
    riskLevel: "high" as const,
    description: "Both parties earn +100",
  },
  {
    id: "bugReport",
    type: "BUG REPORT",
    name: "Bug Reports",
    points: POINT_VALUES.bugReport,
    riskLevel: "high" as const,
    description: "Report valid issues",
  },
  {
    id: "feedback",
    type: "FEEDBACK",
    name: "Design Feedback",
    points: POINT_VALUES.feedback,
    riskLevel: "medium" as const,
    description: "Submit UI/UX feedback",
  },
];

// All point sources organized by category
const allPointSources = {
  protocol: [
    { id: "staking", name: "Staking Action", points: POINT_VALUES.staking, description: "Stake MAANG or USDC", link: "/staking" },
    { id: "liquidity", name: "Add Liquidity", points: POINT_VALUES.liquidity, description: "Provide LP tokens", link: "/staking" },
    { id: "governance", name: "Governance Vote", points: POINT_VALUES.governance, description: "Vote on proposals", link: null },
  ],
  trading: [
    { id: "trading", name: "Buy or Sell", points: POINT_VALUES.trading, description: "Per transaction", link: "/buy-maang" },
    { id: "volumeMilestone", name: "Volume Milestone", points: POINT_VALUES.volumeMilestone, description: "Every $1,000 traded", link: "/buy-maang" },
    { id: "firstTrade", name: "First Trade", points: POINT_VALUES.firstTrade, description: "One-time bonus", link: "/buy-maang", oneTime: true },
  ],
  social: [
    { id: "referral", name: "Referral", points: POINT_VALUES.referral, description: "Both parties earn", link: null },
    { id: "socialShare", name: "Social Share", points: POINT_VALUES.socialShare, description: "Share on Twitter/X", link: null },
    { id: "communityHelp", name: "Community Help", points: POINT_VALUES.communityHelp, description: "Help in Discord", link: null },
  ],
  contributions: [
    { id: "feedback", name: "Design Feedback", points: POINT_VALUES.feedback, description: "UI/UX suggestions", link: null },
    { id: "bugReport", name: "Bug Report", points: POINT_VALUES.bugReport, description: "Valid bug reports", link: null },
  ],
  engagement: [
    { id: "dailyLogin", name: "Daily Check-in", points: POINT_VALUES.dailyLogin, description: "Login each day", link: "/dashboard" },
    { id: "holdingBonus", name: "Holding Bonus", points: POINT_VALUES.holdingBonus, description: "Per week holding", link: null },
  ],
  achievements: [
    { id: "earlyAdopter", name: "Early Adopter", points: POINT_VALUES.earlyAdopter, description: "Season 1 participant", oneTime: true, link: null },
    { id: "firstStake", name: "First Stake", points: POINT_VALUES.firstStake, description: "One-time bonus", oneTime: true, link: "/staking" },
    { id: "firstTrade", name: "First Trade", points: POINT_VALUES.firstTrade, description: "One-time bonus", oneTime: true, link: "/buy-maang" },
  ],
};

// Mock leaderboard
const leaderboardData = [
  { address: "0x1234567890abcdef1234567890abcdef12345678", points: 2850, change: 12.5 },
  { address: "0xabcdef1234567890abcdef1234567890abcdef12", points: 2340, change: 8.2 },
  { address: "0x9876543210fedcba9876543210fedcba98765432", points: 1920, change: -2.1 },
  { address: "0xfedcba9876543210fedcba9876543210fedcba98", points: 1650, change: 5.7 },
  { address: "0x5555666677778888999900001111222233334444", points: 1420, change: 15.3 },
];

export default function PointsDashboard() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '30D'>('24H');
  const [sortOrder, setSortOrder] = useState<'points' | 'change'>('points');
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // User's points data (would come from backend)
  const userPoints = useMemo(() => ({
    total: 0,
    rank: 0,
    // Breakdown by category
    protocol: { staking: 0, liquidity: 0, governance: 0 },
    trading: { trades: 0, volume: 0, firstTrade: false },
    social: { referrals: 0, shares: 0, communityHelp: 0 },
    contributions: { feedback: 0, bugReports: 0 },
    engagement: { dailyLogins: 0, holdingWeeks: 0 },
    achievements: { earlyAdopter: false, firstStake: false, firstTrade: false },
    // Referral info
    referralCode: account?.address ? account.address.slice(2, 8).toUpperCase() : '',
    referralCount: 0,
  }), [account?.address]);

  // Generate referral link
  const referralLink = useMemo(() => {
    if (!account?.address) return '';
    return `${window.location.origin}/signup?ref=${userPoints.referralCode}`;
  }, [account?.address, userPoints.referralCode]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing points...", { id: "refresh" });
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Points refreshed", { id: "refresh" });
    setIsRefreshing(false);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard");
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const hasWallet = !!account?.address;
  const sliderPosition = 50; // For visual consistency

  return (
    <>
      <SEO
        title="Points Dashboard | Season 1 | ETO Protocol"
        description="Track your Season 1 points and climb the leaderboard."
      />

      {/* Referral Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
            <DialogDescription>
              Share your referral link to gift friends 20% off trading fees. You'll earn 20% too, plus {POINT_VALUES.referral} points per referral.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Your Referral Code
              </label>
              <div className="flex gap-2">
                <Input 
                  value={userPoints.referralCode} 
                  readOnly 
                  className="font-mono text-lg tracking-widest"
                />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(userPoints.referralCode);
                  toast.success("Code copied");
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Referral Link
              </label>
              <div className="flex gap-2">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="font-mono text-[12px]"
                />
                <Button variant="cta" onClick={handleCopyReferral}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-[12px]">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Successful Referrals:</span>
                <span className="font-medium">{userPoints.referrals}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <TopNavBar />

        <div className="max-w-[1440px] mx-auto p-6 pt-20 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <h1 className="text-[28px] font-semibold tracking-tight">Points Dashboard</h1>
            
            <div className="flex items-center gap-2">
              {(['24H', '7D', '30D'] as const).map(time => (
                <button 
                  key={time}
                  className={`filter-pill ${timeFilter === time ? 'filter-pill-active' : ''}`}
                  onClick={() => setTimeFilter(time)}
                >
                  {time}
                </button>
              ))}
              
              <button className="filter-dropdown">
                {sortOrder === 'points' ? 'Points' : 'Change'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Referral Banner */}
          <div className="cta-card mb-6">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[14px] font-medium">ETO</span>
                  <span className="text-[9px] align-super text-muted-foreground">®</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-1 leading-tight">Referral Program</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-lg">
                  Refer friends to gift them 20% off trading fees and earn 20% yourself. Plus, earn {POINT_VALUES.referral} points per referral.
                </p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Button variant="cta" className="h-10" onClick={() => setReferralDialogOpen(true)}>
                  Get Referral Link
                  <Users className="w-3.5 h-3.5 ml-1.5" />
                </Button>
                
                <Button variant="ctaDark" className="h-10" asChild>
                  <Link to="/staking">
                    Stake to Earn
                    <Lock className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
              {/* Featured Point Categories - Top 3 highest value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredCategories.map((category) => {
                  const sparkData = generateSparklineData(30, 'up');
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <div 
                      key={category.id}
                      className={`staking-asset-card cursor-pointer group relative ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      onDoubleClick={() => {
                        if (category.id === 'referral') setReferralDialogOpen(true);
                        else if (category.id === 'bugReport') toast.info("Bug report form coming soon");
                        else if (category.id === 'feedback') toast.info("Feedback form coming soon");
                      }}
                    >
                      {/* Hover tooltip */}
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="px-2.5 py-1.5 rounded-md bg-background/95 backdrop-blur-sm border border-border-subtle shadow-lg">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">Double click to open</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                            {category.id === 'referral' && <Users className="w-4 h-4 text-muted-foreground" />}
                            {category.id === 'bugReport' && <Bug className="w-4 h-4 text-muted-foreground" />}
                            {category.id === 'feedback' && <MessageSquare className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">{category.type}</div>
                            <div className="text-[13px] font-medium">{category.name}</div>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="mb-3">
                        <div className="reward-rate-label">Points per Action</div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="reward-rate">+{category.points}</span>
                          <span className="text-xl text-muted-foreground font-normal">pts</span>
                        </div>
                      </div>
                      
                      <div className={`status-badge ${category.riskLevel === 'high' ? 'status-badge-positive' : ''} mb-4`}>
                        <span className="w-[6px] h-[6px] rounded-full bg-current" />
                        {category.riskLevel === 'high' ? 'highest reward' : 'high reward'}
                      </div>
                      
                      <div className="relative">
                        <Sparkline 
                          data={sparkData} 
                          height={60}
                          variant="positive"
                          showArea={true}
                          showEndValue={true}
                          endValue={category.description}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Point Sources - Organized by Category */}
              <div className="active-staking-card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-medium">All Ways to Earn Points</h2>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium">
                    {Object.values(allPointSources).flat().length} Actions
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Protocol Actions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Protocol Actions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {allPointSources.protocol.map((source) => (
                        <Link
                          key={source.id}
                          to={source.link || '#'}
                          onClick={(e) => !source.link && e.preventDefault()}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="text-[13px] font-medium">{source.name}</div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                            {source.link && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Trading Actions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Trading Actions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {allPointSources.trading.map((source) => (
                        <Link
                          key={source.id}
                          to={source.link || '#'}
                          onClick={(e) => !source.link && e.preventDefault()}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium">{source.name}</span>
                              {source.oneTime && <Badge variant="outline" className="text-[8px] py-0 h-4">One-time</Badge>}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                            {source.link && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Social & Referrals</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {allPointSources.social.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => {
                            if (source.id === 'referral') setReferralDialogOpen(true);
                            else toast.info(`${source.name} coming soon`);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group text-left"
                        >
                          <div className="flex-1">
                            <div className="text-[13px] font-medium">{source.name}</div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contributions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Contributions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allPointSources.contributions.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => toast.info(`${source.name} form coming soon`)}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group text-left"
                        >
                          <div className="flex-1">
                            <div className="text-[13px] font-medium">{source.name}</div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engagement */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Daily Engagement</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allPointSources.engagement.map((source) => (
                        <Link
                          key={source.id}
                          to={source.link || '#'}
                          onClick={(e) => !source.link && e.preventDefault()}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="text-[13px] font-medium">{source.name}</div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                            {source.link && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">One-Time Achievements</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {allPointSources.achievements.map((source) => (
                        <div
                          key={source.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium">{source.name}</span>
                              <Badge variant="outline" className="text-[8px] py-0 h-4 bg-primary/10 text-primary border-primary/30">Bonus</Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground">{source.description}</div>
                          </div>
                          <span className="text-[13px] font-semibold text-primary">+{source.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Section - Like "Your active stakings" */}
              <div className="active-staking-card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-medium">Global Leaderboard</h2>
                  <div className="flex items-center gap-0.5">
                    <button className={`icon-btn ${showChart ? 'bg-muted' : ''}`} onClick={() => setShowChart(!showChart)}>
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button className="icon-btn" onClick={() => setReferralDialogOpen(true)}>
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
                      <Trophy className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-[15px] font-medium mb-1">Connect Wallet</h3>
                    <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto">
                      Connect your wallet to track your points and see your ranking
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
                ) : (
                  <div className="space-y-5">
                    {showChart && (
                      <div className="p-4 rounded-xl bg-muted/30 mb-4">
                        <div className="text-[13px] text-muted-foreground mb-2">Points Distribution</div>
                        <Sparkline data={generateSparklineData(50, 'up')} height={100} variant="accent" showArea={true} />
                      </div>
                    )}

                    {/* Your Position */}
                    <div className="pb-5 border-b border-border-subtle">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-0.5">
                            <span>Your Position</span>
                            <Clock className="w-3 h-3" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[18px] font-semibold">Rank #{userPoints.rank || '—'}</h3>
                            <span className="text-[13px] font-mono text-muted-foreground">
                              {formatAddress(account?.address || '')}
                            </span>
                            <button 
                              onClick={() => handleCopyAddress(account?.address || '')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Total Points Earned</div>
                        <div className="flex items-center gap-4">
                          <span className="text-[46px] font-medium tracking-tight leading-none tabular-nums">
                            {userPoints.total.toLocaleString()}
                          </span>
                          <Button variant="cta" size="default" onClick={() => setReferralDialogOpen(true)}>
                            Invite
                          </Button>
                          <Button variant="outline" size="default" asChild>
                            <Link to="/staking">Stake</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 Leaderboard */}
                    <div className="space-y-2">
                      {leaderboardData.map((entry, index) => (
                        <div 
                          key={entry.address}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold ${
                            index === 0 ? 'bg-yellow-500/10 text-yellow-500' :
                            index === 1 ? 'bg-zinc-400/10 text-zinc-400' :
                            index === 2 ? 'bg-orange-600/10 text-orange-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-mono">{formatAddress(entry.address, 8, 6)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[14px] font-semibold tabular-nums">{entry.points.toLocaleString()}</div>
                            <div className={`text-[11px] ${entry.change >= 0 ? 'text-data-positive' : 'text-data-negative'}`}>
                              {entry.change >= 0 ? '+' : ''}{entry.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats Grid - Summary by Category */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-border-subtle">
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Referrals</span>
                        </div>
                        <div className="text-[22px] font-semibold tracking-tight">{userPoints.referralCount}</div>
                        <div className="text-[10px] text-primary">+{userPoints.referralCount * POINT_VALUES.referral} pts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownUp className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Trades</span>
                        </div>
                        <div className="text-[22px] font-semibold tracking-tight">{userPoints.trading.trades}</div>
                        <div className="text-[10px] text-primary">+{userPoints.trading.trades * POINT_VALUES.trading} pts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Staking</span>
                        </div>
                        <div className="text-[22px] font-semibold tracking-tight">{userPoints.protocol.staking}</div>
                        <div className="text-[10px] text-primary">+{userPoints.protocol.staking * POINT_VALUES.staking} pts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Daily Logins</span>
                        </div>
                        <div className="text-[22px] font-semibold tracking-tight">{userPoints.engagement.dailyLogins}</div>
                        <div className="text-[10px] text-primary">+{userPoints.engagement.dailyLogins * POINT_VALUES.dailyLogin} pts</div>
                      </div>
                    </div>

                    {/* Achievement Progress */}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <div className={`p-3 rounded-xl ${userPoints.achievements.earlyAdopter ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <div className="flex items-center gap-2">
                          {userPoints.achievements.earlyAdopter ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Gift className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-[11px] font-medium">Early Adopter</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">+{POINT_VALUES.earlyAdopter} pts</div>
                      </div>
                      <div className={`p-3 rounded-xl ${userPoints.achievements.firstStake ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <div className="flex items-center gap-2">
                          {userPoints.achievements.firstStake ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Zap className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-[11px] font-medium">First Stake</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">+{POINT_VALUES.firstStake} pts</div>
                      </div>
                      <div className={`p-3 rounded-xl ${userPoints.achievements.firstTrade ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <div className="flex items-center gap-2">
                          {userPoints.achievements.firstTrade ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-[11px] font-medium">First Trade</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">+{POINT_VALUES.firstTrade} pts</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
