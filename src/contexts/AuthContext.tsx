
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateWalletAddress: (address: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load auth state from localStorage on mount
    const savedUser = localStorage.getItem('eto-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Simple frontend validation - in real app this would be API call
    if (email && password.length >= 6) {
      const newUser = { email };
      setUser(newUser);
      localStorage.setItem('eto-user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('eto-user');
    localStorage.removeItem('eto-wallet');
  };

  const updateWalletAddress = (address: string) => {
    if (user) {
      const updatedUser = { ...user, walletAddress: address };
      setUser(updatedUser);
      localStorage.setItem('eto-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      signIn,
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
