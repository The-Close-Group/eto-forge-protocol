import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Layers, Lock } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/60 animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by Layer Zero</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight animate-fade-in">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Cross-Chain Trading
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
            Experience seamless cross-chain swaps with Dynamic Market Making.
            Trade MAANG, bridge assets, and earn rewards—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group"
            >
              Launch App
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-6"
            >
              Get Started
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto">
            {[
              { label: 'Total Volume', value: '$2.4B+' },
              { label: 'Active Users', value: '150K+' },
              { label: 'Chains', value: '12+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, i) => (
              <Card key={i} className="p-6 text-center bg-card/50 backdrop-blur border-border/60 animate-scale-in">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Built for the Future
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets intuitive design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8" />,
                title: 'Cross-Chain',
                description: 'Seamlessly trade across 12+ blockchains with Layer Zero integration',
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: 'Dynamic Market Making',
                description: 'Intelligent pricing powered by real-time oracle feeds and liquidity pools',
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Secure by Design',
                description: 'Bank-grade security with multi-sig wallets and audited smart contracts',
              },
              {
                icon: <Layers className="h-8 w-8" />,
                title: 'Deep Liquidity',
                description: 'Access deep liquidity pools for minimal slippage on every trade',
              },
              {
                icon: <Lock className="h-8 w-8" />,
                title: 'Non-Custodial',
                description: 'Your keys, your crypto. We never have access to your funds',
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Lightning Fast',
                description: 'Execute trades in milliseconds with our optimized infrastructure',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-8 bg-card/50 backdrop-blur border-border/60 hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MAANG Token Section */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-4xl">🤖</span>
            <span className="text-sm font-medium">MAANG Token</span>
          </div>

          <h2 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Meta AI & Analytics
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The native token powering the ETO ecosystem. Stake for rewards, govern the protocol,
            and unlock exclusive features. Currently trading at $33.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              Trade MAANG
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signin')}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of traders experiencing the future of DeFi
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signin')}
            className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 group"
          >
            Launch App Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm">
            © 2025 ETO Trading Platform. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
