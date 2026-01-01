import React from 'react';
import { ShieldCheck, Layers, Network, Link } from 'lucide-react';

export const TrustSignals: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
             <ShieldCheck className="w-6 h-6" />
             <span className="font-bold text-lg">Octane</span>
          </div>
          <div className="flex items-center gap-2">
             <Layers className="w-6 h-6" />
             <span className="font-bold text-lg">Avalanche</span>
          </div>
          <div className="flex items-center gap-2">
             <Network className="w-6 h-6" />
             <span className="font-bold text-lg">BENQI</span>
          </div>
          <div className="flex items-center gap-2">
             <Link className="w-6 h-6" />
             <span className="font-bold text-lg">LayerZero</span>
          </div>
        </div>
      </div>
    </section>
  );
};