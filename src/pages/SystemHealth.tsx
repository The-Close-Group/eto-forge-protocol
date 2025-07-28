
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      case "optimal": return "text-[hsl(var(--status-optimal))]";
      case "warning": return "text-[hsl(var(--status-warning))]";
      case "critical": return "text-[hsl(var(--status-critical))]";
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
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono uppercase tracking-wider mb-2 text-[hsl(var(--electric-blue))]">System Health</h1>
        <p className="text-muted-foreground font-mono">Real-time monitoring of ETO platform metrics</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-mono">Overall Health</CardTitle>
            <Shield className="h-4 w-4 text-[hsl(var(--status-optimal))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--status-optimal))]">98.7%</div>
            <p className="text-xs text-muted-foreground font-mono">System operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-mono">Active Protocols</CardTitle>
            <Network className="h-4 w-4 text-[hsl(var(--electric-blue))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--electric-blue))]">12</div>
            <p className="text-xs text-muted-foreground font-mono">Cross-chain networks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-mono">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-[hsl(var(--status-optimal))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--status-optimal))]">99.97%</div>
            <p className="text-xs text-muted-foreground font-mono">30-day average</p>
          </CardContent>
        </Card>
      </div>

      {/* Peg Integrity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono">
            <Target className="h-5 w-5 text-[hsl(var(--electric-blue))]" />
            Peg Integrity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-mono">MAANG/USDC</span>
                <Badge variant="outline" className="text-[hsl(var(--status-optimal))] border-[hsl(var(--status-optimal))] font-mono">OPTIMAL</Badge>
              </div>
              <div className="text-lg font-bold font-mono">0.02%</div>
              <p className="text-xs text-muted-foreground font-mono">Deviation from peg</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-mono">ETH/USD</span>
                <Badge variant="outline" className="text-[hsl(var(--status-optimal))] border-[hsl(var(--status-optimal))] font-mono">OPTIMAL</Badge>
              </div>
              <div className="text-lg font-bold font-mono">0.05%</div>
              <p className="text-xs text-muted-foreground font-mono">Deviation from peg</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-mono">BTC/USD</span>
                <Badge variant="outline" className="text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning))] font-mono">WATCH</Badge>
              </div>
              <div className="text-lg font-bold font-mono">0.12%</div>
              <p className="text-xs text-muted-foreground font-mono">Deviation from peg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking & Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <BarChart3 className="h-5 w-5 text-[hsl(var(--electric-blue))]" />
              Tracking Percentage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Asset Tracking Accuracy</span>
                <span className="text-[hsl(var(--status-optimal))] font-bold font-mono">99.8%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[hsl(var(--status-optimal))] h-2 rounded-full" style={{ width: '99.8%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Price Feed Reliability</span>
                <span className="text-[hsl(var(--status-optimal))] font-bold font-mono">99.95%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[hsl(var(--status-optimal))] h-2 rounded-full" style={{ width: '99.95%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Oracle Sync Rate</span>
                <span className="text-[hsl(var(--status-optimal))] font-bold font-mono">100%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[hsl(var(--status-optimal))] h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Activity className="h-5 w-5 text-[hsl(var(--electric-blue))]" />
              Pool Size Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium font-mono">Total Liquidity</p>
                <p className="text-lg font-bold font-mono">$45.7M</p>
                <p className="text-xs text-[hsl(var(--status-optimal))] font-mono">+12.3% today</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium font-mono">Utilization Rate</p>
                <p className="text-lg font-bold text-[hsl(var(--status-optimal))] font-mono">67%</p>
                <p className="text-xs text-muted-foreground font-mono">Optimal range</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-mono">ETH Pool</span>
                <span className="text-[hsl(var(--status-optimal))] font-mono">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">USDC Pool</span>
                <span className="text-[hsl(var(--status-optimal))] font-mono">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">BTC Pool</span>
                <span className="text-[hsl(var(--status-warning))] font-mono">Monitor</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network & DMM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Network className="h-5 w-5 text-[hsl(var(--electric-blue))]" />
              Network Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium font-mono">Block Time</p>
                <p className="text-lg font-bold font-mono">12.1s</p>
                <p className="text-xs text-[hsl(var(--status-optimal))] font-mono">Normal</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium font-mono">Gas Price</p>
                <p className="text-lg font-bold font-mono">23 gwei</p>
                <p className="text-xs text-[hsl(var(--status-optimal))] font-mono">Low</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-mono">Transaction Success Rate</span>
                <span className="text-[hsl(var(--status-optimal))] font-bold font-mono">99.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">Network Congestion</span>
                <span className="text-[hsl(var(--status-optimal))] font-mono">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Zap className="h-5 w-5 text-[hsl(var(--electric-blue))]" />
              DMM & Bridge Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Dynamic Market Maker</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--status-optimal))]" />
                  <span className="text-[hsl(var(--status-optimal))] font-mono">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Layer Zero Bridge</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--status-optimal))]" />
                  <span className="text-[hsl(var(--status-optimal))] font-mono">Operational</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">Cross-chain Messaging</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--status-optimal))]" />
                  <span className="text-[hsl(var(--status-optimal))] font-mono">Online</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex justify-between">
                <span className="text-sm font-mono">Bridge Volume (24h)</span>
                <span className="text-[hsl(var(--status-optimal))] font-bold font-mono">$2.3M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
