import React, { createContext, useContext, useCallback } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';

interface AuthContextType {
  // Wallet address (primary identifier)
  address: string | null;
  // Whether user has connected wallet
  isAuthenticated: boolean;
  // Whether wallet is currently connecting
  isConnecting: boolean;
  // Disconnect wallet
  disconnect: () => void;
  // Shortened address for display (0x1234...5678)
  shortAddress: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect: thirdwebDisconnect } = useDisconnect();

  const address = account?.address ?? null;
  const isAuthenticated = !!address;

  // Format address for display
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const disconnect = useCallback(() => {
    if (wallet) {
      thirdwebDisconnect(wallet);
    }
  }, [wallet, thirdwebDisconnect]);

  return (
    <AuthContext.Provider value={{
      address,
      isAuthenticated,
      isConnecting: false, // Thirdweb handles this internally
      disconnect,
      shortAddress,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
