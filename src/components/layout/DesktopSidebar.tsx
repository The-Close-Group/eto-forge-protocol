
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
import { client, etoMainnet, supportedChains } from "@/lib/thirdweb";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

const navigationItems = [
  { title: "Trade", url: "/trade", icon: TrendingUp },
  // { title: "Bridge", url: "/bridge", icon: ArrowDownUp }, // Temporarily removed
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden mt-2"
        >
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={etoMainnet}
            chains={supportedChains}
            connectModal={{ size: "compact" }}
            connectButton={{
              style: {
                width: "100%",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: "500",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            }}
            detailsButton={{
              style: {
                width: "100%",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: "500",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                `flex items-center rounded-md relative overflow-hidden ` +
                `${open ? "px-3 py-2" : "px-0 py-2 justify-center"} ` +
                `${isActive(item.url) || linkActive ? "bg-primary text-primary-foreground" : "text-soft-foreground hover:bg-accent hover:text-accent-foreground"}`
              }
              style={{ transition: "padding 0.25s ease-in-out" }}
            >
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                <item.icon className="w-5 h-5" style={{ transform: "scale(1)", transition: "none" }} />
              </div>
              <motion.span
                initial={false}
                animate={{
                  width: animate ? (open ? "auto" : 0) : "auto",
                  marginLeft: animate ? (open ? 12 : 0) : 12,
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="font-medium whitespace-nowrap overflow-hidden"
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
          className={`w-full text-muted-foreground hover:text-foreground relative overflow-hidden ${open ? "px-3 py-2 justify-start" : "px-0 py-2 justify-center"}`}
          style={{ transition: "padding 0.25s ease-in-out" }}
        >
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <LogOut className="w-4 h-4" style={{ transform: "scale(1)", transition: "none" }} />
          </div>
          <motion.span
            initial={false}
            animate={{
              width: animate ? (open ? "auto" : 0) : "auto",
              marginLeft: animate ? (open ? 8 : 0) : 8,
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="whitespace-nowrap overflow-hidden"
          >
            Sign Out
          </motion.span>
        </Button>
      </div>
    </>
  );
}

