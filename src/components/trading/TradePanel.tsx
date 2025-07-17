import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, Percent } from "lucide-react";

export const TradePanel = () => {
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState("buy");

  return (
    <div className="trading-panel">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold mono">Trade BTC/USD</h3>
      </div>

      <div className="p-4">
        <Tabs value={side} onValueChange={setSide} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="mono data-[state=active]:bg-success/20 data-[state=active]:text-success">
              Buy / Long
            </TabsTrigger>
            <TabsTrigger value="sell" className="mono data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
              Sell / Short
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-4">
            <TradeForm side="buy" />
          </TabsContent>
          
          <TabsContent value="sell" className="mt-4">
            <TradeForm side="sell" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface TradeFormProps {
  side: "buy" | "sell";
}

const TradeForm = ({ side }: TradeFormProps) => {
  const [orderType, setOrderType] = useState("limit");
  
  return (
    <div className="space-y-4">
      {/* Order Type */}
      <div className="flex space-x-2">
        <Button
          variant={orderType === "market" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("market")}
          className="flex-1 mono text-xs"
        >
          Market
        </Button>
        <Button
          variant={orderType === "limit" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("limit")}
          className="flex-1 mono text-xs"
        >
          Limit
        </Button>
        <Button
          variant={orderType === "stop" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("stop")}
          className="flex-1 mono text-xs"
        >
          Stop
        </Button>
      </div>

      {/* Price Input */}
      {orderType !== "market" && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground mono">Price</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="43,256.78"
              className="industrial-input mono pr-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-muted-foreground mono">USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Size Input */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground mono">Size</label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.001"
            className="industrial-input mono pr-12"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-muted-foreground mono">BTC</span>
          </div>
        </div>
      </div>

      {/* Size Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {["25%", "50%", "75%", "100%"].map((percent) => (
          <Button
            key={percent}
            variant="outline"
            size="sm"
            className="mono text-xs"
          >
            {percent}
          </Button>
        ))}
      </div>

      {/* Leverage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground mono">Leverage</label>
          <Badge variant="outline" className="text-xs mono">10x</Badge>
        </div>
        <div className="flex space-x-2">
          {["1x", "5x", "10x", "20x", "50x"].map((lev) => (
            <Button
              key={lev}
              variant={lev === "10x" ? "default" : "outline"}
              size="sm"
              className="flex-1 mono text-xs"
            >
              {lev}
            </Button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-2 p-3 bg-muted/20 rounded-sm">
        <div className="flex justify-between text-xs mono">
          <span className="text-muted-foreground">Est. Size</span>
          <span>0.001 BTC</span>
        </div>
        <div className="flex justify-between text-xs mono">
          <span className="text-muted-foreground">Est. Value</span>
          <span>$43.26</span>
        </div>
        <div className="flex justify-between text-xs mono">
          <span className="text-muted-foreground">Fee</span>
          <span>$0.13</span>
        </div>
        <div className="flex justify-between text-xs mono border-t border-border pt-2">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">$43.39</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        className={`w-full mono font-medium ${
          side === "buy"
            ? "bg-success hover:bg-success/90 text-success-foreground"
            : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        }`}
      >
        {side === "buy" ? "Buy / Long" : "Sell / Short"} BTC
      </Button>

      {/* Balance Info */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground mono">
          Available: <span className="text-foreground">$1,234.56 USD</span>
        </div>
      </div>
    </div>
  );
};