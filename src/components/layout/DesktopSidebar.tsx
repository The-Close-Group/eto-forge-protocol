
import { NavLink, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Layers,
  Coins, 
  BarChart3, 
  Shield,
  Settings,
  LogOut,
  User,
  Droplets,
  ArrowDownUp
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
import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, etoTestnet } from "@/lib/thirdweb";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

const navigationItems = [
  { title: "Trade", url: "/trade", icon: TrendingUp },
  { title: "Bridge", url: "/bridge", icon: ArrowDownUp },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "System Health", url: "/system-health", icon: Shield },
  { title: "Faucet", url: "/faucet", icon: Droplets },
];

export function DesktopSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      className={`hidden md:flex border-r border-border/50 ${isCollapsed ? "w-14" : "w-64"}`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className={`w-8 h-8 flex items-center justify-center ${isCollapsed ? "mx-auto" : ""}`}>
            <img src="/bro.svg" alt="ETO" className="w-8 h-8" />
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
        {/* Wallet Connection */}
        {!isCollapsed && (
          <div className="p-4 border-b border-border/50">
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={etoTestnet}
              connectModal={{ size: "compact" }}
              connectButton={{
                style: {
                  width: "100%",
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: "500",
                },
              }}
              detailsButton={{
                style: {
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                },
              }}
            />
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
