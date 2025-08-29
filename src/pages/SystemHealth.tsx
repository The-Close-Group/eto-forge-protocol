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
    { asset: "ETH", seconds: 3.1 },
    { asset: "BTC", seconds: 2.7 },
    { asset: "SOL", seconds: 5.8 },
    { asset: "USDC", seconds: 1.9 },
    { asset: "AVAX", seconds: 6.3 },
  ];

  const uptimeData = [
    { name: "DMM", uptime: 99.997 },
    { name: "LayerZero Bridge", uptime: 99.992 },
    { name: "Price Oracles", uptime: 99.999 },
    { name: "API Gateway", uptime: 99.980 },
  ];

  const reservesData = [
    { name: "USDC", value: 62 },
    { name: "USDT", value: 21 },
    { name: "ETH", value: 11 },
    { name: "Other", value: 6 },
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
                        <Target className="h-5 w-5 text-accent" /> Peg Integrity Snapshot
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Deviation is within optimal range. Feeds synchronized and circuit breakers idle.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Median Deviation</p>
                        <p className="text-2xl font-mono font-bold text-data-positive">0.03%</p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Worst Deviation</p>
                        <p className="text-2xl font-mono font-bold text-warning">0.12%</p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Freshness</p>
                        <p className="text-2xl font-mono font-bold">~3s</p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-sm text-muted-foreground">Tracked Assets</p>
                        <p className="text-2xl font-mono font-bold">12</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30">Feeds Healthy</Badge>
                      <Badge variant="outline">Circuit Breakers Idle</Badge>
                      <Badge variant="outline">DR Constraints Stable</Badge>
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
                  <span className="font-mono">ETH Pool</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Healthy</span></span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono">USDC Pool</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> <span className="text-data-positive font-mono">Healthy</span></span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-mono">BTC Pool</span>
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

