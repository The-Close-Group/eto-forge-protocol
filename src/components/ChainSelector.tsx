
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Check, Loader2, AlertCircle } from 'lucide-react';
import { useSwitchActiveWalletChain, useActiveWalletChain } from "thirdweb/react";
import { etoMainnet } from '@/lib/thirdweb';

// Only ETO L1 is supported for DRI Protocol
const ETO_CHAIN_ID = 69420;

export function ChainSelector() {
  const [isSwitching, setIsSwitching] = useState(false);
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const isOnCorrectChain = activeChain?.id === ETO_CHAIN_ID;

  const handleSwitchToETO = async () => {
    if (isOnCorrectChain) return;
    
    setIsSwitching(true);
    try {
      await switchChain(etoMainnet);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Network</span>
      </div>
      
      <Card 
        className={`transition-colors duration-200 ${
          isOnCorrectChain 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-yellow-500 bg-yellow-500/10'
        }`}
      >
        <CardContent className="p-3">
          {isOnCorrectChain ? (
            <div className="flex items-center gap-2">
              <div className="text-lg">🟢</div>
              <div className="flex-1">
                <div className="text-sm font-medium">ETO L1 Mainnet</div>
                <div className="text-xs text-muted-foreground">Chain ID: {ETO_CHAIN_ID}</div>
              </div>
              <Check className="h-4 w-4 text-green-500" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Wrong network detected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleSwitchToETO}
                disabled={isSwitching}
              >
                {isSwitching ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Switching...
                  </>
                ) : (
                  'Switch to ETO L1'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
