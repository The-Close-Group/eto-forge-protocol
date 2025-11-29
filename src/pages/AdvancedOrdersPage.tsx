import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, TrendingUp, Target, Layers, Clock, BarChart3 } from "lucide-react";
import { useAdvancedOrders } from "@/hooks/useAdvancedOrders";

export default function AdvancedOrdersPage() {
  const navigate = useNavigate();
  const {
    ocoOrders,
    trailingStops,
    icebergOrders,
    twapOrders,
    vwapOrders,
    getAdvancedOrderStats,
    cancelAdvancedOrder
  } = useAdvancedOrders();

  const stats = getAdvancedOrderStats();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return 'bg-data-positive';
      case 'triggered':
      case 'filled':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-muted';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-mono">Advanced Orders</h1>
          <p className="text-muted-foreground">Professional trading strategies and execution algorithms</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-data-positive" />
              <div>
                <p className="text-sm text-muted-foreground">OCO Orders</p>
                <p className="text-xl font-bold">{stats.ocoOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Trailing</p>
                <p className="text-xl font-bold">{stats.trailingStopOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Iceberg</p>
                <p className="text-xl font-bold">{stats.icebergOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">TWAP</p>
                <p className="text-xl font-bold">{stats.twapOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-sm text-muted-foreground">VWAP</p>
                <p className="text-xl font-bold">{stats.vwapOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <p className="text-xl font-bold">{(stats.executionQuality * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="oco">OCO</TabsTrigger>
          <TabsTrigger value="trailing">Trailing</TabsTrigger>
          <TabsTrigger value="iceberg">Iceberg</TabsTrigger>
          <TabsTrigger value="twap">TWAP</TabsTrigger>
          <TabsTrigger value="vwap">VWAP</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Slippage</span>
                  <span className="font-mono">{stats.averageSlippage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Execution Quality</span>
                  <span className="font-mono">{(stats.executionQuality * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Volume</span>
                  <span className="font-mono">${stats.totalVolume.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/order?type=oco')}
                >
                  Create OCO Order
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/order?type=trailing_stop')}
                >
                  Create Trailing Stop
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/order?type=iceberg')}
                >
                  Create Iceberg Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="oco" className="space-y-4">
          <div className="space-y-4">
            {ocoOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No OCO orders found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/order?type=oco')}
                  >
                    Create OCO Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              ocoOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">OCO Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-data-positive">Take Profit</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.primaryOrder.amount} {order.primaryOrder.asset} @ ${order.primaryOrder.price?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-data-negative">Stop Loss</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.secondaryOrder.amount} {order.secondaryOrder.asset} @ ${order.secondaryOrder.stopPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelAdvancedOrder(order.id, 'oco')}
                        disabled={order.status !== 'active'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trailing" className="space-y-4">
          <div className="space-y-4">
            {trailingStops.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No trailing stop orders found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/order?type=trailing_stop')}
                  >
                    Create Trailing Stop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              trailingStops.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Trailing Stop #{order.id.slice(-8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Asset</span>
                        <span className="font-mono">{order.amount} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trail Distance</span>
                        <span className="font-mono">
                          {order.trailPercent ? `${(order.trailPercent * 100).toFixed(1)}%` : `$${order.trailAmount}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Price</span>
                        <span className="font-mono">${order.peakPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Stop</span>
                        <span className="font-mono">${order.currentStopPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelAdvancedOrder(order.id, 'trailing_stop')}
                        disabled={order.status !== 'open'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="iceberg" className="space-y-4">
          <div className="space-y-4">
            {icebergOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No iceberg orders found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/order?type=iceberg')}
                  >
                    Create Iceberg Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              icebergOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Iceberg Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Size</span>
                        <span className="font-mono">{order.totalSize} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Display Size</span>
                        <span className="font-mono">{order.displaySize} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Executed</span>
                        <span className="font-mono">{order.executedSize} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span className="font-mono">
                          {((order.executedSize / order.totalSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelAdvancedOrder(order.id, 'iceberg')}
                        disabled={order.status !== 'open'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="twap" className="space-y-4">
          <div className="space-y-4">
            {twapOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No TWAP orders found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/order?type=twap')}
                  >
                    Create TWAP Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              twapOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">TWAP Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount</span>
                        <span className="font-mono">{order.amount} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Execution Period</span>
                        <span className="font-mono">{order.executionPeriod} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slices Completed</span>
                        <span className="font-mono">{order.currentSliceIndex} / {order.slices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span className="font-mono">
                          {((order.filled / order.amount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelAdvancedOrder(order.id, 'twap')}
                        disabled={order.status !== 'open'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vwap" className="space-y-4">
          <div className="space-y-4">
            {vwapOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No VWAP orders found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/order?type=vwap')}
                  >
                    Create VWAP Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              vwapOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">VWAP Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount</span>
                        <span className="font-mono">{order.amount} {order.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participation Rate</span>
                        <span className="font-mono">{(order.participationRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Execution Period</span>
                        <span className="font-mono">{order.executionPeriod} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span className="font-mono">
                          {((order.filled / order.amount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelAdvancedOrder(order.id, 'vwap')}
                        disabled={order.status !== 'open'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}