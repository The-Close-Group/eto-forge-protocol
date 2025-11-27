
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Layers,
  Coins, 
  BarChart3, 
  Activity,
  ArrowDownUp
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trade", url: "/trade", icon: TrendingUp },
  // { title: "Bridge", url: "/bridge", icon: ArrowDownUp }, // Temporarily removed
  { title: "Staking", url: "/staking", icon: Coins },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 z-50 pb-[env(safe-area-inset-bottom)] h-16">
      <nav className="max-w-7xl mx-auto h-full flex justify-around items-center px-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 ${
              isActive(item.url)
                ? "bg-primary text-primary-foreground"
                : "text-soft-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
