
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Coins,
  Shield,
  LogOut,
  Droplets,
  ArrowDownUp,
} from "lucide-react";
import { motion } from "motion/react";
import { AceternitySidebar as Sidebar, SidebarBody, useSidebarAceternity } from "@/components/ui/sidebar-aceternity";
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
  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-4">
        <SidebarContentInner />
      </SidebarBody>
    </Sidebar>
  );
}

function SidebarContentInner() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open, animate } = useSidebarAceternity();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top / Scrollable area */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/bro.svg" alt="ETO logo" className="w-8 h-8" />
          </div>
          <motion.div
            initial={false}
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="leading-tight"
          >
            <h2 className="font-semibold text-soft-foreground">ETO</h2>
            <p className="text-xs text-soft-muted">Trading Platform</p>
          </motion.div>
        </Link>

        {/* Wallet connect (hidden when collapsed) */}
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          className="overflow-hidden mt-2"
        >
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
        </motion.div>

        {/* Navigation */}
        <div className="mt-4 flex flex-col gap-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive: linkActive }) =>
                `flex items-center ${open ? "gap-3 px-3 py-2" : "justify-center px-2 py-3"} rounded-md transition-colors ` +
                `${isActive(item.url) || linkActive ? "bg-primary text-primary-foreground" : "text-soft-foreground hover:bg-accent hover:text-accent-foreground"}`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <motion.span
                initial={false}
                animate={{
                  display: animate ? (open ? "inline-block" : "none") : "inline-block",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="font-medium"
              >
                {item.title}
              </motion.span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={`w-full justify-start gap-2 text-muted-foreground hover:text-foreground ${open ? "" : "justify-center"}`}
        >
          <LogOut className="h-4 w-4" />
          <motion.span
            initial={false}
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
          >
            Sign Out
          </motion.span>
        </Button>
      </div>
    </>
  );
}

