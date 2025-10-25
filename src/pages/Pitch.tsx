import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe, 
  Sparkles, 
  Users, 
  Wallet,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Target,
  Rocket
} from "lucide-react";

export default function Pitch() {
  const navigate = useNavigate();

  const problemPoints = [
    "Fragmented liquidity across 100+ chains",
    "High gas fees eating into profits",
    "Slow cross-chain transfers (minutes to hours)",
    "Complex UX requiring multiple wallets",
    "No intelligent trading automation"
  ];

  const solutionPoints = [
    { icon: Zap, title: "Instant Swaps", desc: "Cross-chain trades in seconds" },
    { icon: Shield, title: "Zero Gas", desc: "We absorb the fees for you" },
    { icon: Globe, title: "12+ Chains", desc: "One interface, all networks" },
    { icon: Sparkles, title: "AI Trading", desc: "Your 24/7 intelligent assistant" },
    { icon: BarChart3, title: "DMM", desc: "Dynamic Market Making for best prices" }
  ];

  const metrics = [
    { value: "$2.4B+", label: "Total Value Locked" },
    { value: "150K+", label: "Active Users" },
    { value: "12+", label: "Chains Supported" },
    { value: "99.9%", label: "Uptime" }
  ];

  const roadmap = [
    { q: "Q1 2025", items: ["MAANG Token Launch", "AI Assistant Beta", "Avalanche Integration"] },
    { q: "Q2 2025", items: ["Layer Zero V2", "Mobile App", "10M Users Target"] },
    { q: "Q3 2025", items: ["Institutional Products", "Compliance Framework", "Series A"] },
    { q: "Q4 2025", items: ["Global Expansion", "100+ Chains", "IPO Prep"] }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Investor Pitch Deck</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            <span className="block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              The Future of
            </span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Cross-Chain Trading
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Building the <span className="text-primary font-semibold">world's first AI-powered</span> cross-chain DEX that actually works.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate('/signin')} className="group">
              Launch Platform
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">Download Deck</Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Target className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Problem</h2>
            <p className="text-xl text-muted-foreground">
              DeFi is broken. Users are suffering.
            </p>
          </div>

          <div className="grid gap-4 max-w-3xl mx-auto">
            {problemPoints.map((point, i) => (
              <Card key={i} className="p-6 flex items-start gap-4 bg-destructive/5 border-destructive/20">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-destructive font-bold">{i + 1}</span>
                </div>
                <p className="text-lg font-medium pt-1">{point}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-8 bg-gradient-to-r from-destructive/10 to-destructive/5">
              <p className="text-3xl font-bold text-destructive mb-2">$50B+ Lost Annually</p>
              <p className="text-muted-foreground">To inefficiencies, gas fees, and failed transactions</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Solution</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ETO combines AI, Layer Zero, and Dynamic Market Making to create the <span className="text-primary font-semibold">fastest, cheapest, and smartest</span> DEX ever built.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionPoints.map((item, i) => (
              <Card key={i} className="p-6 hover:scale-105 transition-transform bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Traction Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Traction</h2>
            <p className="text-xl text-muted-foreground">
              Numbers that speak for themselves
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {metrics.map((metric, i) => (
              <Card key={i} className="p-8 text-center bg-gradient-to-br from-primary/10 to-accent/10">
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {metric.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {metric.label}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-bold mb-2">Revenue</h3>
              <p className="text-2xl font-bold text-green-500">$2.1M ARR</p>
              <p className="text-sm text-muted-foreground mt-1">400% YoY growth</p>
            </Card>
            <Card className="p-6 bg-blue-500/10 border-blue-500/20">
              <Users className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-bold mb-2">Growth</h3>
              <p className="text-2xl font-bold text-blue-500">+15K/month</p>
              <p className="text-sm text-muted-foreground mt-1">New active users</p>
            </Card>
            <Card className="p-6 bg-purple-500/10 border-purple-500/20">
              <Wallet className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-bold mb-2">Retention</h3>
              <p className="text-2xl font-bold text-purple-500">87%</p>
              <p className="text-sm text-muted-foreground mt-1">30-day retention</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Token Economics */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">MAANG Token</h2>
            <p className="text-xl text-muted-foreground">
              The heart of our ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="text-2xl font-bold mb-6">Token Utility</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Governance</p>
                    <p className="text-sm text-muted-foreground">Vote on protocol upgrades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Staking Rewards</p>
                    <p className="text-sm text-muted-foreground">Earn up to 45% APY</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Fee Discounts</p>
                    <p className="text-sm text-muted-foreground">Up to 50% off trading fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">AI Access</p>
                    <p className="text-sm text-muted-foreground">Premium AI assistant features</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-secondary/10 to-primary/10">
              <h3 className="text-2xl font-bold mb-6">Tokenomics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-4xl font-bold text-primary">$33.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                  <p className="text-2xl font-bold">100M MAANG</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Circulating</p>
                  <p className="text-2xl font-bold">35M (35%)</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Distribution</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Team (2yr vest)</span>
                      <span className="font-semibold">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Community</span>
                      <span className="font-semibold">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidity</span>
                      <span className="font-semibold">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investors</span>
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Roadmap</h2>
            <p className="text-xl text-muted-foreground">
              The journey to DeFi dominance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((quarter, i) => (
              <Card key={i} className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 hover:scale-105 transition-transform">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-1 rounded-full bg-primary/20 border border-primary/30">
                    <span className="font-bold text-primary">{quarter.q}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {quarter.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">The Ask</h2>
          
          <Card className="p-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
            <p className="text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
              $5M Seed Round
            </p>
            <p className="text-xl text-muted-foreground mb-8">
              To scale to 1M users, expand to 50+ chains, and dominate the cross-chain DEX market
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">$15M</p>
                <p className="text-sm text-muted-foreground">Pre-money valuation</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">25%</p>
                <p className="text-sm text-muted-foreground">Equity offered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">18mo</p>
                <p className="text-sm text-muted-foreground">Runway</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg" className="group">
                Join the Round
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">Schedule Call</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">Questions?</p>
          <p className="text-2xl font-bold mb-2">investors@eto.finance</p>
          <Button variant="link" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </section>
    </div>
  );
}
