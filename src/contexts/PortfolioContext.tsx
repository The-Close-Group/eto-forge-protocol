
import { createContext, useContext, useState, ReactNode } from 'react';

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  averagePrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PortfolioContextType {
  assets: PortfolioAsset[];
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  addTrade: (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number, rate: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const ASSET_PRICES = {
  MAANG: 238.00,
  USDC: 1.00,
  ETH: 3567.00,
  AVAX: 26.00,
  BTC: 45000.00
};

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);

  const addTrade = (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number, rate: number) => {
    setAssets(prev => {
      const updated = [...prev];
      
      // Remove from asset
      const fromIndex = updated.findIndex(a => a.symbol === fromAsset);
      if (fromIndex >= 0) {
        const fromAssetData = updated[fromIndex];
        const newAmount = fromAssetData.amount - (fromAmount / ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES]);
        
        if (newAmount <= 0.001) {
          updated.splice(fromIndex, 1);
        } else {
          updated[fromIndex] = {
            ...fromAssetData,
            amount: newAmount,
            currentValue: newAmount * ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES],
            profitLoss: (newAmount * ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES]) - (newAmount * fromAssetData.averagePrice),
            profitLossPercent: ((ASSET_PRICES[fromAsset as keyof typeof ASSET_PRICES] - fromAssetData.averagePrice) / fromAssetData.averagePrice) * 100
          };
        }
      }
      
      // Add to asset
      const toIndex = updated.findIndex(a => a.symbol === toAsset);
      const toPrice = ASSET_PRICES[toAsset as keyof typeof ASSET_PRICES];
      const toQuantity = toAmount / toPrice;
      
      if (toIndex >= 0) {
        const toAssetData = updated[toIndex];
        const newAmount = toAssetData.amount + toQuantity;
        const newTotalInvested = toAssetData.totalInvested + fromAmount;
        const newAveragePrice = newTotalInvested / newAmount;
        
        updated[toIndex] = {
          ...toAssetData,
          amount: newAmount,
          averagePrice: newAveragePrice,
          currentValue: newAmount * toPrice,
          totalInvested: newTotalInvested,
          profitLoss: (newAmount * toPrice) - newTotalInvested,
          profitLossPercent: ((toPrice - newAveragePrice) / newAveragePrice) * 100
        };
      } else {
        updated.push({
          symbol: toAsset,
          name: getAssetName(toAsset),
          amount: toQuantity,
          averagePrice: toPrice,
          currentValue: toAmount,
          totalInvested: fromAmount,
          profitLoss: toAmount - fromAmount,
          profitLossPercent: ((toAmount - fromAmount) / fromAmount) * 100
        });
      }
      
      return updated;
    });
  };

  const getAssetName = (symbol: string) => {
    const names: { [key: string]: string } = {
      MAANG: "Meta AI & Analytics",
      ETH: "Ethereum",
      USDC: "USD Coin",
      AVAX: "Avalanche",
      BTC: "Bitcoin"
    };
    return names[symbol] || symbol;
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalInvested = assets.reduce((sum, asset) => sum + asset.totalInvested, 0);
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <PortfolioContext.Provider value={{ 
      assets, 
      totalValue, 
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent,
      addTrade 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
