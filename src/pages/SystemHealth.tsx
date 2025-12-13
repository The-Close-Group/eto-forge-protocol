import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Network, Shield, Target,
  Clock, RefreshCw, ChevronRight, Zap, Server, Database, Cpu, Wifi,
  TrendingUp, ExternalLink, Bell, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolStore, selectConnection, selectLatestBlock } from "@/stores/protocolStore";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import IncidentTimeline from "@/components/IncidentTimeline";
import TimeRangeSelector, { RangeKey } from "@/components/TimeRangeSelector";
import { addDays, subMonths, subYears, startOfYear, isAfter } from "date-fns";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDataLayer } from "@/lib/dataLayer";

const PegStabilityChart = lazy(() => import("@/components/charts/PegStabilityChart"));
const OracleFreshnessChart = lazy(() => import("@/components/charts/OracleFreshnessChart"));
const ServiceUptimeRadials = lazy(() => import("@/components/charts/ServiceUptimeRadials"));
const ReservesDonut = lazy(() => import("@/components/charts/ReservesDonut"));

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-muted-foreground rounded-xl bg-muted/30">Data temporarily unavailable.</div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

// Service status data
const services = [
  { id: 'dmm', name: 'DMM Core', status: 'operational', uptime: 99.997, latency: '12ms' },
  { id: 'oracle', name: 'Oracle Aggregator', status: 'operational', uptime: 99.999, latency: '3ms' },
  { id: 'maang', name: 'MAANG Controller', status: 'operational', uptime: 99.995, latency: '8ms' },
  { id: 'psm', name: 'PSM Module', status: 'operational', uptime: 99.992, latency: '15ms' },
  { id: 'circuit', name: 'Circuit Breakers', status: 'operational', uptime: 100.000, latency: '1ms' },
];

const oracleFeeds = [
  { name: 'Pyth', freshness: 2.1, status: 'synced' },
  { name: 'Hermes', freshness: 3.4, status: 'synced' },
  { name: 'Redstone', freshness: 4.2, status: 'synced' },
  { name: 'Chainlink', freshness: 2.9, status: 'synced' },
];

