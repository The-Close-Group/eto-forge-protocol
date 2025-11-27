import SEO from "@/components/SEO";
import IncidentTimeline from "@/components/IncidentTimeline";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Network,
  Shield,
  Target,
} from "lucide-react";

import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { addDays, subMonths, subYears, startOfYear, isAfter } from "date-fns";
import TimeRangeSelector, { RangeKey } from "@/components/TimeRangeSelector";
import { useProtocolStats } from "@/hooks/useProtocolStats";
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
        <div className="trading-panel p-6 text-sm font-mono text-muted-foreground">Data temporarily unavailable.</div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}


export default function SystemHealth() {
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const { data: protocolStats, isLoading: isLoadingProtocol } = useProtocolStats();

  // Time-series data for Peg Stability (timestamp in ms)
  type PegPoint = { t: number; dev: number };

  const [range, setRange] = useState<RangeKey>("1M");
  const [pegSeries, setPegSeries] = useState<PegPoint[]>(() => {
    const now = new Date();
    const start = subYears(now, 5);
    const points: PegPoint[] = [];
    let cur = start;
    let dev = 0; // centered around 0
    while (isAfter(now, cur) || cur.getTime() === now.getTime()) {
      // random walk with gentle mean reversion
      const shock = (Math.random() - 0.5) * 0.02; // +/- 1%
      dev = Math.max(-0.2, Math.min(0.2, dev * 0.9 + shock));
      points.push({ t: cur.getTime(), dev: Number(dev.toFixed(4)) });
      cur = addDays(cur, 1);
    }
    return points;
  });

  // Live updates: append a new point every 10s with minor movement
  useEffect(() => {
    const id = setInterval(() => {
      setPegSeries((prev) => {
        const last = prev[prev.length - 1];
        const now = Date.now();
        let dev = last?.dev ?? 0;
        const shock = (Math.random() - 0.5) * 0.01; // +/- 0.5%
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
      case "1M":
        from = subMonths(now, 1);
        break;
      case "3M":
        from = subMonths(now, 3);
        break;
      case "6M":
        from = subMonths(now, 6);
        break;
      case "YTD":
        from = startOfYear(now);
        break;
      case "1Y":
        from = subYears(now, 1);
        break;
      case "3Y":
        from = subYears(now, 3);
        break;
      case "5Y":
        from = subYears(now, 5);
        break;
      case "ALL":
      default:
        from = new Date(0);
    }
    const fromTs = from.getTime();
    return pegSeries.filter((p) => p.t >= fromTs);
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

  const reservesData = [
    { name: "mUSDC", value: 45 },
    { name: "MAANG", value: 35 },
    { name: "MAANG", value: 15 },
    { name: "GOVMAANG", value: 5 },
  ];

  return (
    <>
      <SEO
        title="DeFi System Health | Transparency Dashboard"
        description="Live peg accuracy, oracles freshness, reserves, risk controls, and service status. Transparent system health for the ETO protocol."
        canonical={canonical}
      />

      <main className="container max-w-7xl mx-auto p-6 pb-24 md:pb-10 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            System Health
          </h1>
          <p className="text-muted-foreground">
            Transparent, real-time view into protocol stability and operations
          </p>
        </header>

        <section aria-labelledby="peg-accuracy" className="trading-panel p-6 overflow-hidden animate-fade-in bg-card">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Peg Stability</h2>
              <p className="text-sm text-muted-foreground">Live deviation vs peg — defaulting to August view</p>
            </div>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
          <Suspense fallback={<div className="p-2"><Skeleton className="h-[220px] w-full" /></div>}>
            <ErrorBoundary>
              <PegStabilityChart data={filteredPeg} />
            </ErrorBoundary>
          </Suspense>
        </section>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="oracles">Oracles</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<div className="trading-panel p-6"><Skeleton className="h-[220px] w-full" /></div>}>
              <ErrorBoundary>
                <section className="grid grid-cols-1 gap-6">
                  <div className="trading-panel p-6 space-y-6">
                    <div className="space-y-2">
                      <h2 id="peg-accuracy" className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-accent" /> ETO Protocol Health
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Reflective price mechanism active. DMM liquidity concentrated. All systems operational.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Oracle Price</p>
                        <p className="text-2xl font-mono font-bold text-data-positive">
                          {isLoadingProtocol ? <Skeleton className="h-8 w-20" /> : `$${(protocolStats?.oraclePrice || 0).toFixed(2)}`}
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">DMM Price</p>
                        <p className="text-2xl font-mono font-bold text-data-positive">
                          {isLoadingProtocol ? <Skeleton className="h-8 w-20" /> : `$${(protocolStats?.dmmPrice || 0).toFixed(2)}`}
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Price Deviation</p>
                        <p className={`text-2xl font-mono font-bold ${Math.abs(protocolStats?.priceDeviation || 0) < 10 ? 'text-data-positive' : 'text-data-negative'}`}>
                          {isLoadingProtocol ? <Skeleton className="h-8 w-16" /> : `${(protocolStats?.priceDeviation || 0).toFixed(2)} bps`}
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Total Value Locked</p>
                        <p className="text-2xl font-mono font-bold text-data-positive">
                          {isLoadingProtocol ? <Skeleton className="h-8 w-20" /> : `$${((protocolStats?.tvl || 0) / 1000000).toFixed(2)}M`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Capital Efficiency</p>
                        <p className="text-xl font-mono font-bold text-accent">200x</p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Vault Share Price</p>
                        <p className="text-xl font-mono font-bold text-data-positive">
                          {isLoadingProtocol ? <Skeleton className="h-6 w-16" /> : (protocolStats?.vaultSharePrice || 1).toFixed(4)}
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">DMM Liquidity</p>
                        <p className="text-xl font-mono font-bold">
                          {isLoadingProtocol ? <Skeleton className="h-6 w-16" /> : `${(protocolStats?.totalLiquidity || 0).toFixed(2)} LP`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {protocolStats?.isHealthy ? (
                        <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">System Healthy</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-data-negative/10 text-data-negative border-data-negative/30">System Warning</Badge>
                      )}
                      {!protocolStats?.dmmPaused && (
                        <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">DMM Operational</Badge>
                      )}
                      <Badge variant="outline">Circuit Breakers Normal</Badge>
                      <Badge variant="outline">Oracle Skip Enabled</Badge>
                      <Badge variant="outline">Oracle Consensus 100%</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ServiceUptimeRadials data={uptimeData} />
                    <ReservesDonut data={reservesData} />
                  </div>
                </section>
              </ErrorBoundary>
            </Suspense>
            {/* Transparency Grid */}
            <section aria-labelledby="transparency" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="trading-panel p-6 space-y-4">
                <h2 id="transparency" className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" /> Transparency
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Oracle Freshness</p>
                    <p className="text-xl font-mono font-bold">~3s</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">Avg time since last update</p>
                  </div>
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Reserve Ratio</p>
                    <p className="text-xl font-mono font-bold text-data-positive">100%+</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">Backed & solvent</p>
                  </div>
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Risk Controls</p>
                    <p className="text-xl font-mono font-bold text-data-positive">All clear</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">No triggers</p>
                  </div>
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Incidents</p>
                    <p className="text-xl font-mono font-bold">0</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">Past 90 days</p>
                  </div>
                </div>
              </div>

              <div className="trading-panel p-6 space-y-5">
                <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                  <Network className="h-5 w-5 text-accent" /> Services & SLA
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="font-mono">Dynamic Market Maker</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Operational</span></span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="font-mono">LayerZero Bridge</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Operational</span></span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="font-mono">Price Oracles</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Synced</span></span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-mono">API Gateway</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Healthy</span></span>
                  </div>
                </div>
              </div>

              <div className="trading-panel p-6 space-y-5">
                <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" /> Tracking Accuracy
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Asset Tracking</span>
                      <span className="text-data-positive font-mono font-bold">99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Price Feed Reliability</span>
                      <span className="text-data-positive font-mono font-bold">99.95%</span>
                    </div>
                    <Progress value={99.95} className="h-2.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Oracle Sync Rate</span>
                      <span className="text-data-positive font-mono font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2.5" />
                  </div>
                </div>
              </div>
            </section>

            {/* Incidents */}
            <section className="trading-panel p-6 space-y-6">
              <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> Incident Timeline
              </h2>
              <IncidentTimeline items={[]} />
            </section>
          </TabsContent>

          <TabsContent value="oracles" className="space-y-6">
            <Suspense fallback={<div className="trading-panel p-6"><Skeleton className="h-[260px] w-full" /></div>}>
              <ErrorBoundary>
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <OracleFreshnessChart data={freshnessData} />
                  </div>
                  <div className="trading-panel p-6 space-y-4">
                    <h2 className="text-base font-mono uppercase tracking-wider">Oracles Status</h2>
                    <div className="space-y-3">
                      {freshnessData.map((f) => (
                        <div key={f.asset} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <span className="font-mono flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-data-positive" /> {f.asset}
                          </span>
                          <span className="text-sm font-mono text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {f.seconds.toFixed(1)}s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </ErrorBoundary>
            </Suspense>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="trading-panel p-6 space-y-4">
                <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" /> Transparency
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Oracle Freshness</p>
                    <p className="text-xl font-mono font-bold">~3s</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">Avg time since last update</p>
                  </div>
                  <div className="metric-tile">
                    <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Reserve Ratio</p>
                    <p className="text-xl font-mono font-bold text-data-positive">100%+</p>
                    <p className="text-[11px] font-mono text-accent-foreground/80">Backed & solvent</p>
                  </div>
                </div>
              </div>

              <div className="trading-panel p-6 space-y-5">
                <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" /> Tracking Accuracy
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Asset Tracking</span>
                      <span className="text-data-positive font-mono font-bold">99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Price Feed Reliability</span>
                      <span className="text-data-positive font-mono font-bold">99.95%</span>
                    </div>
                    <Progress value={99.95} className="h-2.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Oracle Sync Rate</span>
                      <span className="text-data-positive font-mono font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2.5" />
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="pools" className="space-y-6">
            {/* Pool Health */}
            <section className="trading-panel p-6 space-y-6">
              <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" /> Pool Health
              </h2>
              <div className="p-4 rounded-xl border border-border/40 bg-background/30 text-center">
                <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Utilization Rate</p>
                <p className="text-3xl font-mono font-bold text-muted-foreground">0%</p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Minimal activity</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono">MAANG/USDC Pool</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Healthy</span></span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono">MAANG/ETH Pool</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Healthy</span></span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-mono">USDC/MAANG Pool</span>
                  <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> <span className="text-warning font-mono">Monitor</span></span>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            {/* Network Metrics */}
            <section className="trading-panel p-6 space-y-6">
              <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                <Network className="h-5 w-5 text-accent" /> Network Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="metric-tile text-center">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Block Time</p>
                  <p className="text-2xl font-mono font-bold">12.1s</p>
                  <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Normal</p>
                </div>
                <div className="metric-tile text-center">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Gas Price</p>
                  <p className="text-2xl font-mono font-bold">23 gwei</p>
                  <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Low</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm font-mono">Transaction Success Rate</span>
                  <span className="text-data-positive font-mono font-bold">99.7%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm font-mono">Throughput</span>
                  <span className="font-mono">~450 tx/min</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-mono">Congestion</span>
                  <span className="text-data-positive font-mono">Low</span>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}


