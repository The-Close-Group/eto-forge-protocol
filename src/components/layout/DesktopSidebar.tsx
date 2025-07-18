import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Layers,
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
  { title: "Assets", url: "/assets", icon: Layers },
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
      className={`hidden md:flex border-r border-border/50 ${isCollapsed ? "w-20" : "w-80"}`}
      collapsible="icon"
    >
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-foreground text-xl">ETO</h2>
              <p className="text-base text-muted-foreground">Trading Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="p-0">
        <SidebarGroup className="p-6">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-lg font-medium mb-4"}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                          isActive(item.url) || linkActive
                            ? "bg-primary text-primary-foreground shadow-lg border border-border"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {!isCollapsed && <span className="font-medium text-lg">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-6">
          <SidebarTrigger className="w-full h-12 text-lg hover:scale-105 transition-transform" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}