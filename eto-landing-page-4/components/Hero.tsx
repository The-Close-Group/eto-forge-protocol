import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative pt-32 pb-24 overflow-hidden bg-stable-light/50">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.4] pointer-events-none"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-stable-primary"></span>
          <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Protocol V1 Live</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-stable-dark max-w-4xl mx-auto leading-[1.1]">
          Institutional Grade <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-stable-dark to-stable-primary">
             Real-World Assets
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
          The infrastructure for on-chain capital markets. Get exposure to Nvidia, Microsoft, and Google with instant settlement and 24/7 liquidity.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-stable-dark hover:bg-stable-darker text-white font-semibold text-base py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-stable-dark/20">
            Start Investing
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="bg-white hover:bg-gray-50 text-stable-dark border border-gray-200 font-semibold text-base py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-sm">
            Read the Docs
          </button>
        </div>

        {/* Hero Graphic Placeholder - Abstract Geometric */}
        <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="aspect-[21/9] bg-gradient-to-tr from-stable-dark to-emerald-900 rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-20"></div>
                
                {/* Abstract visualization elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stable-primary/20 rounded-full blur-3xl"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-stable-primary/30 rounded-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-stable-primary rounded-full flex items-center justify-center shadow-lg shadow-stable-primary/50">
                            <span className="text-4xl font-bold text-white">E</span>
                        </div>
                    </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-10 left-10 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                    <div className="text-xs text-emerald-200 font-mono">NVDA</div>
                    <div className="text-xl font-bold text-white font-mono">$146.82</div>
                </div>
                <div className="absolute bottom-10 right-10 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                    <div className="text-xs text-emerald-200 font-mono">APY</div>
                    <div className="text-xl font-bold text-stable-primary font-mono">15.2%</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};