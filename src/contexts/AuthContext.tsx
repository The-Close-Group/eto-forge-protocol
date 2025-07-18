
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  walletAddress: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => void;
  updateWalletAddress: (address: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load auth state from localStorage on mount
    const savedWallet = localStorage.getItem('eto-wallet');
    if (savedWallet) {
      setUser({ walletAddress: savedWallet });
    }
  }, []);

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('eto-wallet');
    localStorage.removeItem('eto-wallet-type');
  };

  const updateWalletAddress = (address: string) => {
    if (address) {
      const newUser = { walletAddress: address };
      setUser(newUser);
      localStorage.setItem('eto-wallet', address);
    } else {
      setUser(null);
      localStorage.removeItem('eto-wallet');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user?.walletAddress,
      signOut,
      updateWalletAddress
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
