
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Activity, 
  Target, 
  BarChart3, 
  Zap, 
  Network,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";

export default function SystemHealth() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-data-positive";
      case "warning": return "text-yellow-400";
      case "critical": return "text-data-negative";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal": return CheckCircle;
      case "warning": return AlertTriangle;
      case "critical": return XCircle;
      default: return Activity;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 pb-20 md:pb-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-mono uppercase tracking-wider text-foreground mb-3">
          System Health
        </h1>
        <p className="text-muted-foreground font-mono text-base tracking-wide">
          Real-time monitoring of ETO platform metrics
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="trading-panel grid-lines">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              Overall Health
            </h3>
            <Shield className="h-5 w-5 text-data-positive" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-mono font-bold text-data-positive tracking-wide">
              98.7%
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              System operational
            </p>
          </div>
        </div>

        <div className="trading-panel grid-lines">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              Active Protocols
            </h3>
            <Network className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-mono font-bold tracking-wide">12</div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Cross-chain networks
            </p>
          </div>
        </div>

        <div className="trading-panel grid-lines">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              Uptime
            </h3>
            <Activity className="h-5 w-5 text-data-positive" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-mono font-bold text-data-positive tracking-wide">
              99.97%
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              30-day average
            </p>
          </div>
        </div>
      </div>

      {/* Peg Integrity Section */}
      <div className="trading-panel">
        <div className="mb-6">
          <h2 className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-1">
            <Target className="h-6 w-6 text-accent" />
            Peg Integrity
          </h2>
          <p className="text-sm text-muted-foreground font-mono tracking-wide">
            Asset price deviation monitoring
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono font-medium tracking-wide">MAANG/USDC</span>
              <Badge variant="outline" className="font-mono text-xs bg-data-positive/10 text-data-positive border-data-positive/30">
                OPTIMAL
              </Badge>
            </div>
            <div className="text-2xl font-mono font-bold text-data-positive tracking-wide">0.02%</div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>
          
          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono font-medium tracking-wide">ETH/USD</span>
              <Badge variant="outline" className="font-mono text-xs bg-data-positive/10 text-data-positive border-data-positive/30">
                OPTIMAL
              </Badge>
            </div>
            <div className="text-2xl font-mono font-bold text-data-positive tracking-wide">0.05%</div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>

          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono font-medium tracking-wide">BTC/USD</span>
              <Badge variant="outline" className="font-mono text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
                WATCH
              </Badge>
            </div>
            <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wide">0.12%</div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>
        </div>
      </div>

      {/* Tracking & Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="trading-panel">
          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-1">
              <BarChart3 className="h-6 w-6 text-accent" />
              Tracking Percentage
            </h2>
            <p className="text-sm text-muted-foreground font-mono tracking-wide">
              System accuracy metrics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Asset Tracking Accuracy</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.8%</span>
              </div>
              <Progress value={99.8} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Price Feed Reliability</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.95%</span>
              </div>
              <Progress value={99.95} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Oracle Sync Rate</span>
                <span className="text-data-positive font-mono font-bold text-lg">100%</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>
          </div>
        </div>

        <div className="trading-panel">
          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-1">
              <Activity className="h-6 w-6 text-accent" />
              Pool Size Health
            </h2>
            <p className="text-sm text-muted-foreground font-mono tracking-wide">
              Liquidity pool analytics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Total Liquidity</p>
                <p className="text-2xl font-mono font-bold">$45.7M</p>
                <p className="text-xs font-mono text-data-positive uppercase tracking-wide">+12.3% today</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-mono font-bold text-data-positive">67%</p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Optimal range</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">ETH Pool</span>
                <span className="text-data-positive font-mono font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">USDC Pool</span>
                <span className="text-data-positive font-mono font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">BTC Pool</span>
                <span className="text-yellow-400 font-mono font-medium">Monitor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network & DMM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="trading-panel">
          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-1">
              <Network className="h-6 w-6 text-accent" />
              Network Metrics
            </h2>
            <p className="text-sm text-muted-foreground font-mono tracking-wide">
              Blockchain performance data
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Block Time</p>
                <p className="text-2xl font-mono font-bold">12.1s</p>
                <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Normal</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Gas Price</p>
                <p className="text-2xl font-mono font-bold">23 gwei</p>
                <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Low</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Transaction Success Rate</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Network Congestion</span>
                <span className="text-data-positive font-mono font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>

        <div className="trading-panel">
          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-1">
              <Zap className="h-6 w-6 text-accent" />
              DMM & Bridge Status
            </h2>
            <p className="text-sm text-muted-foreground font-mono tracking-wide">
              Service operational status
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Dynamic Market Maker</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Layer Zero Bridge</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Operational</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Cross-chain Messaging</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Online</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono tracking-wide">Bridge Volume (24h)</span>
                <span className="text-data-positive font-mono font-bold text-lg">$2.3M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
