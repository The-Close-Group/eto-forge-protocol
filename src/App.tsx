
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TopLoadingBar from "@/components/TopLoadingBar";
import CommandPalette from "@/components/CommandPalette";
import { RouteTransition } from "@/components/RouteTransition";
// ThirdwebProvider is already set up in main.tsx


// Pages
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Trade from "@/pages/Trade";
import Bridge from "@/pages/Bridge";
import BuyMAANG from "@/pages/BuyMAANG";
import OrderPage from "@/pages/OrderPage";
import TransactionComplete from "@/pages/TransactionComplete";
// Removed: AssetDetails, Portfolio, Markets, Assets pages
import Staking from "@/pages/Staking";


import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/NotFound";
import Faucet from "@/pages/Faucet";
import SidebarDemoPage from "@/pages/SidebarDemoPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PortfolioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Global UX helpers */}
            <TopLoadingBar />
            <CommandPalette />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RouteTransition>
                        <Routes>
                          <Route path="/trade" element={<Trade />} />
                          <Route path="/bridge" element={<Bridge />} />
                          <Route path="/buy-maang" element={<BuyMAANG />} />
                          <Route path="/order" element={<OrderPage />} />
                          <Route path="/transaction-complete" element={<TransactionComplete />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          {/* Removed: /asset/:symbol, /portfolio, /markets, /assets routes */}
                          <Route path="/staking" element={<Staking />} />


                          <Route path="/system-health" element={<SystemHealth />} />
                          <Route path="/faucet" element={<Faucet />} />
                          <Route path="/sidebar-demo" element={<SidebarDemoPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </RouteTransition>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PortfolioProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
