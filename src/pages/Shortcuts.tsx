import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fuel, Link2, Zap, Shield, Check, ArrowRight, 
  Wallet, ExternalLink, Copy, RefreshCw, Sparkles,
  Globe, Cpu, Network, ChevronRight, Clock
} from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { toast } from 'sonner';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

// Quick connector options
const connectors = [
  { 
    id: 'metamask', 
    name: 'MetaMask', 
    icon: '🦊', 
    status: 'popular',
    description: 'Browser extension wallet',
  },
  { 
    id: 'coinbase', 
    name: 'Coinbase Wallet', 
    icon: '🔵', 
    status: 'verified',
    description: 'Self-custody crypto wallet',
  },
  { 
    id: 'rainbow', 
    name: 'Rainbow', 
    icon: '🌈', 
    status: 'popular',
    description: 'Ethereum wallet for everyone',
  },
  { 
    id: 'phantom', 
    name: 'Phantom', 
    icon: '👻', 
    status: 'new',
    description: 'Multi-chain crypto wallet',
  },
  { 
    id: 'walletconnect', 
    name: 'WalletConnect', 
    icon: '🔗', 
    status: 'verified',
    description: 'Connect any mobile wallet',
  },
];

// NOTE: Gas stats are placeholder - real values should come from backend analytics
const gasStats = [
  { label: 'Txns Sponsored Today', value: '—', change: undefined },
  { label: 'Gas Saved (USD)', value: '$0', change: undefined },
  { label: 'Active Users', value: '—', change: undefined },
  { label: 'Avg Gas Price', value: '0.00 ETH', status: 'Free' },
];

export default function Shortcuts() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [gasPassEnabled, setGasPassEnabled] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto p-6">
        {/* Page Header */}
        <div 
          className={`mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Quick Actions & Utilities</span>
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-2">Shortcuts</h1>
          <p className="text-muted-foreground text-[15px]">
            Speed up your workflow with gas sponsorship and quick wallet connections
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div 
            className={`space-y-6 transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Gas Pass Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-primary" />
                    Gas Pass
                  </CardTitle>
                  <Badge variant="success" className="bg-data-positive/15 text-data-positive">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Gas Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {gasStats.map((stat, i) => (
                    <div 
                      key={stat.label} 
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-[11px] text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-xl font-semibold">{stat.value}</div>
                      {stat.change && (
                        <div className="text-[11px] text-data-positive flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3" />
                          {stat.change}
                        </div>
                      )}
                      {stat.status && (
                        <div className="text-[11px] text-primary font-medium mt-1">{stat.status}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Gas Pass Card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Fuel className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Free Gas on ETO</h3>
                      <p className="text-[13px] text-muted-foreground mb-4">
                        All transaction fees are sponsored by ETO Protocol. Trade, stake, and swap without paying gas fees.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-[12px]">
                          <Check className="w-4 h-4 text-data-positive" />
                          <span>Unlimited swaps</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px]">
                          <Check className="w-4 h-4 text-data-positive" />
                          <span>Free staking</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px]">
                          <Check className="w-4 h-4 text-data-positive" />
                          <span>No approvals needed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Chart */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-medium">Gas Savings (7D)</span>
                    <span className="text-[12px] text-muted-foreground">$0 saved</span>
                  </div>
                  <Sparkline data={generateSparklineData(30, 'up')} height={80} variant="positive" showArea={true} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Connectors Section */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" />
                    Quick Connectors
                  </CardTitle>
                  {account && (
                    <Badge variant="outline" className="text-data-positive border-data-positive/30">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {account ? (
                  <div className="space-y-4">
                    {/* Connected Wallet */}
                    <div className="p-4 rounded-xl bg-data-positive/5 border border-data-positive/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-data-positive/20 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-data-positive" />
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">Wallet Connected</div>
                            <div className="text-[12px] text-muted-foreground font-mono">
                              {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://eto.ash.center/address/${account.address}`, '_blank')}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[13px] text-muted-foreground">
                      Switch to a different wallet or connect additional wallets below:
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground mb-4">
                    Choose your preferred wallet to connect to ETO Protocol:
                  </p>
                )}

                {/* Wallet Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                        selectedConnector === connector.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedConnector(connector.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{connector.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[14px]">{connector.name}</span>
                            {connector.status === 'popular' && (
                              <Badge variant="outline" className="text-[9px] px-1.5">Popular</Badge>
                            )}
                            {connector.status === 'verified' && (
                              <Badge variant="outline" className="text-[9px] px-1.5 text-data-positive border-data-positive/30">
                                <Check className="w-2 h-2 mr-0.5" /> Verified
                              </Badge>
                            )}
                            {connector.status === 'new' && (
                              <Badge variant="outline" className="text-[9px] px-1.5 text-primary border-primary/30">New</Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{connector.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Connect Button */}
                <div className="mt-6">
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={etoMainnet}
                    chains={supportedChains}
                    connectModal={{ size: "compact" }}
                    connectButton={{
                      label: account ? "Switch Wallet" : "Connect Wallet",
                      style: {
                        width: "100%",
                        background: "hsl(160 70% 50%)",
                        color: "#000",
                        border: "none",
                        borderRadius: "12px",
                        padding: "14px",
                        fontSize: "14px",
                        fontWeight: "600",
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div 
            className={`space-y-5 transition-all duration-700 delay-200 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Gas Pass Status Card */}
            <div className="cta-card">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Gas Sponsorship</div>
                    <div className="text-[11px] text-data-positive">Unlimited • Active</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>Zero gas fees forever</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>All transactions covered</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>No daily limits</span>
                  </div>
                </div>

                <div className="text-[42px] font-semibold tracking-tight leading-none text-primary mb-2">
                  $0.00
                </div>
                <div className="text-[12px] text-muted-foreground">Gas fees per transaction</div>
              </div>
            </div>

            {/* Network Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-data-positive animate-pulse" />
                    <span className="text-[13px]">ETO L1</span>
                  </div>
                  <span className="text-[12px] text-data-positive">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Block Height</span>
                  <span className="text-[12px] font-mono">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Avg Block Time</span>
                  <span className="text-[12px] font-mono">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">TPS</span>
                  <span className="text-[12px] font-mono">—</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-9 px-3"
                  onClick={() => navigate('/buy-maang')}
                >
                  <span className="text-[13px]">Swap Tokens</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-9 px-3"
                  onClick={() => navigate('/staking')}
                >
                  <span className="text-[13px]">Stake Assets</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-9 px-3"
                  onClick={() => navigate('/faucet')}
                >
                  <span className="text-[13px]">Get Test Tokens</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-9 px-3"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="text-[13px]">View Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Gas Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* NOTE: Recent gas savings are placeholder - real data should come from on-chain events */}
                {([] as Array<{ action: string; saved: string; time: string }>).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                    <div>
                      <div className="text-[12px] font-medium">{item.action}</div>
                      <div className="text-[10px] text-muted-foreground">{item.time}</div>
                    </div>
                    <Badge variant="outline" className="text-data-positive border-data-positive/30 text-[10px]">
                      Saved {item.saved}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

