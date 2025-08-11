
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  walletAddress: string | null;
  id?: string;
  email?: string | null;
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
    let isMounted = true;

    const init = async () => {
      const [{ data: sessionData }, savedWallet] = await Promise.all([
        supabase.auth.getSession(),
        Promise.resolve(localStorage.getItem('eto-wallet')),
      ]);

      if (!isMounted) return;

      const session = sessionData?.session ?? null;
      const walletAddress = savedWallet ?? null;

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, walletAddress });
      } else if (walletAddress) {
        // Keep wallet address available for UX, but not considered authenticated
        setUser({ walletAddress });
      } else {
        setUser(null);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((prev) => {
        const wallet = prev?.walletAddress ?? localStorage.getItem('eto-wallet') ?? null;
        if (session?.user) return { id: session.user.id, email: session.user.email, walletAddress: wallet };
        // Signed out
        return wallet ? { walletAddress: wallet } : null;
      });
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
    localStorage.removeItem('eto-wallet');
    localStorage.removeItem('eto-wallet-type');
  }, []);

  const updateWalletAddress = useCallback((address: string) => {
    if (address) {
      localStorage.setItem('eto-wallet', address);
      setUser((prev) => ({ ...(prev ?? { walletAddress: null }), walletAddress: address }));
    } else {
      localStorage.removeItem('eto-wallet');
      setUser((prev) => (prev?.id || prev?.email ? { ...prev, walletAddress: null } : null));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user?.id, // Auth is true only when a Supabase session exists
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
