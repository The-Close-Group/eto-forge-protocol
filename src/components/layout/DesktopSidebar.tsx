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
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[200px] flex-col bg-sidebar border-r border-sidebar-border z-50">
      {/* Logo */}
      <div className="p-5 border-b border-border/30">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/eto-logo.svg" alt="ETO" className="w-7 h-7 object-contain" />
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[15px]">ETO Protocol</span>
            <span className="text-[9px] text-muted-foreground align-super">®</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive(item.url)
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${
              isActive(item.url) ? "text-primary" : ""
            }`} />
            <span className="text-[13px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-1 border-t border-border/30">
        {/* Notifications */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <Bell className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="text-[13px] font-medium">Notifications</span>
        </button>

        {/* Account */}
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            location.pathname === "/profile"
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[9px] font-semibold text-primary-foreground">
              RC
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary border border-sidebar" />
          </div>
          <span className="text-[13px] font-medium">Account</span>
        </Link>

        {/* Deposit */}
        <Link
          to="/staking"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          <ArrowUpRight className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="text-[13px] font-medium">Deposit</span>
        </Link>
      </div>
    </aside>
  );
}
