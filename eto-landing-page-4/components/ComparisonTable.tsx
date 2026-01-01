import React from 'react';
import { Check, ArrowUpRight } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  return (
    <section className="py-24 bg-stable-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-10 pointer-events-none"></div>
      
      {/* Radial Gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stable-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Rails for the <span className="text-stable-primary">Real World</span>
            </h2>
            <div className="flex gap-4">
                <div className="px-4 py-1 rounded-full border border-white/20 text-white text-sm bg-white/5">Protocol V1</div>
                <div className="px-4 py-1 rounded-full border border-white/20 text-white text-sm bg-white/5">Documentation</div>
            </div>
        </div>

        {/* Feature Grid - Dark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gasless by Design</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Fees in tokens, with free peer transfers and no surprises. We abstract the complexity of gas.
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <ArrowUpRight className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enterprise Ready</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Fast, compliant, and easy to integrate at global scale. Built for high-volume institutions.
                </p>
            </div>

            {/* Card 3 */}
            <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Native Settlement</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Use USDC to pay transaction fees and avoid fee rate volatility. Seamless integration.
                </p>
            </div>

             {/* Card 4 */}
             <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Seamless UX</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    One wallet, one currency, sub-second finality. Making digital dollars feel instant.
                </p>
            </div>

            {/* Card 5 */}
            <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">EVM Compatible</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Build in the most robust environment and leverage powerful smart contracts.
                </p>
            </div>

            {/* Card 6 */}
            <div className="bg-stable-darker/50 border border-white/10 rounded-2xl p-8 hover:bg-stable-darker transition-colors group">
                <div className="mb-4 text-stable-primary">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Throughput That Scales</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Processes high-frequency transactions with consistent speed and reliability.
                </p>
            </div>

        </div>

        {/* Big Feature Block (Split View) */}
        <div className="mt-20">
            <h2 className="text-4xl font-bold text-white mb-8">Built for Institutions,<br/>Developers, and Users</h2>
            
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 bg-gray-200 min-h-[300px] relative">
                     {/* Placeholder Image feeling */}
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400">
                         {/* Abstract buildings */}
                         <div className="absolute bottom-0 left-10 w-20 h-40 bg-gray-500 opacity-20"></div>
                         <div className="absolute bottom-0 left-36 w-24 h-64 bg-gray-600 opacity-20"></div>
                         <div className="absolute bottom-0 right-20 w-32 h-52 bg-gray-500 opacity-20"></div>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
                         Infrastructure Visualization
                     </div>
                </div>
                
                <div className="flex-1 p-12 bg-gray-50">
                    <h3 className="text-2xl font-bold text-stable-dark mb-4">Institutions & Enterprises</h3>
                    <p className="text-gray-600 mb-8">
                        Built to meet the performance, compliance, and reliability standards of the world's largest financial players.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <div className="font-bold text-stable-dark text-sm">Dedicated Blockspace</div>
                            <div className="text-gray-500 text-xs mt-1">Guaranteed throughput and reserved capacity for mission-critical operations.</div>
                        </div>
                        <div className="w-full h-px bg-gray-200"></div>
                        <div>
                            <div className="font-bold text-stable-dark text-sm">10,000+ TPS Throughput</div>
                            <div className="text-gray-500 text-xs mt-1">Built to handle real-world financial volume with unmatched scalability.</div>
                        </div>
                        <div className="w-full h-px bg-gray-200"></div>
                         <div>
                            <div className="font-bold text-stable-dark text-sm">Confidential Transfers</div>
                            <div className="text-gray-500 text-xs mt-1">Advanced privacy tools tailored for institutional needs.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};