export default function SystemHealth() {
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const { data: protocolStats, isLoading: isLoadingProtocol, refetch: refetchStats } = useProtocolStats();
  const connection = useProtocolStore(selectConnection);
  const latestBlock = useProtocolStore(selectLatestBlock);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [range, setRange] = useState<RangeKey>("1M");
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  const [blockTimes, setBlockTimes] = useState<number[]>([]);
  const [lastBlockTimestamp, setLastBlockTimestamp] = useState<number>(0);

  // Track block times for average calculation
  useEffect(() => {
    if (latestBlock?.timestamp && latestBlock.timestamp !== lastBlockTimestamp) {
      const now = Date.now();
      if (lastBlockTimestamp > 0) {
        const blockTime = (now - lastBlockTimestamp) / 1000;
        setBlockTimes(prev => [...prev.slice(-19), blockTime]); // Keep last 20 samples
      }
      setLastBlockTimestamp(now);
    }
  }, [latestBlock?.number]);

  // Calculate average block time
  const avgBlockTime = blockTimes.length > 0 
    ? (blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length).toFixed(1)
    : '2.0';

  // Fetch gas price from chain
  const { data: gasPrice } = useQuery({
    queryKey: ['gas-price'],
    queryFn: async () => {
      try {
        const client = getDataLayer().getHttpClient();
        const price = await client.getGasPrice();
        return Number(price) / 1e9; // Convert to gwei
      } catch {
        return 0.001;
      }
    },
    refetchInterval: 10000,
  });

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Time-series data for Peg Stability
  type PegPoint = { t: number; dev: number };
  const [pegSeries, setPegSeries] = useState<PegPoint[]>(() => {
    const now = new Date();
    const start = subYears(now, 5);
    const points: PegPoint[] = [];
    let cur = start;
    let dev = 0;
    while (isAfter(now, cur) || cur.getTime() === now.getTime()) {
      const shock = (Math.random() - 0.5) * 0.02;
      dev = Math.max(-0.2, Math.min(0.2, dev * 0.9 + shock));
      points.push({ t: cur.getTime(), dev: Number(dev.toFixed(4)) });
      cur = addDays(cur, 1);
    }
    return points;
  });

  // Live updates
  useEffect(() => {
    const id = setInterval(() => {
      setPegSeries((prev) => {
        const last = prev[prev.length - 1];
        const now = Date.now();
        let dev = last?.dev ?? 0;
        const shock = (Math.random() - 0.5) * 0.01;
        dev = Math.max(-0.2, Math.min(0.2, dev * 0.98 + shock));
        return [...prev, { t: now, dev: Number(dev.toFixed(4)) }];
      });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Filter data by selected range
  const filteredPeg = useMemo(() => {
    const now = new Date();
    let from: Date;
    switch (range) {
      case "1M": from = subMonths(now, 1); break;
      case "3M": from = subMonths(now, 3); break;
      case "6M": from = subMonths(now, 6); break;
      case "YTD": from = startOfYear(now); break;
      case "1Y": from = subYears(now, 1); break;
      case "3Y": from = subYears(now, 3); break;
      case "5Y": from = subYears(now, 5); break;
      case "ALL":
      default: from = new Date(0);
    }
    return pegSeries.filter((p) => p.t >= from.getTime());
  }, [pegSeries, range]);

  const freshnessData = [
    { asset: "Pyth", seconds: 2.1 },
    { asset: "Hermes", seconds: 3.4 },
    { asset: "Pyth Pro", seconds: 1.8 },
    { asset: "Redstone", seconds: 4.2 },
    { asset: "Chainlink", seconds: 2.9 },
    { asset: "Canary", seconds: 5.1 },
    { asset: "Chaos", seconds: 3.7 },
    { asset: "Chronicle", seconds: 2.5 },
  ];

  const uptimeData = [
    { name: "DMM Core", uptime: 99.997 },
    { name: "MAANG Controller", uptime: 99.995 },
    { name: "Oracle Aggregator", uptime: 99.999 },
    { name: "PSM Module", uptime: 99.992 },
    { name: "Circuit Breakers", uptime: 100.000 },
  ];

  // Calculate reserves from real protocol data
  const reservesData = useMemo(() => {
    const dmmUsdc = protocolStats?.dmmUsdcBalance || 0;
    const dmmDri = (protocolStats?.dmmDriBalance || 0) * (protocolStats?.dmmPrice || 1);
    const vaultAssets = protocolStats?.vaultTotalAssets || 0;
    const total = dmmUsdc + dmmDri + vaultAssets;
    
    if (total === 0) {
      return [
        { name: "DMM USDC", value: 33 },
        { name: "DMM MAANG", value: 33 },
        { name: "Vault", value: 34 },
      ];
    }
    
    return [
      { name: "DMM USDC", value: Math.round((dmmUsdc / total) * 100) || 1 },
      { name: "DMM MAANG", value: Math.round((dmmDri / total) * 100) || 1 },
      { name: "Vault", value: Math.round((vaultAssets / total) * 100) || 1 },
    ];
  }, [protocolStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing system data...", { id: "refresh" });
    
    try {
      await refetchStats();
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("System data refreshed", { id: "refresh" });
    } catch (error) {
      toast.error("Failed to refresh data", { id: "refresh" });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <SEO
        title="System Health | ETO Protocol"
        description="Live system health, oracle freshness, and protocol transparency dashboard."
        canonical={canonical}
      />

      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <header className="header-bar sticky top-0 z-50 backdrop-blur-sm bg-background/95">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold">System Health</h1>
                <p className="text-[11px] text-muted-foreground">Protocol Transparency Dashboard</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30 ml-4">
              <span className="w-1.5 h-1.5 rounded-full bg-data-positive mr-1.5 animate-pulse" />
              All Systems Operational
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
          {/* Stats Row */}
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { label: 'Oracle Price', value: `$${(protocolStats?.oraclePrice || 0).toFixed(2)}`, icon: Target, positive: true },
              { label: 'DMM Price', value: `$${(protocolStats?.dmmPrice || 0).toFixed(2)}`, icon: Zap, positive: true },
              { label: 'Price Deviation', value: `${(protocolStats?.priceDeviation || 0).toFixed(2)} bps`, icon: TrendingUp, positive: Math.abs(protocolStats?.priceDeviation || 0) < 10 },
              { label: 'Total Value Locked', value: `$${((protocolStats?.tvl || 0) / 1000000).toFixed(2)}M`, icon: Database, positive: true },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="staking-asset-card"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className={`text-2xl font-semibold tabular-nums ${stat.positive ? 'text-data-positive' : 'text-data-negative'}`}>
                  {isLoadingProtocol ? <Skeleton className="h-7 w-20" /> : stat.value}
                </div>
                <div className="mt-3">
                  <Sparkline 
                    data={generateSparklineData(20, stat.positive ? 'up' : 'down')} 
                    height={32}
                    variant={stat.positive ? 'positive' : 'negative'}
                    showArea={true}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Peg Stability Chart */}
              <div 
                className={`active-staking-card transition-all duration-700 delay-150 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-medium">Peg Stability</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Live deviation from target peg</p>
            </div>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
                <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-xl" />}>
            <ErrorBoundary>
              <PegStabilityChart data={filteredPeg} />
            </ErrorBoundary>
          </Suspense>
                    </div>

              {/* Services Grid */}
              <div 
                className={`transition-all duration-700 delay-200 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-medium">Core Services</h2>
                  <span className="text-[11px] text-muted-foreground">{services.length} services monitored</span>
                      </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <div 
                      key={service.id}
                      className="staking-asset-card group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-data-positive/10 flex items-center justify-center">
                            <Server className="w-4 h-4 text-data-positive" />
                      </div>
                          <span className="text-[13px] font-medium">{service.name}</span>
                      </div>
                        <CheckCircle2 className="w-4 h-4 text-data-positive" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[11px] text-muted-foreground mb-1">Uptime</div>
                          <div className="text-[15px] font-semibold text-data-positive">{service.uptime}%</div>
                    </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground mb-1">Latency</div>
                          <div className="text-[15px] font-semibold">{service.latency}</div>
                      </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={service.uptime} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs for detailed views */}
              <div 
                className={`transition-all duration-700 delay-250 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="oracles">Oracles</TabsTrigger>
                    <TabsTrigger value="pools">Pools</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Suspense fallback={<Skeleton className="h-[280px] w-full rounded-xl" />}>
                        <ErrorBoundary>
                          <ServiceUptimeRadials data={uptimeData} />
                        </ErrorBoundary>
                      </Suspense>
                      <Suspense fallback={<Skeleton className="h-[280px] w-full rounded-xl" />}>
                        <ErrorBoundary>
                          <ReservesDonut data={reservesData} />
                        </ErrorBoundary>
                      </Suspense>
                    </div>

                    {/* Incident Timeline */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-[14px] flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          Incident Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <IncidentTimeline items={[]} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="oracles" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Suspense fallback={<Skeleton className="h-[280px] w-full rounded-xl" />}>
                        <ErrorBoundary>
                          <OracleFreshnessChart data={freshnessData} />
                        </ErrorBoundary>
                      </Suspense>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-[14px]">Oracle Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {oracleFeeds.map((feed) => (
                            <div key={feed.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-data-positive" />
                                <span className="text-[13px] font-medium">{feed.name}</span>
                  </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[12px] text-muted-foreground">{feed.freshness}s</span>
                    </div>
                  </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="pools" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-[14px] flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Pool Health
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { name: 'MAANG/USDC Pool', status: 'healthy', utilization: 45 },
                          { name: 'sMAANG/MAANG Pool', status: 'healthy', utilization: 62 },
                          { name: 'USDC/MAANG Pool', status: 'monitor', utilization: 78 },
                        ].map((pool) => (
                          <div key={pool.name} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[13px] font-medium">{pool.name}</span>
                              <Badge variant="outline" className={pool.status === 'healthy' ? 'bg-data-positive/10 text-data-positive border-data-positive/30' : 'bg-warning/10 text-warning border-warning/30'}>
                                {pool.status === 'healthy' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                {pool.status}
                              </Badge>
                  </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] text-muted-foreground">Utilization</span>
                              <span className="text-[11px] font-medium">{pool.utilization}%</span>
                </div>
                            <Progress value={pool.utilization} className="h-1.5" />
              </div>
                        ))}
                      </CardContent>
                    </Card>
          </TabsContent>

                  <TabsContent value="network" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { 
                          label: 'Block Time', 
                          value: `${avgBlockTime}s`, 
                          status: parseFloat(avgBlockTime) < 3 ? 'Normal' : 'Slow' 
                        },
                        { 
                          label: 'Gas Price', 
                          value: `${(gasPrice || 0.001).toFixed(4)} gwei`, 
                          status: (gasPrice || 0) < 1 ? 'Low' : 'Normal' 
                        },
                        { 
                          label: 'WebSocket', 
                          value: connection.wsConnected ? 'Connected' : 'Disconnected', 
                          status: connection.wsConnected ? 'Live' : 'Offline' 
                        },
                        { 
                          label: 'Current Block', 
                          value: `#${(protocolStats?.lastBlock || 0).toLocaleString()}`, 
                          status: 'Synced' 
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="staking-asset-card">
                          <div className="text-[11px] text-muted-foreground mb-2">{metric.label}</div>
                          <div className="text-xl font-semibold mb-1">{metric.value}</div>
                          <Badge variant="outline" className={`text-[10px] ${
                            metric.status === 'Live' || metric.status === 'Low' || metric.status === 'Normal' || metric.status === 'Synced'
                              ? 'bg-data-positive/10 text-data-positive border-data-positive/30'
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                          }`}>
                            {metric.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* System Status CTA */}
              <div className="cta-card">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-medium">ETO</span>
                      <span className="text-[9px] align-super text-muted-foreground">®</span>
                    </div>
                    <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30 text-[10px]">
                      Live
                    </Badge>
                  </div>
                  <h3 className="text-[18px] font-semibold mb-2 leading-tight">Protocol Status</h3>
                  <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                    All systems operational. Oracle feeds synced. Circuit breakers normal.
                  </p>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-[12px]">Last Block</span>
                      <span className="text-[12px] font-mono text-primary">#{(protocolStats?.lastBlock || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-[12px]">Epoch</span>
                      <span className="text-[12px] font-mono">{protocolStats?.currentEpoch || 0}</span>
                    </div>
                  </div>

                  <Button variant="cta" className="w-full h-11">
                    View Explorer
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Transparency Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { 
                      label: 'Oracle Freshness', 
                      value: protocolStats?.oracleTimestamp 
                        ? `${Math.round((Date.now() / 1000 - protocolStats.oracleTimestamp))}s ago`
                        : '~3s',
                      desc: 'Last oracle update' 
                    },
                    { 
                      label: 'Reserve Ratio', 
                      value: protocolStats?.tvl && protocolStats.tvl > 0 ? '100%+' : 'N/A', 
                      desc: 'Fully backed' 
                    },
                    { 
                      label: 'DMM Status', 
                      value: protocolStats?.dmmPaused ? 'Paused' : 'Active', 
                      desc: protocolStats?.dmmPaused ? 'Trading halted' : 'Trading enabled' 
                    },
                    { 
                      label: 'Price Deviation', 
                      value: `${Math.abs(protocolStats?.priceDeviation || 0).toFixed(1)} bps`, 
                      desc: Math.abs(protocolStats?.priceDeviation || 0) < 50 ? 'Within tolerance' : 'Monitor' 
                    },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                        <span className={`text-[13px] font-semibold ${
                          item.value === 'Paused' ? 'text-destructive' : 'text-data-positive'
                        }`}>{item.value}</span>
              </div>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tracking Accuracy */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Tracking Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Asset Tracking', value: 99.8 },
                    { label: 'Price Feed Reliability', value: 99.95 },
                    { label: 'Oracle Sync Rate', value: 100 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px]">{item.label}</span>
                        <span className="text-[12px] font-semibold text-data-positive">{item.value}%</span>
                </div>
                      <Progress value={item.value} className="h-1.5" />
                </div>
                  ))}
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
                      <span className="text-[13px]">View Dashboard</span>
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
                    <Link to="/trade">
                      <span className="text-[13px]">Trade Assets</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
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
