
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import Welcome from "./pages/Welcome";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Portfolio from "./pages/Portfolio";
import Assets from "./pages/Assets";
import Staking from "./pages/Staking";
import Markets from "./pages/Markets";
import Analytics from "./pages/Analytics";
import SystemHealth from "./pages/SystemHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/trade" element={
              <ProtectedRoute>
                <AppLayout>
                  <Trade />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <AppLayout>
                  <Portfolio />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/assets" element={
              <ProtectedRoute>
                <AppLayout>
                  <Assets />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/staking" element={
              <ProtectedRoute>
                <AppLayout>
                  <Staking />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/markets" element={
              <ProtectedRoute>
                <AppLayout>
                  <Markets />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/system-health" element={
              <ProtectedRoute>
                <AppLayout>
                  <SystemHealth />
                </AppLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
