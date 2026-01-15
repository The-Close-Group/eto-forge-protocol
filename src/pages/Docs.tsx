import { Routes, Route } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { mdxComponents } from '@/components/docs/MDXComponents';
import { Suspense, lazy } from 'react';

// Lazy load MDX files
const DocsIndex = lazy(() => import('@docs/index.mdx'));

// Introduction
const WhatIsETO = lazy(() => import('@docs/introduction/what-is-eto.mdx'));
const WhatIsMANG = lazy(() => import('@docs/introduction/what-is-maang.mdx'));
const TrustAndSecurity = lazy(() => import('@docs/introduction/trust-and-security.mdx'));
const Background = lazy(() => import('@docs/introduction/background.mdx'));

// User Guide
const Buy = lazy(() => import('@docs/introduction/user-guide/buy.mdx'));
const Sell = lazy(() => import('@docs/introduction/user-guide/sell.mdx'));
const Stake = lazy(() => import('@docs/introduction/user-guide/stake.mdx'));

// Architecture
const ArchitectureOverview = lazy(() => import('@docs/architecture/overview.mdx'));
const DynamicMarketMaker = lazy(() => import('@docs/architecture/dynamic-market-maker.mdx'));
const PegStabilityModule = lazy(() => import('@docs/architecture/peg-stability-module.mdx'));
const OracleAggregation = lazy(() => import('@docs/architecture/oracle-aggregation.mdx'));
const CircuitBreakers = lazy(() => import('@docs/architecture/circuit-breakers.mdx'));
const ReflectivePriceIndex = lazy(() => import('@docs/architecture/reflective-price-index.mdx'));

// Tokenomics / Whitepaper
const TokenomicsOverview = lazy(() => import('@docs/tokenomics/overview.mdx'));
const MathematicalFramework = lazy(() => import('@docs/tokenomics/mathematical-framework.mdx'));
const SystemDynamics = lazy(() => import('@docs/tokenomics/system-dynamics.mdx'));
const CapitalEfficiency = lazy(() => import('@docs/tokenomics/capital-efficiency.mdx'));
const EconomicModel = lazy(() => import('@docs/tokenomics/economic-model.mdx'));
const GovernanceFramework = lazy(() => import('@docs/tokenomics/governance-framework.mdx'));
const BootstrapDeployment = lazy(() => import('@docs/tokenomics/bootstrap-deployment.mdx'));
const RiskAnalysis = lazy(() => import('@docs/tokenomics/risk-analysis.mdx'));
const StressTesting = lazy(() => import('@docs/tokenomics/stress-testing.mdx'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}

function DocPage({ Component }: { Component: React.LazyExoticComponent<any> }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MDXProvider components={mdxComponents}>
        <article className="prose prose-invert max-w-none">
          <Component />
        </article>
      </MDXProvider>
    </Suspense>
  );
}

export default function Docs() {
  return (
    <DocsLayout>
      <Routes>
        {/* Home */}
        <Route index element={<DocPage Component={DocsIndex} />} />

        {/* Introduction */}
        <Route path="introduction/what-is-eto" element={<DocPage Component={WhatIsETO} />} />
        <Route path="introduction/what-is-maang" element={<DocPage Component={WhatIsMANG} />} />
        <Route path="introduction/trust-and-security" element={<DocPage Component={TrustAndSecurity} />} />
        <Route path="introduction/background" element={<DocPage Component={Background} />} />

        {/* User Guide */}
        <Route path="introduction/user-guide/buy" element={<DocPage Component={Buy} />} />
        <Route path="introduction/user-guide/sell" element={<DocPage Component={Sell} />} />
        <Route path="introduction/user-guide/stake" element={<DocPage Component={Stake} />} />

        {/* Architecture */}
        <Route path="architecture/overview" element={<DocPage Component={ArchitectureOverview} />} />
        <Route path="architecture/dynamic-market-maker" element={<DocPage Component={DynamicMarketMaker} />} />
        <Route path="architecture/peg-stability-module" element={<DocPage Component={PegStabilityModule} />} />
        <Route path="architecture/oracle-aggregation" element={<DocPage Component={OracleAggregation} />} />
        <Route path="architecture/circuit-breakers" element={<DocPage Component={CircuitBreakers} />} />
        <Route path="architecture/reflective-price-index" element={<DocPage Component={ReflectivePriceIndex} />} />

        {/* Tokenomics / Whitepaper */}
        <Route path="tokenomics/overview" element={<DocPage Component={TokenomicsOverview} />} />
        <Route path="tokenomics/mathematical-framework" element={<DocPage Component={MathematicalFramework} />} />
        <Route path="tokenomics/system-dynamics" element={<DocPage Component={SystemDynamics} />} />
        <Route path="tokenomics/capital-efficiency" element={<DocPage Component={CapitalEfficiency} />} />
        <Route path="tokenomics/economic-model" element={<DocPage Component={EconomicModel} />} />
        <Route path="tokenomics/governance-framework" element={<DocPage Component={GovernanceFramework} />} />
        <Route path="tokenomics/bootstrap-deployment" element={<DocPage Component={BootstrapDeployment} />} />
        <Route path="tokenomics/risk-analysis" element={<DocPage Component={RiskAnalysis} />} />
        <Route path="tokenomics/stress-testing" element={<DocPage Component={StressTesting} />} />

        {/* Fallback */}
        <Route path="*" element={<DocPage Component={DocsIndex} />} />
      </Routes>
    </DocsLayout>
  );
}
