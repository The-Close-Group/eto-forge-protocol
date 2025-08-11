import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface RouteTransitionProps {
  children: React.ReactNode;
}

// Enhanced route transition with enter + exit animations and reduced-motion safety
export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const [displayed, setDisplayed] = useState<{ key: string; node: React.ReactNode }>({
    key: location.pathname,
    node: children,
  });
  const [exiting, setExiting] = useState<React.ReactNode | null>(null);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll to top on route change for better UX
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });

    // If path changed, animate previous out
    if (location.pathname !== displayed.key) {
      setExiting(displayed.node);
      setDisplayed({ key: location.pathname, node: children });

      if (exitTimer.current) window.clearTimeout(exitTimer.current);
      exitTimer.current = window.setTimeout(() => {
        setExiting(null);
      }, prefersReduced ? 0 : 280);
    } else {
      // same key, just update children
      setDisplayed((d) => ({ ...d, node: children }));
    }

    return () => {
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, children]);

  return (
    <div className="relative">
      {exiting && (
        <div className="animate-exit absolute inset-0 will-change-[opacity,transform]">
          {exiting}
        </div>
      )}
      <div key={displayed.key} className="animate-enter will-change-[opacity,transform]">
        {displayed.node}
      </div>
    </div>
  );
}
