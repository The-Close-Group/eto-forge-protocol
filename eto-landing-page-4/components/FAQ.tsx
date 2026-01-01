import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const questions = [
  {
    q: "What is ETO Protocol?",
    a: "ETO is the world's first blockchain designed for real-world assets, delivering real-dollar settlement with sub-second finality and gas-free transfers."
  },
  {
    q: "Why use ETO instead of a traditional broker?",
    a: "Guaranteed 24/7 liquidity, no geographic restrictions, self-custody of assets, and composability with other DeFi applications."
  },
  {
    q: "How fast is settlement?",
    a: "Sub-second. We utilize a high-performance consensus mechanism that ensures your trades are final almost instantly."
  },
  {
    q: "Is it compatible with Ethereum?",
    a: "Yes, fully EVM compatible. You can use your existing wallets (MetaMask, etc.) and developer tools."
  },
  {
    q: "Who secures the network?",
    a: "A decentralized set of institutional validators including Octane, Coinbase Cloud, and Figment."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 text-stable-dark">Frequently<br/>Asked Questions</h2>
        
        <div className="flex gap-4 mb-12">
             <div className="px-4 py-1 rounded-full bg-stable-dark text-white text-sm">General</div>
             <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">Docs</div>
        </div>

        <div className="divide-y divide-gray-100">
          {questions.map((item, idx) => (
            <div key={idx} className="py-4">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left py-4 flex justify-between items-center focus:outline-none group"
              >
                <span className="text-sm font-semibold text-stable-dark group-hover:text-stable-primary transition-colors">
                  {item.q}
                </span>
                {openIndex === idx ? <ChevronUp className="w-4 h-4 text-stable-primary" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              {openIndex === idx && (
                <div className="pb-6 text-sm text-gray-500 leading-relaxed pr-8">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};