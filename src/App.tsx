
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
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdweb";


// Pages
import Welcome from "@/pages/Welcome";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Trade from "@/pages/Trade";
import OrderPage from "@/pages/OrderPage";
import TransactionComplete from "@/pages/TransactionComplete";
import AssetDetails from "@/pages/AssetDetails";
import Portfolio from "@/pages/Portfolio";
import Markets from "@/pages/Markets";
import Assets from "@/pages/Assets";
import Staking from "@/pages/Staking";
import Analytics from "@/pages/Analytics";
import Wallet from "@/pages/Wallet";
import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/NotFound";
import Faucet from "@/pages/Faucet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThirdwebProvider client={client}>
        <PortfolioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/* Global UX helpers */}
              <TopLoadingBar />
              <CommandPalette />
              <Routes>
                <Route path="/" element={<Welcome />} />
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
                            <Route path="/order" element={<OrderPage />} />
                            <Route path="/transaction-complete" element={<TransactionComplete />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/asset/:symbol" element={<AssetDetails />} />
                            <Route path="/portfolio" element={<Portfolio />} />
                            <Route path="/markets" element={<Markets />} />
                            <Route path="/assets" element={<Assets />} />
                            <Route path="/staking" element={<Staking />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/system-health" element={<SystemHealth />} />
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
        </PortfolioProvider>
      </ThirdwebProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
