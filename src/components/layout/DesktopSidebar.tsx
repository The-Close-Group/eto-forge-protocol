import { NavLink, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Coins,
  LogOut,
  Wallet,
  Database,
  ExternalLink,
  ChevronDown,
  Zap,
  Fuel,
  Link2,
  ArrowDownUp,
  Droplets,
  Trophy,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { AceternitySidebar as Sidebar, SidebarBody, useSidebarAceternity } from "@/components/ui/sidebar-aceternity";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useStakingContext } from "@/contexts/StakingContext";

// Protocol navigation (when Protocol tab is active)
const protocolNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", url: "/trade", icon: Wallet },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Data API", url: "/system-health", icon: Database, external: true },
];

// Shortcuts navigation (when Shortcuts tab is active)
const shortcutsNavItems = [
  { title: "Quick Swap", url: "/buy-maang", icon: ArrowDownUp },
  { title: "Gas Pass", url: "/shortcuts", icon: Fuel, badge: "Free" },
  { title: "Quick Connectors", url: "/shortcuts", icon: Link2 },
  { title: "Faucet", url: "/faucet", icon: Droplets },
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
  const { signOut } = useAuth();
  const { open, animate } = useSidebarAceternity();
  const { positions, assets, getTotalStaked, getTotalRewards } = useStakingContext();
  const [activeTab, setActiveTab] = useState<'protocol' | 'shortcuts'>('protocol');

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  // Get position display data
  const activePositions = positions.map(pos => {
    const asset = assets.find(a => a.id === pos.assetId);
    return {
      name: asset?.name || 'Unknown',
      amount: `$${pos.amount.toLocaleString()}`,
      logo: asset?.logo || '',
      color: asset?.color || '#888',
      rewards: pos.earnedRewards,
    };
  });

  const navigationItems = activeTab === 'protocol' ? protocolNavItems : shortcutsNavItems;

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
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </motion.div>
        </Link>

        {/* Subtitle */}
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden px-3 mb-3"
        >
          <span className="text-[11px] text-muted-foreground">
            {activeTab === 'protocol' ? 'Core Protocol Features' : 'Quick Actions & Tools'}
          </span>
        </motion.div>

        {/* Tab Switcher - Protocol / Shortcuts */}
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden px-3 mb-4"
        >
          <div className="tab-list-custom">
            <button 
              className={`tab-trigger-custom flex-1 ${activeTab === 'protocol' ? 'tab-trigger-custom-active' : ''}`}
              onClick={() => setActiveTab('protocol')}
            >
              Protocol
            </button>
            <button 
              className={`tab-trigger-custom flex-1 ${activeTab === 'shortcuts' ? 'tab-trigger-custom-active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              Shortcuts
            </button>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col gap-0.5 px-2">
          {navigationItems.map((item) => (
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

        {/* Active Staking Section - Only show on Protocol tab */}
        {activeTab === 'protocol' && (
          <motion.div
            initial={false}
            animate={{
              height: open ? "auto" : 0,
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-5 px-2"
          >
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-muted-foreground" />
                <span className="text-[12px] font-medium text-muted-foreground">Active Staking</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium">{positions.length}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-0.5">
              {activePositions.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">No active positions</p>
                  <Link to="/dashboard" className="text-[11px] text-primary hover:underline">
                    Start staking →
                  </Link>
                </div>
              ) : (
                activePositions.map((position, index) => (
                  <Link
                    key={index}
                    to="/staking"
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                  >
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center p-1"
                      style={{ background: `${position.color}15` }}
                    >
                      <img src={position.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-muted-foreground">Asset {position.name}</div>
                      <div className="text-[13px] font-medium">Amount {position.amount}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            {/* Total staked summary */}
            {activePositions.length > 0 && (
              <div className="mt-2 px-2 py-2 rounded-lg bg-sidebar-accent/50">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Total Staked</span>
                  <span className="font-medium">${getTotalStaked().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-1">
                  <span className="text-muted-foreground">Total Rewards</span>
                  <span className="font-medium text-primary">+{getTotalRewards().toFixed(4)}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Shortcuts Section - Only show on Shortcuts tab */}
        {activeTab === 'shortcuts' && (
          <motion.div
            initial={false}
            animate={{
              height: open ? "auto" : 0,
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-5 px-2"
          >
            <div className="px-2 py-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="w-4 h-4 text-primary" />
                <span className="text-[12px] font-medium">Gas Pass Active</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                All transaction fees are sponsored by ETO Protocol
              </p>
            </div>
          </motion.div>
        )}

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

      {/* Bottom Section */}
      <div className="px-2 pb-3 space-y-2">
        {/* Activate Super */}
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/10">
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-[13px] font-medium">Activate Super</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Unlock all features on ETO
            </p>
          </div>
        </motion.div>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={`w-full text-sidebar-muted hover:text-foreground hover:bg-sidebar-accent ${
            open ? "px-3 py-2 justify-start gap-3" : "px-0 py-2 justify-center"
          }`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <motion.span
            initial={false}
            animate={{
              display: animate ? (open ? "inline" : "none") : "inline",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-[13px] font-medium"
          >
            Sign Out
          </motion.span>
        </Button>
      </div>
    </>
  );
}
