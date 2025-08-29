import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// A lightweight top progress bar that reacts to route changes
export default function TopLoadingBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // start
    setVisible(true);
    setProgress(15);

    const t1 = setTimeout(() => setProgress(55), 120);
    const t2 = setTimeout(() => setProgress(85), 240);
    const t3 = setTimeout(() => {
      setProgress(100);
      // hide after complete
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <div
        className="h-0.5 bg-primary transition-[width] duration-300 shadow-sm"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
    </div>
  );
}
