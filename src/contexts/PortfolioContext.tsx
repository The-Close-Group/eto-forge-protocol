
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useUserState, UserStateContextType } from './UserStateContext';

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  averagePrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  realizedPnL: number;
  unrealizedPnL: number;
  costBasis: number;
}

export interface TradeExecution {
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  executionPrice: number;
  timestamp: number;
  orderId?: string;
  fees?: number;
}

interface PortfolioContextType {
  assets: PortfolioAsset[];
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  addTrade: (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number, rate: number) => void;
  executeTradeWithBalanceUpdate: (trade: TradeExecution) => void;
  getAssetPosition: (symbol: string) => PortfolioAsset | null;
  calculatePositionValue: (symbol: string) => number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Get real-time prices from user state
const getCurrentPrice = (symbol: string, userState: UserStateContextType): number => {
  const balance = userState.getBalance(symbol);
  return balance?.price || 0;
};

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const userState = useUserState();

  const executeTradeWithBalanceUpdate = useCallback((trade: TradeExecution) => {
    // Update balances through user state
    userState.updateBalance(trade.fromAsset, -trade.fromAmount);
    userState.updateBalance(trade.toAsset, trade.toAmount);

    // Update portfolio positions
    setAssets(prev => {
      const updated = [...prev];
      
      // Handle selling asset (reducing position)
      const fromIndex = updated.findIndex(a => a.symbol === trade.fromAsset);
      if (fromIndex >= 0) {
        const fromAssetData = updated[fromIndex];
        const currentPrice = getCurrentPrice(trade.fromAsset, userState);
        const soldQuantity = trade.fromAmount / currentPrice;
        const newAmount = Math.max(0, fromAssetData.amount - soldQuantity);
        
        if (newAmount <= 0.001) {
          // Calculate realized P&L when closing position
          const realizedPnL = (currentPrice - fromAssetData.averagePrice) * fromAssetData.amount;
          updated.splice(fromIndex, 1);
        } else {
          // Partial sale - calculate realized P&L for sold portion
          const realizedPnL = (currentPrice - fromAssetData.averagePrice) * soldQuantity;
          const newCurrentValue = newAmount * currentPrice;
          const newTotalInvested = fromAssetData.totalInvested * (newAmount / fromAssetData.amount);
          
          updated[fromIndex] = {
            ...fromAssetData,
            amount: newAmount,
            currentValue: newCurrentValue,
            totalInvested: newTotalInvested,
            realizedPnL: fromAssetData.realizedPnL + realizedPnL,
            unrealizedPnL: newCurrentValue - newTotalInvested,
            profitLoss: (fromAssetData.realizedPnL + realizedPnL) + (newCurrentValue - newTotalInvested),
            profitLossPercent: newTotalInvested > 0 ? (((fromAssetData.realizedPnL + realizedPnL) + (newCurrentValue - newTotalInvested)) / newTotalInvested) * 100 : 0
          };
        }
      }
      
      // Handle buying asset (increasing position)
      const toIndex = updated.findIndex(a => a.symbol === trade.toAsset);
      const toPrice = getCurrentPrice(trade.toAsset, userState);
      const boughtQuantity = trade.toAmount / toPrice;
      const investmentAmount = trade.fromAmount;
      
      if (toIndex >= 0) {
        const toAssetData = updated[toIndex];
        const newAmount = toAssetData.amount + boughtQuantity;
        const newTotalInvested = toAssetData.totalInvested + investmentAmount;
        const newAveragePrice = newTotalInvested / newAmount;
        const newCurrentValue = newAmount * toPrice;
        
        updated[toIndex] = {
          ...toAssetData,
          amount: newAmount,
          averagePrice: newAveragePrice,
          currentValue: newCurrentValue,
          totalInvested: newTotalInvested,
          costBasis: newTotalInvested,
          unrealizedPnL: newCurrentValue - newTotalInvested,
          profitLoss: toAssetData.realizedPnL + (newCurrentValue - newTotalInvested),
          profitLossPercent: newTotalInvested > 0 ? ((toAssetData.realizedPnL + (newCurrentValue - newTotalInvested)) / newTotalInvested) * 100 : 0
        };
      } else {
        const currentValue = trade.toAmount;
        updated.push({
          symbol: trade.toAsset,
          name: getAssetName(trade.toAsset),
          amount: boughtQuantity,
          averagePrice: trade.executionPrice,
          currentValue,
          totalInvested: investmentAmount,
          costBasis: investmentAmount,
          realizedPnL: 0,
          unrealizedPnL: currentValue - investmentAmount,
          profitLoss: currentValue - investmentAmount,
          profitLossPercent: investmentAmount > 0 ? ((currentValue - investmentAmount) / investmentAmount) * 100 : 0
        });
      }
      
      return updated;
    });
  }, [userState]);

  // Legacy addTrade for backward compatibility
  const addTrade = useCallback((fromAsset: string, toAsset: string, fromAmount: number, toAmount: number, rate: number) => {
    const trade: TradeExecution = {
      fromAsset,
      toAsset,
      fromAmount,
      toAmount,
      executionPrice: rate,
      timestamp: Date.now()
    };
    executeTradeWithBalanceUpdate(trade);
  }, [executeTradeWithBalanceUpdate]);

  const getAssetPosition = useCallback((symbol: string): PortfolioAsset | null => {
    return assets.find(asset => asset.symbol === symbol) || null;
  }, [assets]);

  const calculatePositionValue = useCallback((symbol: string): number => {
    const position = getAssetPosition(symbol);
    return position ? position.currentValue : 0;
  }, [getAssetPosition]);

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

  // Enhanced portfolio calculations
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalInvested = assets.reduce((sum, asset) => sum + asset.totalInvested, 0);
  const totalRealizedPnL = assets.reduce((sum, asset) => sum + (asset.realizedPnL || 0), 0);
  const totalUnrealizedPnL = assets.reduce((sum, asset) => sum + (asset.unrealizedPnL || 0), 0);
  const totalProfitLoss = totalRealizedPnL + totalUnrealizedPnL;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <PortfolioContext.Provider value={{ 
      assets, 
      totalValue, 
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent,
      totalRealizedPnL,
      totalUnrealizedPnL,
      addTrade,
      executeTradeWithBalanceUpdate,
      getAssetPosition,
      calculatePositionValue
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
