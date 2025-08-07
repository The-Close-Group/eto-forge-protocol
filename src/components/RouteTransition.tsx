import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface RouteTransitionProps {
  children: React.ReactNode;
}

// Simple CSS-driven enter animation wrapper for route content
export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-enter">
      {children}
    </div>
  );
}
