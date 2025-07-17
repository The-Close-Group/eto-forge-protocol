import { TradingHeader } from "@/components/layout/TradingHeader";
import { MarketOverview } from "@/components/trading/MarketOverview";
import { PortfolioSummary } from "@/components/trading/PortfolioSummary";
import { TradingChart } from "@/components/trading/TradingChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { TradePanel } from "@/components/trading/TradePanel";

const TradingDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <TradingHeader />
      
      <div className="p-6 space-y-6">
        {/* Top row - Chart and Order Book */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <TradingChart />
          </div>
          <div className="col-span-4">
            <OrderBook />
          </div>
        </div>
        
        {/* Bottom row - Market Overview, Portfolio, and Trade Panel */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <MarketOverview />
          </div>
          <div className="col-span-4">
            <PortfolioSummary />
          </div>
          <div className="col-span-4">
            <TradePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;