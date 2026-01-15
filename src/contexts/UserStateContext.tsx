import { createContext, useContext, ReactNode } from 'react';
import { useUserBalances } from '@/hooks/useUserBalances';
import { useAuth } from './AuthContext';

interface UserStateContextType {
  balances: ReturnType<typeof useUserBalances>['balances'];
  isLoading: boolean;
  getTotalPortfolioValue: () => number;
  getBalance: (asset: string) => any;
  getAvailableBalance: (asset: string) => number;
  updateBalance: (asset: string, change: number) => void;
  validateAmount: (asset: string, amount: number) => { isValid: boolean; error?: string };
  formatAmount: (amount: number, asset: string) => string;
  isNewUser: boolean;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const { address } = useAuth();
  const balanceHook = useUserBalances();
  
  // Check if user is new (no balances or all balances are zero)
  const isNewUser = !balanceHook.isLoading && (
    balanceHook.balances.length === 0 || 
    balanceHook.balances.every(b => b.balance === 0)
  );

  const contextValue: UserStateContextType = {
    ...balanceHook,
    isNewUser
  };

  return (
    <UserStateContext.Provider value={contextValue}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserState() {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return context;
}