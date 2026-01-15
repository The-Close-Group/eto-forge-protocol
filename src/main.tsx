
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'katex/dist/katex.min.css'
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { UserStateProvider } from "@/contexts/UserStateContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <AuthProvider>
          <UserStateProvider>
            <SecurityProvider>
              <PortfolioProvider>
                <OrderProvider>
                  <App />
                </OrderProvider>
              </PortfolioProvider>
            </SecurityProvider>
          </UserStateProvider>
        </AuthProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  </StrictMode>
);
