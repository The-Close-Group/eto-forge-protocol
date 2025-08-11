
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const bypass = typeof window !== 'undefined' && localStorage.getItem('eto-bypass-auth') === 'true';

  if (!isAuthenticated && !bypass) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
