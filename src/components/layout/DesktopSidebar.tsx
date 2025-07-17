import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Coins, 
  BarChart3, 
  Activity,
  Settings
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trade", url: "/trade", icon: TrendingUp },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Markets", url: "/markets", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: Activity },
];

export function DesktopSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      className={`hidden md:flex border-r border-border/50 ${isCollapsed ? "w-14" : "w-64"}`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-foreground">ETO</h2>
              <p className="text-xs text-muted-foreground">Trading Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="p-0">
        <SidebarGroup className="p-4">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
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
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.url) || linkActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}