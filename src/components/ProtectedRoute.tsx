import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Allow all users to access the app without wallet connection
  // Individual pages will handle wallet requirements when needed
  return <>{children}</>;
}
