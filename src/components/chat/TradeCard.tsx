import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useTradeExecution } from "@/hooks/useTradeExecution";
import { useToast } from "@/hooks/use-toast";
import CoinIcon from "@/components/CoinIcon";

interface TradeCardProps {
  fromAsset: string;
  toAsset: string;
  amount: number;
}

export function TradeCard({ fromAsset, toAsset, amount }: TradeCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const { executeTrade } = useTradeExecution();
  const { toast } = useToast();
  
  const prices: any = { MAANG: 33, USDC: 1, ETH: 3200, AVAX: 35, SOL: 140 };
  const fromPrice = prices[fromAsset] || 0;
  const toPrice = prices[toAsset] || 0;
  const toAmount = (amount * fromPrice) / toPrice;

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeTrade({
        fromAsset,
        toAsset,
        fromAmount: amount,
        toAmount,
        executionPrice: toPrice,
      });
      toast({
        title: "Trade Executed!",
        description: `Successfully traded ${amount} ${fromAsset} for ${toAmount.toFixed(4)} ${toAsset}`,
      });
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Unable to execute trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Trade Opportunity</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-center">
          <CoinIcon symbol={fromAsset} className="h-8 w-8 mx-auto mb-1" />
          <p className="text-2xl font-bold">{amount}</p>
          <p className="text-xs text-muted-foreground">{fromAsset}</p>
        </div>
        
        <ArrowRight className="h-6 w-6 text-primary flex-shrink-0" />
        
        <div className="flex-1 text-center">
          <CoinIcon symbol={toAsset} className="h-8 w-8 mx-auto mb-1" />
          <p className="text-2xl font-bold">{toAmount.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">{toAsset}</p>
        </div>
      </div>
      
      <div className="space-y-1 mb-4 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate:</span>
          <span className="font-medium">1 {fromAsset} = {(toAmount / amount).toFixed(4)} {toAsset}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Value:</span>
          <span className="font-medium">${(amount * fromPrice).toFixed(2)}</span>
        </div>
      </div>
      
      <Button 
        onClick={handleExecute} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Executing..." : "Execute Trade"}
      </Button>
    </Card>
  );
}
