import React from 'react';
import { Twitter, Disc, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stable-dark text-white pt-24 pb-12 relative overflow-hidden">
        {/* Large stylized text background */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none opacity-5">
            <span className="text-[20vw] font-bold text-white whitespace-nowrap select-none">Stable</span>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="font-bold text-stable-dark text-xs">E</span>
                    </div>
                    <span className="font-bold text-lg">ETO</span>
                </div>
            </div>
            
            <div>
                <h4 className="font-bold text-sm mb-4">Home</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                    <li><a href="#" className="hover:text-white">What is ETO?</a></li>
                    <li><a href="#" className="hover:text-white">Before ETO</a></li>
                    <li><a href="#" className="hover:text-white">After ETO</a></li>
                    <li><a href="#" className="hover:text-white">Features</a></li>
                    <li><a href="#" className="hover:text-white">Roadmap</a></li>
                    <li><a href="#" className="hover:text-white">FAQ</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-sm mb-4">Company</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                    <li><a href="#" className="hover:text-white">Docs</a></li>
                    <li><a href="#" className="hover:text-white">Brand Assets</a></li>
                    <li><a href="#" className="hover:text-white">Contact</a></li>
                    <li><a href="#" className="hover:text-white">Twitter</a></li>
                    <li><a href="#" className="hover:text-white">Discord</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-sm mb-4">Resources</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                    <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex justify-between items-center text-xs text-gray-500">
            <div>© 2025 ETO Protocol</div>
            <div className="flex gap-4">
                 <Twitter className="w-4 h-4 hover:text-white cursor-pointer" />
                 <Disc className="w-4 h-4 hover:text-white cursor-pointer" />
                 <Github className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
        </div>
      </div>
    </footer>
  );
};