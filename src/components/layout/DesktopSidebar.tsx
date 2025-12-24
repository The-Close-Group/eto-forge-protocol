import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Coins, // Used in protocolNavItems
  Wallet,
  Database,
  ExternalLink,
  Droplets,
  Trophy,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { AceternitySidebar as Sidebar, SidebarBody, useSidebarAceternity } from "@/components/ui/sidebar-aceternity";

// Protocol navigation items
const protocolNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", url: "/trade", icon: Wallet },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Faucet", url: "/faucet", icon: Droplets },
  { title: "Data API", url: "/system-health", icon: Database, external: true },
];

export function DesktopSidebar() {
  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-2 bg-sidebar border-r border-sidebar-border">
        <SidebarContentInner />
      </SidebarBody>
    </Sidebar>
  );
}

function SidebarContentInner() {
  const location = useLocation();
  const { open, animate } = useSidebarAceternity();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Section */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Brand */}
        <Link 
          to="/" 
          className={`flex items-center py-3 mb-2 ${open ? 'px-3 gap-2.5' : 'justify-center px-0'}`}
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <img src="/eto-logo.svg" alt="ETO logo" className="w-7 h-7 rounded object-contain" />
          </div>
          <motion.div
            initial={false}
            animate={{
              display: animate ? (open ? "flex" : "none") : "flex",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex items-center gap-1.5"
          >
            <span className="font-semibold text-[15px]">ETO Protocol</span>
            <span className="text-[9px] text-muted-foreground align-super">®</span>
          </motion.div>
        </Link>

        {/* Navigation */}
        <div className="flex flex-col gap-0.5 px-2">
          {protocolNavItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive: linkActive }) =>
                `nav-item ` +
                `${open ? "px-3 gap-3" : "px-0 justify-center"} ` +
                `${isActive(item.url) || linkActive ? "nav-item-active" : ""}`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <motion.div
                initial={false}
                animate={{
                  display: animate ? (open ? "flex" : "none") : "flex",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-2 flex-1"
              >
                <span className="text-[13px] font-medium">{item.title}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-data-positive/15 text-data-positive font-medium">
                    {item.badge}
                  </span>
                )}
                {item.external && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                )}
              </motion.div>
            </NavLink>
          ))}
        </div>

        {/* Season 1 Section */}
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden mt-5 px-2"
        >
          <div className="flex items-center gap-2 px-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground">Season 1</span>
          </div>
          
          <NavLink
            to="/points"
            className={({ isActive: linkActive }) =>
              `nav-item ` +
              `${open ? "px-3 gap-3" : "px-0 justify-center"} ` +
              `${linkActive ? "nav-item-active" : ""}`
            }
          >
            <Trophy className="w-[18px] h-[18px] shrink-0 text-primary" />
            <motion.div
              initial={false}
              animate={{
                display: animate ? (open ? "flex" : "none") : "flex",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center gap-2 flex-1"
            >
              <span className="text-[13px] font-medium">Points Dashboard</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/15 text-primary font-medium">
                New
              </span>
            </motion.div>
          </NavLink>
        </motion.div>
      </div>
    </>
  );
}
