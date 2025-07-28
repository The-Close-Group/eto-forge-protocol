import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Copy, TrendingUp, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TransactionComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get transaction details from URL params
  const txHash = searchParams.get("txHash") || "0x1234...5678";
  const fromAsset = searchParams.get("fromAsset") || "USDC";
  const toAsset = searchParams.get("toAsset") || "MAANG";
  const fromAmount = searchParams.get("fromAmount") || "1000";
  const toAmount = searchParams.get("toAmount") || "4.20";
  const type = searchParams.get("type") || "buy";

  const copyTransactionHash = () => {
    navigator.clipboard.writeText(txHash);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    });
  };

  const viewOnExplorer = () => {
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-data-positive/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-data-positive" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold font-mono">Transaction Complete!</h1>
          <p className="text-muted-foreground">Your order has been successfully executed</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Summary</span>
            <Badge className="bg-data-positive/10 text-data-positive border-data-positive/20">
              {type.charAt(0).toUpperCase() + type.slice(1)} Order Filled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trade Details */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">{fromAmount}</div>
                <div className="text-sm text-muted-foreground">{fromAsset}</div>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">{toAmount}</div>
                <div className="text-sm text-muted-foreground">{toAsset}</div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{txHash}</span>
                <Button variant="ghost" size="sm" onClick={copyTransactionHash}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network</span>
              <span className="font-mono">Ethereum</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gas Fee</span>
              <span className="font-mono">$2.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-mono">$1.00</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Total Cost</span>
              <span className="font-mono">${parseFloat(fromAmount).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-accent/20 rounded-lg">
              <div className="text-lg font-bold font-mono">+{toAmount}</div>
              <div className="text-sm text-muted-foreground">{toAsset} Added</div>
            </div>
            <div className="text-center p-3 bg-accent/20 rounded-lg">
              <div className="text-lg font-bold font-mono">-{fromAmount}</div>
              <div className="text-sm text-muted-foreground">{fromAsset} Spent</div>
            </div>
          </div>
          <div className="text-center pt-2">
            <div className="text-sm text-muted-foreground">
              Your portfolio has been updated with the new balances
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate("/portfolio")}
        >
          View Portfolio
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/order")}
          >
            New Trade
          </Button>
          <Button 
            variant="outline" 
            onClick={viewOnExplorer}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => navigate("/trade")}
        >
          Back to Trading
        </Button>
      </div>
    </div>
  );
}