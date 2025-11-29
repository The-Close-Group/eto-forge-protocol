import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, BarChart3, PieChart, Activity, AlertTriangle, Shield } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { useState } from "react";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const analytics = useAnalytics({ timeframe, includeRealizedPnL: true, includeUnrealizedPnL: true });
  const performance = usePerformanceMetrics(timeframe === '7D' ? '1M' : timeframe === '30D' ? '1M' : timeframe === '90D' ? '3M' : '1Y');

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analysis and performance metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7D">7 Days</SelectItem>
              <SelectItem value="30D">30 Days</SelectItem>
              <SelectItem value="90D">90 Days</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.performance.totalReturnPercent >= 0 ? 'text-data-positive' : 'text-data-negative'}`}>
              {analytics.performance.totalReturnPercent >= 0 ? '+' : ''}{analytics.performance.totalReturnPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.totalReturnPercent >= 0 ? '+' : ''}${analytics.performance.totalReturn.toFixed(0)} {timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
            <p className="text-xs text-muted-foreground">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Trade Size</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">—</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trading">Trading Activity</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={performance.chartData} height={260} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily PnL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Daily PnL chart will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <p className="text-2xl font-bold text-muted-foreground">$0</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Best Day</p>
                  <p className="text-2xl font-bold text-muted-foreground">$0</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Worst Day</p>
                  <p className="text-2xl font-bold text-muted-foreground">$0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Trading volume chart will be implemented here
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Buy Orders</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-accent rounded-full h-2">
                      <div className="w-20 bg-green-500 h-2 rounded-full"></div>
                    </div>
                    <span className="font-medium">62%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sell Orders</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-accent rounded-full h-2">
                      <div className="w-12 bg-red-500 h-2 rounded-full"></div>
                    </div>
                    <span className="font-medium">38%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Asset allocation pie chart will be implemented here
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chain Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* NOTE: Asset allocation data is placeholder - real data should come from wallet balances */}
                {[
                  { chain: "MAANG", percentage: "—%", amount: "$0" },
                  { chain: "sMAANG", percentage: "—%", amount: "$0" },
                  { chain: "USDC", percentage: "—%", amount: "$0" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.chain}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{item.amount}</span>
                      <span className="font-medium">{item.percentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => alert("Trading Summary Report - This feature will generate a comprehensive weekly trading report")}>
                  <span>Trading Summary</span>
                  <span className="text-xs text-muted-foreground">Weekly trading report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => alert("Tax Report - This feature will generate tax documents for filing purposes")}>
                  <span>Tax Report</span>
                  <span className="text-xs text-muted-foreground">For tax filing purposes</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => alert("Performance Report - This feature will generate detailed performance analytics")}>
                  <span>Performance Report</span>
                  <span className="text-xs text-muted-foreground">Detailed performance analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => alert("Custom Report - This feature allows you to create custom reports with specific metrics")}>
                  <span>Custom Report</span>
                  <span className="text-xs text-muted-foreground">Create custom report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}