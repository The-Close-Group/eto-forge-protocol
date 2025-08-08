import SEO from "@/components/SEO";
import IncidentTimeline from "@/components/IncidentTimeline";
import ResponsiveDialGauge from "@/components/ResponsiveDialGauge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Network,
  Shield,
  Target,
} from "lucide-react";

export default function SystemHealth() {
  const canonical = typeof window !== "undefined" ? window.location.href : "";

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

        <section aria-labelledby="peg-accuracy" className="trading-panel p-6 md:p-10 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex items-center justify-center mx-auto w-full max-w-[380px] overflow-hidden">
              <ResponsiveDialGauge
                value={99.9}
                label="Peg Accuracy"
                subLabel="Last 12 blocks"
                variant="semi"
                showTicks
                showNeedle
              />
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

        {/* Pools & Network */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="trading-panel p-6 space-y-6">
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
          </div>

          <div className="trading-panel p-6 space-y-6">
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
          </div>
        </section>

        {/* Incidents */}
        <section className="trading-panel p-6 space-y-6">
          <h2 className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" /> Incident Timeline
          </h2>
          <IncidentTimeline items={[]} />
        </section>
      </main>
    </>
  );
}
