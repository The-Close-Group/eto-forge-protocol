import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AssetShowcase } from './components/AssetShowcase';
import { TrustSignals } from './components/TrustSignals';
import { ComparisonTable } from './components/ComparisonTable';
import { Calculator } from './components/Calculator';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stable-primary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <TrustSignals />
        <AssetShowcase />
        <ComparisonTable />
        <Calculator />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;