import { useState, useEffect } from 'react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, Shield, Vault, Info, 
  ChevronRight, Zap, Clock,
  Sparkles, Wallet, Check, AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { DRI_TOKEN_ADDRESS, USDC_ADDRESS } from '@/config/contracts';
import { useProtocolStore, selectPrices } from '@/stores/protocolStore';
import { Badge } from '@/components/ui/badge';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { Link } from 'react-router-dom';
import maangLogo from '@/assets/maang-logo.svg';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export default function StakingPage() {
  const account = useActiveAccount();
  
  // Get real MAANG price from protocol store
  const prices = useProtocolStore(selectPrices);
  const maangPrice = prices.dmmPrice || 318;
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch balances
  const { data: balances } = useQuery({
    queryKey: ['staking-balances', account?.address],
    queryFn: async () => {
      if (!account?.address) return { dri: 0n, usdc: 0n };
      
      const [dri, usdc] = await Promise.all([
        etoPublicClient.readContract({
          address: DRI_TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
        etoPublicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
        }),
      ]);
      
      return { dri, usdc };
    },
    enabled: !!account?.address,
    refetchInterval: 10000,
  });

  const driBalance = balances ? (Number(balances.dri) / 1e18).toFixed(4) : '0';
  const usdcBalance = balances ? (Number(balances.usdc) / 1e6).toFixed(2) : '0';
  const portfolioValue = balances 
    ? (Number(balances.dri) / 1e18) * maangPrice + (Number(balances.usdc) / 1e6)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Page Header */}
        <div 
          className={`mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
            <Vault className="w-4 h-4" />
            <span>sMAANG Vault • Liquid Staking</span>
            <Badge variant="outline" className="ml-2 text-[10px] border-yellow-500/50 text-yellow-500">Upgrading</Badge>
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-2">Staking</h1>
          <p className="text-muted-foreground text-[15px]">
            Earn yield from protocol trading fees
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div 
            className={`space-y-6 transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Vault Upgrade Notice */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Vault Upgrade in Progress</h3>
                    <p className="text-muted-foreground mb-4">
                      The sMAANG Vault is being upgraded to support the new DMMv2 CLMM architecture. 
                      Staking will be available once the upgrade is complete.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>ETA: Coming soon</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-500">
                        <Check className="w-4 h-4" />
                        <span>Funds are safe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Assets */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-[16px] flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Your Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!account ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Connect your wallet to view your assets</p>
                    <ConnectButton
                      client={client}
                      wallets={wallets}
                      chain={etoMainnet}
                      chains={supportedChains}
                      connectModal={{ size: "compact" }}
                      connectButton={{
                        label: "Connect Wallet",
                        style: {
                          background: "hsl(160 70% 50%)",
                          color: "#000",
                          border: "none",
                          borderRadius: "12px",
                          padding: "12px 24px",
                          fontSize: "14px",
                          fontWeight: "600",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* MAANG Balance */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center p-2">
                          <img src={maangLogo} alt="MAANG" className="w-full h-full" />
                        </div>
                        <div>
                          <div className="font-medium">MAANG</div>
                          <div className="text-sm text-muted-foreground">${maangPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{driBalance}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(parseFloat(driBalance) * maangPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* USDC Balance */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center p-2">
                          <img 
                            src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040" 
                            alt="USDC" 
                            className="w-full h-full" 
                          />
                        </div>
                        <div>
                          <div className="font-medium">USDC</div>
                          <div className="text-sm text-muted-foreground">$1.00</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{usdcBalance}</div>
                        <div className="text-sm text-muted-foreground">${usdcBalance}</div>
                      </div>
                    </div>

                    {/* Total Portfolio Value */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Portfolio Value</span>
                        <span className="text-xl font-semibold text-primary">
                          ${portfolioValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Coming */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  What's Coming with sMAANG
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
                      title: 'Earn Trading Fees', 
                      desc: 'Share in DMM swap fees automatically' 
                    },
                    { 
                      icon: <Zap className="w-5 h-5 text-yellow-500" />,
                      title: 'Liquid Staking', 
                      desc: 'Get sMAANG tokens you can use elsewhere' 
                    },
                    { 
                      icon: <Shield className="w-5 h-5 text-blue-500" />,
                      title: 'No Lock-up', 
                      desc: 'Withdraw your MAANG anytime' 
                    },
                    { 
                      icon: <Vault className="w-5 h-5 text-purple-500" />,
                      title: 'Auto-Compound', 
                      desc: 'Rewards automatically reinvested' 
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
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
            {/* sMAANG Info Card */}
            <div className="cta-card">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5">
                    <img src={maangLogo} alt="" className="w-full h-full" />
                  </div>
                  <div>
                    <div className="font-semibold">sMAANG Vault</div>
                    <div className="text-[11px] text-muted-foreground">Liquid Staking</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-[11px] text-muted-foreground mb-1">MAANG Price</div>
                  <div className="text-[42px] font-semibold tracking-tight leading-none text-primary">
                    ${maangPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">Live from DMM</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>No lock-up period</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>Compound rewards automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-data-positive" />
                    <span>Withdraw anytime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">While You Wait</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/trade">
                    <span className="text-[13px]">Trade MAANG</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/dashboard">
                    <span className="text-[13px]">View Dashboard</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                  <Link to="/faucet">
                    <span className="text-[13px]">Get Test Tokens</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <div>
                    <div className="text-sm font-medium">Vault Status</div>
                    <div className="text-xs text-muted-foreground">Upgrade in progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
