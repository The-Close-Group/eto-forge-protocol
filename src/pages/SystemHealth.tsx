import SEO from "@/components/SEO";
import IncidentTimeline from "@/components/IncidentTimeline";
import ResponsiveDialGauge from "@/components/ResponsiveDialGauge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sparkline from "@/components/Sparkline";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Network,
  Shield,
  Target,
} from "lucide-react";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

const PegStabilityChart = lazy(() => import("@/components/charts/PegStabilityChart"));
const OracleFreshnessChart = lazy(() => import("@/components/charts/OracleFreshnessChart"));
const ServiceUptimeRadials = lazy(() => import("@/components/charts/ServiceUptimeRadials"));
const ReservesDonut = lazy(() => import("@/components/charts/ReservesDonut"));

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
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

  // Demo data for charts (replace with live data when available)
  const pegData = Array.from({ length: 60 }).map((_, i) => ({
    t: i,
    dev: (Math.sin(i / 8) * 0.06 + (Math.random() - 0.5) * 0.02), // -0.08..0.08
  }));

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
        <header className="text-center">
          <h1 className="text-3xl font-mono font-bold uppercase tracking-wider">
            System Health
          </h1>
          <p className="mt-2 text-muted-foreground font-mono tracking-wide">
            Transparent, real-time view into protocol stability and operations
          </p>
        </header>

        <section aria-labelledby="peg-accuracy" className="trading-panel p-6 md:p-10 overflow-hidden animate-fade-in bg-gradient-to-b from-card to-card/60 grid-lines">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center justify-center mx-auto w-full max-w-[420px] overflow-hidden">
              <ResponsiveDialGauge
                value={99.9}
                label="Peg Accuracy"
                subLabel="Last 12 blocks"
                variant="semi"
                showTicks
                showNeedle
              />
              <div className="mt-4 w-full px-4">
                <Sparkline data={[98.9, 99.1, 99.3, 99.6, 99.7, 99.9, 99.8, 99.9, 100, 99.9]} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 id="peg-accuracy" className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-6 w-6 text-accent" /> Peg Integrity Snapshot
                </h2>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  Deviation is within optimal range. Feeds synchronized and circuit breakers idle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="metric-tile">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Median Deviation</p>
                  <p className="text-2xl font-mono font-bold text-data-positive">0.03%</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Worst Deviation</p>
                  <p className="text-2xl font-mono font-bold text-warning">0.12%</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Freshness</p>
                  <p className="text-2xl font-mono font-bold">~3s</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Tracked Assets</p>
                  <p className="text-2xl font-mono font-bold">12</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-data-positive/10 text-data-positive border-data-positive/30 font-mono">Feeds Healthy</Badge>
                <Badge variant="outline" className="font-mono">Circuit Breakers Idle</Badge>
                <Badge variant="outline" className="font-mono">DR Constraints Stable</Badge>
              </div>
            </div>
          </div>
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
                  <PegStabilityChart data={pegData} />
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

