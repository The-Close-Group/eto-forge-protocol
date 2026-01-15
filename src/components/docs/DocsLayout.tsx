import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, Menu, X, BookOpen, Layers, Coins, Home } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Introduction',
    href: '/docs',
    icon: <Home className="w-4 h-4" />,
    children: [
      { title: 'What is ETO?', href: '/docs/introduction/what-is-eto' },
      { title: 'What is MAANG?', href: '/docs/introduction/what-is-maang' },
      { title: 'Trust & Security', href: '/docs/introduction/trust-and-security' },
      { title: 'Background', href: '/docs/introduction/background' },
    ],
  },
  {
    title: 'User Guide',
    href: '/docs/introduction/user-guide/buy',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { title: 'Buy MAANG', href: '/docs/introduction/user-guide/buy' },
      { title: 'Sell MAANG', href: '/docs/introduction/user-guide/sell' },
      { title: 'Stake & Earn', href: '/docs/introduction/user-guide/stake' },
    ],
  },
  {
    title: 'Architecture',
    href: '/docs/architecture/overview',
    icon: <Layers className="w-4 h-4" />,
    children: [
      { title: 'Overview', href: '/docs/architecture/overview' },
      { title: 'Dynamic Market Maker', href: '/docs/architecture/dynamic-market-maker' },
      { title: 'Peg Stability Module', href: '/docs/architecture/peg-stability-module' },
      { title: 'Oracle Aggregation', href: '/docs/architecture/oracle-aggregation' },
      { title: 'Circuit Breakers', href: '/docs/architecture/circuit-breakers' },
      { title: 'Reflective Price Index', href: '/docs/architecture/reflective-price-index' },
    ],
  },
  {
    title: 'Whitepaper',
    href: '/docs/tokenomics/overview',
    icon: <Coins className="w-4 h-4" />,
    children: [
      { title: 'Overview', href: '/docs/tokenomics/overview' },
      { title: 'Mathematical Framework', href: '/docs/tokenomics/mathematical-framework' },
      { title: 'System Dynamics', href: '/docs/tokenomics/system-dynamics' },
      { title: 'Capital Efficiency', href: '/docs/tokenomics/capital-efficiency' },
      { title: 'Economic Model', href: '/docs/tokenomics/economic-model' },
      { title: 'Governance Framework', href: '/docs/tokenomics/governance-framework' },
      { title: 'Bootstrap & Deployment', href: '/docs/tokenomics/bootstrap-deployment' },
      { title: 'Risk Analysis', href: '/docs/tokenomics/risk-analysis' },
      { title: 'Stress Testing', href: '/docs/tokenomics/stress-testing' },
    ],
  },
];

function NavSection({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => location.pathname === child.href) || isActive
  );

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
        )}
      >
        {item.icon}
        {item.title}
      </button>
      {isOpen && item.children && (
        <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              className={cn(
                'block px-3 py-1.5 text-sm rounded transition-colors',
                location.pathname === child.href
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to ETO</span>
            </Link>
          </div>
          <Link to="/docs" className="text-white font-semibold">
            ETO Documentation
          </Link>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 overflow-y-auto transition-transform z-40',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="p-4">
          {navigation.map((item) => (
            <NavSection
              key={item.href}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
