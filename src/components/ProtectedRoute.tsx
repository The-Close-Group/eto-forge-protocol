
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const account = useActiveAccount();
  const bypass = false; // Disabled bypass to prevent unauthorized access

  const hasWallet = Boolean(account?.address);

  if (!isAuthenticated && !hasWallet && !bypass) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
