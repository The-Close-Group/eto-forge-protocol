import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePrices } from "@/hooks/usePrices";

export default function Trade() {
  const navigate = useNavigate();
  const { getTokenPrice } = usePrices();
  const { setOpen } = useSidebar();

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-4xl w-full">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground font-mono mb-2">
            Token Trading Hub
          </h1>
          <p className="text-muted-foreground">
            Choose your preferred token to stake or trade
          </p>
        </div>

        {/* Main Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MAANG Widget */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-4xl mx-auto mb-4">
                  🤖
                </div>
                <h3 className="text-2xl font-bold font-mono mb-2">MAANG</h3>
                <p className="text-muted-foreground mb-4">Meta AI & Analytics Token</p>
                <div className="text-3xl font-bold text-primary font-mono">
                  ${(getTokenPrice('MAANG') || 0).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/staking")}
                  variant="positive"
                  size="lg"
                  className="w-full font-mono"
                >
                  Stake MAANG
                </Button>
                <Button 
                  onClick={() => navigate("/buy-maang")}
                  variant="outline"
                  size="lg"
                  className="w-full font-mono group-hover:border-primary/50"
                >
                  Buy MAANG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* USDC Widget */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-4xl mx-auto mb-4">
                  💵
                </div>
                <h3 className="text-2xl font-bold font-mono mb-2">USDC</h3>
                <p className="text-muted-foreground mb-4">USD Coin Stablecoin</p>
                <div className="text-3xl font-bold text-primary font-mono">
                  ${(getTokenPrice('mUSDC') || 1).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/staking")}
                  variant="positive"
                  size="lg"
                  className="w-full font-mono"
                >
                  Stake USDC
                </Button>
                <Button 
                  onClick={() => navigate("/swap?token=USDC")}
                  variant="outline"
                  size="lg"
                  className="w-full font-mono group-hover:border-primary/50"
                >
                  Trade USDC
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}