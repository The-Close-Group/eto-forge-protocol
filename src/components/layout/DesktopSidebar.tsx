import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Coins,
  Wallet,
  Database,
  Droplets,
  Trophy,
  MoreHorizontal,
  Bell,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { AceternitySidebar as Sidebar, SidebarBody, useSidebarAceternity } from "@/components/ui/sidebar-aceternity";

// Main navigation items
const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", url: "/trade", icon: Wallet },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Faucet", url: "/faucet", icon: Droplets },
  { title: "Data", url: "/system-health", icon: Database },
];

export function DesktopSidebar() {
  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContentInner />
      </SidebarBody>
    </Sidebar>
  );
}

function SidebarContentInner() {
  const location = useLocation();
  const { open } = useSidebarAceternity();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Section - Logo */}
      <div className="flex flex-col items-center py-4 border-b border-border/30">
        <Link to="/" className="flex items-center justify-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/eto-logo.svg" alt="ETO" className="w-8 h-8 object-contain" />
          </div>
        </Link>
      </div>

      {/* Add Button */}
      <div className="flex flex-col items-center py-4 border-b border-border/30">
        <Link
          to="/trade"
          className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col items-center py-4 gap-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center justify-center w-full py-2.5 px-1 gap-1 transition-all ${
              isActive(item.url)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`p-2 rounded-lg transition-all ${
              isActive(item.url) ? "bg-primary/10" : "hover:bg-muted/50"
            }`}>
              <item.icon className={`w-5 h-5 ${isActive(item.url) ? "text-primary" : ""}`} />
            </div>
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}

        {/* Points / Season 1 */}
        <NavLink
          to="/points"
          className={`flex flex-col items-center justify-center w-full py-2.5 px-1 gap-1 transition-all ${
            location.pathname === "/points"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all ${
            location.pathname === "/points" ? "bg-primary/10" : "hover:bg-muted/50"
          }`}>
            <Trophy className={`w-5 h-5 ${location.pathname === "/points" ? "text-primary" : ""}`} />
          </div>
          <span className="text-[10px] font-medium">Points</span>
        </NavLink>

        {/* More */}
        <button
          className="flex flex-col items-center justify-center w-full py-2.5 px-1 gap-1 text-muted-foreground hover:text-foreground transition-all"
        >
          <div className="p-2 rounded-lg hover:bg-muted/50 transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center py-4 gap-3 border-t border-border/30">
        {/* Notifications */}
        <button className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all">
          <div className="p-2 rounded-lg hover:bg-muted/50 transition-all">
            <Bell className="w-5 h-5" />
          </div>
        </button>

        {/* Account */}
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
              RC
            </div>
            {/* Status dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-sidebar" />
          </div>
          <span className="text-[10px] font-medium">Account</span>
        </Link>

        {/* Upgrade / Deposit */}
        <Link
          to="/staking"
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all group"
        >
          <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-primary/10 transition-all">
            <ArrowUpRight className="w-5 h-5 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-[10px] font-medium">Deposit</span>
        </Link>
      </div>
    </div>
  );
}
