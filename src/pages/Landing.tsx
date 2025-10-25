import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Layers, Lock, Sparkles } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";
import { useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Interactive Cursor Effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb, 139, 92, 246), 0.15), transparent 80%)`
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        
        {/* Floating Orbs with Animation */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 animate-fade-in backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Powered by Layer Zero
            </span>
          </div>

          {/* Main Heading with Enhanced Animation */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-display-xl md:text-display-2xl font-display">
              <span className="block text-foreground">
                The Future
              </span>
              <span className="block text-muted-foreground/40">
                of Finance
              </span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-lg md:text-xl font-mono text-muted-foreground">
              <span>⚡</span>
              <span>At Your Fingertips</span>
              <span>✨</span>
            </div>
          </div>

          {/* Subheading */}
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed font-light">
            Experience <span className="font-mono font-medium text-foreground">seamless cross-chain swaps</span> with Dynamic Market Making.
            Trade MAANG, bridge assets, and earn rewards—<span className="font-medium text-foreground">all in one place</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-base px-8 py-6 bg-gradient-to-r from-white/90 to-white/80 text-black hover:from-white hover:to-white/90 group shadow-xl transition-all duration-300 hover:scale-105 font-medium"
            >
              <Zap className="mr-2 h-5 w-5" />
              Launch App
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="text-base px-8 py-6 border-2 border-border hover:bg-accent transition-all duration-300 hover:scale-105 font-medium"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/pitch')}
              className="text-base px-8 py-6 border-2 border-border hover:bg-accent transition-all duration-300 hover:scale-105 font-medium"
            >
              View Pitch Deck
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span className="text-green-400">✓</span>
              <span>No Gas Fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>⚡</span>
              <span>Instant Swaps</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span className="text-yellow-400">🔒</span>
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span className="text-blue-400">🌐</span>
              <span>12+ Chains</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-5xl mx-auto">
            {[
              { label: 'Total Volume', value: '$2.4B+', icon: '📈' },
              { label: 'Active Users', value: '150K+', icon: '👥' },
              { label: 'Chains', value: '12+', icon: '🔗' },
              { label: 'Uptime', value: '99.9%', icon: '⚡' },
            ].map((stat, i) => (
              <Card 
                key={i} 
                className="p-6 text-center bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/60 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold font-display text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-2">{stat.label}</div>
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
                className="p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/60 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:-translate-y-1 group hover:shadow-xl cursor-pointer"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MAANG Token Section */}
      <section className="relative py-40 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.2),transparent_50%)]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-mono text-muted-foreground">MAANG TOKEN</span>
          </div>

          <h2 className="text-display-lg md:text-display-xl font-display">
            <span className="text-foreground">Meta AI</span>{" "}
            <span className="text-muted-foreground/40">& Analytics</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            The <span className="font-mono font-medium text-foreground">native token</span> powering the ETO ecosystem. 
            Stake for rewards, govern the protocol, and unlock exclusive features.
          </p>

          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border">
            <span className="text-sm font-mono text-muted-foreground">Current Price:</span>
            <span className="text-3xl md:text-4xl font-bold font-mono text-foreground">
              $33<span className="text-muted-foreground/40">.00</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-mono font-medium">
              +5.2%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-base px-8 py-6 bg-gradient-to-r from-white/90 to-white/80 text-black hover:from-white hover:to-white/90 group shadow-xl transition-all duration-300 hover:scale-105 font-medium"
            >
              Trade MAANG Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signin')}
              className="text-base px-8 py-6 border-2 border-border hover:bg-accent transition-all duration-300 hover:scale-105 font-medium"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-background to-background" />
        <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-6">
            <h2 className="text-display-lg md:text-display-xl font-display">
              <span className="text-foreground">Ready to</span>
              <br />
              <span className="text-muted-foreground/40">Start Trading?</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Join <span className="font-mono font-medium text-foreground">150,000+ traders</span> experiencing the future of DeFi
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-base px-12 py-6 bg-gradient-to-r from-white/90 to-white/80 text-black hover:from-white hover:to-white/90 group shadow-xl transition-all duration-300 hover:scale-105 font-medium"
            >
              <Zap className="mr-2 h-5 w-5" />
              Launch App Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs font-mono text-muted-foreground">
              ✨ No credit card required • Get started in 30 seconds
            </p>
          </div>
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
