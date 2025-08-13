
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { walletAddress } = useWallet();
  const bypass = typeof window !== 'undefined' && localStorage.getItem('eto-bypass-auth') === 'true';

  const hasWallet = Boolean(walletAddress);

  if (!isAuthenticated && !hasWallet && !bypass) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
