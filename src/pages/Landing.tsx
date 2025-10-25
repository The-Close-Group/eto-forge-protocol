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
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter">
              <span className="block bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-2xl">
                The Future
              </span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                Of Finance
              </span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-2xl md:text-4xl font-bold text-muted-foreground">
              <span className="inline-block animate-bounce">⚡</span>
              <span>At Your Fingertips</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            </div>
          </div>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Experience <span className="text-primary font-semibold">seamless cross-chain swaps</span> with Dynamic Market Making.
            Trade MAANG, bridge assets, and earn rewards—<span className="text-secondary font-semibold">all in one place</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 group shadow-2xl shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              <Zap className="mr-2 h-6 w-6 animate-pulse" />
              Launch App
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="text-xl px-12 py-8 border-2 border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Button>
          </div>

          {/* Floating Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-8 animate-fade-in">
            {['✅ No Gas Fees', '⚡ Instant Swaps', '🔒 100% Secure', '🌍 12+ Chains'].map((feature, i) => (
              <div 
                key={i} 
                className="px-4 py-2 rounded-full bg-muted/50 border border-border/60 text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {feature}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-20 max-w-5xl mx-auto">
            {[
              { label: 'Total Volume', value: '$2.4B+', icon: '📈' },
              { label: 'Active Users', value: '150K+', icon: '👥' },
              { label: 'Chains', value: '12+', icon: '🔗' },
              { label: 'Uptime', value: '99.9%', icon: '⚡' },
            ].map((stat, i) => (
              <Card 
                key={i} 
                className="p-8 text-center bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/60 hover:border-primary/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/20 group animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">{stat.icon}</div>
                <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</div>
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
                className="p-10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/60 hover:border-primary/50 transition-all duration-500 hover:scale-110 hover:-translate-y-2 group hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
              >
                <div className="text-primary mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
        
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30 backdrop-blur-sm animate-pulse">
            <span className="text-5xl animate-bounce">🤖</span>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MAANG TOKEN
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-black">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Meta AI & Analytics
            </span>
          </h2>

          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The <span className="text-primary font-semibold">native token</span> powering the ETO ecosystem. 
            Stake for rewards, govern the protocol, and unlock exclusive features.
          </p>

          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-xl border-2 border-primary/30">
            <span className="text-muted-foreground">Current Price:</span>
            <span className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              $33.00
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
              +5.2%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 group shadow-2xl shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              Trade MAANG Now
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signin')}
              className="text-xl px-12 py-8 border-2 border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
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
            <h2 className="text-6xl md:text-8xl font-black">
              <span className="block mb-4">Ready to</span>
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                Start Trading?
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join <span className="text-primary font-bold">150,000+ traders</span> experiencing the future of DeFi
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-2xl px-16 py-10 bg-gradient-to-r from-primary to-secondary hover:opacity-90 group shadow-2xl shadow-primary/50 transition-all duration-300 hover:scale-110"
            >
              <Zap className="mr-3 h-7 w-7 animate-pulse" />
              Launch App Now
              <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-3 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
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
