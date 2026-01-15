import { useState, useEffect } from 'react';
import { MAANGPriceChart } from '@/components/charts/MAANGPriceChart';
import { TradingPanel } from '@/components/TradingPanel';

export default function BuyMAANG() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
          {/* Chart Section - Left */}
          <div
            className={`flex-1 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="h-full rounded-2xl border border-white/10 bg-[#0a1628] overflow-hidden">
              <MAANGPriceChart className="h-full min-h-[500px] lg:min-h-full" />
            </div>
          </div>

          {/* Trading Panel - Right */}
          <div
            className={`w-full lg:w-[380px] flex-shrink-0 transition-all duration-700 delay-150 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="h-full rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm p-5">
              <TradingPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
