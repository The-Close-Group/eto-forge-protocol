import React from 'react';

export const Calculator: React.FC = () => {
  return (
    <section id="roadmap" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-stable-dark mb-4">Roadmap</h2>
        <p className="text-gray-600 mb-12">From launch to scale. ETO's roadmap to becoming the settlement layer for global finance.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Phase 1 */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-between h-80">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-stable-primary uppercase">Phase 1</span>
                    <span className="text-xs text-gray-400">• Now</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stable-dark mb-3">Bring Assets Onchain</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Deploy the world's first native asset blockchain infrastructure. Stable goes live with real throughput and real utility.
                    </p>
                </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-between h-80">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Phase 2</span>
                    <span className="text-xs text-gray-400">Q4 2025</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stable-dark mb-3">Scale Throughput & Execution</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Introduce optimistic parallel execution and StableDB to scale throughput, while preserving sub-second settlement.
                    </p>
                </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-between h-80">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Phase 3</span>
                    <span className="text-xs text-gray-400">Q2 2026</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stable-dark mb-3">Power the Future of Finance</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Accelerate throughput towards 10,000+ TPS with reliability by adopting DAG-based consensus, setting the foundation for future scale.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};