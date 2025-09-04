
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useSwitchActiveWalletChain, useActiveWalletChain } from "thirdweb/react";
import { supportedChains, etoTestnet } from '@/lib/thirdweb';

const chainIcons: Record<number, string> = {
  1: '🔵', // Ethereum
  137: '🟣', // Polygon
  42161: '🔴', // Arbitrum
};

const chainNames: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
};

export function ChainSelector() {
  const [isSwitching, setIsSwitching] = useState(false);
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const handleChainSwitch = async (chainId: number) => {
    if (activeChain?.id === chainId) return;
    
    setIsSwitching(true);
    try {
      const targetChain = supportedChains.find(chain => chain.id === chainId);
      if (targetChain) {
        await switchChain(targetChain);
      }
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
      
      <div className="grid grid-cols-3 gap-2">
        {supportedChains.map((chain) => (
          <Card 
            key={chain.id}
            className={`cursor-pointer transition-colors duration-200 ${
              activeChain?.id === chain.id 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:bg-accent/50'
            }`}
          >
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full h-auto p-3 flex flex-col items-center gap-2 hover:bg-transparent"
                onClick={() => handleChainSwitch(chain.id)}
                disabled={isSwitching}
              >
                <div className="text-lg">
                  {chainIcons[chain.id] || '⚪'}
                </div>
                <div className="text-xs font-medium text-center">
                  {chainNames[chain.id] || `Chain ${chain.id}`}
                </div>
                {activeChain?.id === chain.id && (
                  <Check className="h-3 w-3 text-primary" />
                )}
                {isSwitching && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
