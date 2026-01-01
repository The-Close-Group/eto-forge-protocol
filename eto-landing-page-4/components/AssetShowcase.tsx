import React from 'react';
import { Activity, Lock, Globe, Zap } from 'lucide-react';

export const AssetShowcase: React.FC = () => {
  return (
    <section id="products" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold text-stable-dark mb-6">
                500M+ investors rely on ETFs daily <br/>
                <span className="text-gray-400">yet the rails are still fragmented.</span>
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-stable-dark" />
            </div>
            <h3 className="text-xl font-bold text-stable-dark mb-3">Unpredictable Costs</h3>
            <p className="text-gray-600 leading-relaxed">
                Traditional brokerage fees and spread can eat up to 2% of your returns. ETO standardizes costs with zero-fee entry and transparent 0.3% swap fees.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-stable-dark" />
            </div>
            <h3 className="text-xl font-bold text-stable-dark mb-3">Enterprise Gaps</h3>
            <p className="text-gray-600 leading-relaxed">
                Slow, opaque, and hard-to-integrate infrastructure limits adoption. ETO provides composable ERC-20 tokens ready for any DeFi protocol.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-stable-dark" />
            </div>
            <h3 className="text-xl font-bold text-stable-dark mb-3">Excluded Users</h3>
            <p className="text-gray-600 leading-relaxed">
                High remittance costs and poor access keep millions out. We offer global, permissionless access to US-equities.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-stable-dark" />
            </div>
            <h3 className="text-xl font-bold text-stable-dark mb-3">Broken UX</h3>
            <p className="text-gray-600 leading-relaxed">
                Users juggle volatile tokens just to move digital dollars. ETO simplifies the experience with one-click investment and stable collateral.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};