
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Welcome() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Start fade-in animation
    setIsVisible(true);

    // Check authentication and redirect accordingly
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/trade");
      } else {
        navigate("/signin");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div
        className={`text-center transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
          Welcome to ETO
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Cross-chain trading powered by Layer Zero with Dynamic Market Making
        </p>
      </div>
    </div>
  );
}
