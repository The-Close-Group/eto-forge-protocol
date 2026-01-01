import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-stable-dark rounded-lg flex items-center justify-center">
              <span className="font-sans font-bold text-white text-lg">E</span>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${isScrolled ? 'text-stable-dark' : 'text-stable-dark'}`}>
              ETO
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {['Indices', 'How it Works', 'Staking', 'Security'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                  className="text-sm font-medium text-gray-600 hover:text-stable-dark transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <button className="bg-stable-dark text-white hover:bg-stable-darker font-medium py-2 px-5 rounded-full text-sm transition-all flex items-center gap-2 shadow-sm">
              Launch App
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 p-2"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            {['Indices', 'How it Works', 'Staking', 'Security'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                className="block text-base font-medium text-gray-900 hover:text-stable-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="w-full mt-4 bg-stable-dark text-white font-medium py-3 rounded-lg">
              Launch App
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};