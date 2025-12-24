import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Coins,
  Wallet,
  Database,
  Droplets,
  Trophy,
  Bell,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

// Main navigation items
const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", url: "/trade", icon: Wallet },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Faucet", url: "/faucet", icon: Droplets },
  { title: "Data", url: "/system-health", icon: Database },
  { title: "Points", url: "/points", icon: Trophy },
];

export function DesktopSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[90px] flex-col bg-sidebar border-r border-sidebar-border z-50">
      {/* Logo */}
      <div className="flex justify-center py-6">
        <Link to="/" className="flex items-center justify-center">
          <img src="/eto-logo.svg" alt="ETO" className="w-9 h-9 object-contain" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center py-2 gap-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center justify-center w-full py-3 gap-1.5 transition-all ${
              isActive(item.url)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive(item.url) ? "text-primary" : ""}`} />
            <span className="text-[11px] font-medium">{item.title}</span>
          </NavLink>
        ))}

        {/* More */}
        <button className="flex flex-col items-center justify-center w-full py-3 gap-1.5 text-muted-foreground hover:text-foreground transition-all">
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-[11px] font-medium">More</span>
        </button>
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col items-center py-6 gap-5">
        {/* Notifications */}
        <button className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all">
          <Bell className="w-6 h-6" />
        </button>

        {/* Account */}
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1.5 transition-all"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-muted/50 border-2 border-primary/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                RC
              </div>
            </div>
            {/* Pro badge */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary text-primary-foreground">
              pro
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground mt-1">Account</span>
        </Link>

        {/* Upgrade/Deposit */}
        <Link
          to="/staking"
          className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Deposit</span>
        </Link>
      </div>
    </aside>
  );
}
