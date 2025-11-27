import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import maangLogo from "@/assets/maang-logo.svg";

export default function Trade() {
  const navigate = useNavigate();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  // Use DMM price as the live trading price
  const livePrice = dmmPrice || oraclePrice || 0;
  const priceSource = dmmPrice > 0 ? 'DMM' : oraclePrice > 0 ? 'Oracle' : 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-4xl w-full">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-display-lg md:text-display-xl font-display mb-4">
            Token{" "}
            <span className="text-muted-foreground/40">Trading Hub</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Trade MAANG tokens on the Dynamic Market Maker
          </p>
        </div>

        {/* Main Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MAANG Widget */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 p-2">
                  <img src={maangLogo} alt="MAANG" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-bold font-mono mb-2">MAANG</h3>
                <p className="text-muted-foreground mb-4">Dynamic Reflective Index Token</p>
                <div className="text-3xl font-bold text-primary font-mono">
                  {isLoading ? (
                    <Skeleton className="h-9 w-32 mx-auto" />
                  ) : (
                    `$${livePrice.toFixed(2)}`
                  )}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  Live from {priceSource}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/buy-maang")}
                  variant="positive"
                  size="lg"
                  className="w-full font-mono"
                >
                  Buy MAANG
                </Button>
                <Button 
                  onClick={() => navigate("/buy-maang")}
                  variant="outline"
                  size="lg"
                  className="w-full font-mono"
                >
                  Sell MAANG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* USDC Widget */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 p-2">
                  <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040" alt="USDC" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-bold font-mono mb-2">mUSDC</h3>
                <p className="text-muted-foreground mb-4">Mock USD Coin (Paper Trading)</p>
                <div className="text-3xl font-bold text-primary font-mono">
                  $1.00
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  Pegged to USD
                </Badge>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/buy-maang")}
                  variant="positive"
                  size="lg"
                  className="w-full font-mono"
                >
                  Swap to MAANG
                </Button>
                <Button
                  onClick={() => navigate("/faucet")}
                  variant="outline"
                  size="lg"
                  className="w-full font-mono"
                >
                  Get mUSDC (Faucet)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Info */}
        {!isLoading && livePrice > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Oracle: ${oraclePrice.toFixed(2)} | DMM: ${dmmPrice.toFixed(2)} | 
              Deviation: {Math.abs(((dmmPrice - oraclePrice) / oraclePrice) * 10000).toFixed(2)} bps
            </p>
          </div>
        )}
      </div>
    </div>
  );
}