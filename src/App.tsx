
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { UserStateProvider } from "@/contexts/UserStateContext";
import { StakingProvider } from "@/contexts/StakingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TopLoadingBar from "@/components/TopLoadingBar";
import CommandPalette from "@/components/CommandPalette";
import { RouteTransition } from "@/components/RouteTransition";
// ThirdwebProvider is already set up in main.tsx


// Pages
import Pitch from "@/pages/Pitch";
import Landing from "@/pages/Landing";
import Docs from "@/pages/Docs";
import { Navigate } from "react-router-dom";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Trade from "@/pages/Trade";
// import Bridge from "@/pages/Bridge"; // Temporarily removed
import OrderPage from "@/pages/OrderPage";
import TransactionComplete from "@/pages/TransactionComplete";
// Removed: AssetDetails, Portfolio, Markets, Assets pages
import StakingPage from "@/pages/StakingPage";
// Removed: BuyMAANG, Shortcuts - moved to _scrap folder

import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/NotFound";
import Faucet from "@/pages/Faucet";
import Profile from "@/pages/Profile";
import PointsDashboard from "@/pages/PointsDashboard";
import Execution from "@/pages/Execution";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <UserStateProvider>
            <StakingProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              {/* Global UX helpers */}
              <TopLoadingBar />
              <CommandPalette />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/pitch" element={<Pitch />} />
                <Route path="/docs/*" element={<Docs />} />
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
                            <Route path="/execute/:assetId" element={<Execution />} />
                            {/* Removed: /bridge, /buy-maang, /shortcuts routes - moved to _scrap */}
                            <Route path="/order" element={<OrderPage />} />
                            <Route path="/transaction-complete" element={<TransactionComplete />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            {/* Removed: /asset/:symbol, /portfolio, /markets, /assets routes */}
                            <Route path="/staking" element={<StakingPage />} />

                            <Route path="/system-health" element={<SystemHealth />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/points" element={<PointsDashboard />} />
                            <Route path="/faucet" element={<Faucet />} />
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
            </StakingProvider>
          </UserStateProvider>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
