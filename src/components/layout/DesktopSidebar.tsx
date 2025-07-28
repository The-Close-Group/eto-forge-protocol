
import { NavLink, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Layers,
  Coins, 
  BarChart3, 
  Activity,
  Shield,
  Settings,
  LogOut,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Trade", url: "/trade", icon: TrendingUp },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Portfolio", url: "/portfolio", icon: User },
  { title: "Assets", url: "/assets", icon: Layers },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Markets", url: "/markets", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "System Health", url: "/system-health", icon: Shield },
];

export function DesktopSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { walletAddress } = useWallet();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Sidebar
      className={`hidden md:flex border-r border-border/50 ${isCollapsed ? "w-14" : "w-64"}`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className={`w-8 h-8 bg-primary rounded-md flex items-center justify-center ${isCollapsed ? "mx-auto" : ""}`}>
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-soft-foreground">ETO</h2>
              <p className="text-xs text-soft-muted">Trading Platform</p>
            </div>
          )}
        </Link>
      </div>

      <SidebarContent className="p-0">
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-400" />
              <span className="text-xs font-mono text-green-400">
                {truncateAddress(user.walletAddress)}
              </span>
            </div>
          </div>
        )}

        <SidebarGroup className={`${isCollapsed ? "px-2 py-4" : "p-4"}`}>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-soft-muted"}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkActive }) =>
                        `flex items-center ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2"} rounded-md transition-colors ${
                          isActive(item.url) || linkActive
                            ? "bg-primary text-primary-foreground"
                            : "text-soft-foreground hover:bg-accent hover:text-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className={`h-5 w-5 shrink-0 ${isCollapsed ? "" : ""}`} />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className={`mt-auto space-y-2 ${isCollapsed ? "p-2" : "p-4"}`}>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </Button>
          )}
          <SidebarTrigger className={`${isCollapsed ? "w-8 h-8 mx-auto flex" : "w-full"}`} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
