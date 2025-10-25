import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Lock,
  Clock,
  TrendingDown,
  ShieldCheck,
  Zap, 
  Target,
  Globe,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Users
} from "lucide-react";

export default function Pitch() {
  const navigate = useNavigate();

  const problemPoints = [
    { 
      icon: Lock, 
      title: "Custodial & Permissioned", 
      desc: "Current systems, including those proposed by big tech, are custodial and KYC-gated, locking you out of your own assets and preventing true DeFi composability." 
    },
    { 
      icon: Clock, 
      title: "Archaic Settlement Delays", 
      desc: "The financial world still operates on T+2 settlement, tying up capital and eroding trust. This is an inefficiency big tech will inherit, not solve." 
    },
    { 
      icon: TrendingDown, 
      title: "Broken Tracking & Hidden Costs", 
      desc: "Existing tokenized assets suffer from poor tracking, with discrepancies of 200+ bps costing users billions annually. It's a hidden tax on your wealth." 
    }
  ];

  const solutionPoints = [
    { 
      icon: ShieldCheck, 
      title: "Self-Custody & True Ownership", 
      desc: "Our ERC-20 tokens are self-custodial and non-KYC gated, compatible with protocols across all of DeFi. You control your keys, you control your assets." 
    },
    { 
      icon: Zap, 
      title: "Instant Settlement, 24/7 Trading", 
      desc: "Transactions settle instantly on-chain, eliminating T+2 delays and unlocking capital immediately. The market never closes." 
    },
    { 
      icon: Target, 
      title: "Zero-Error Tracking", 
      desc: "Our Dynamic Market Maker and Peg Stability Module ensure a peg accuracy of 50bps under sustained loads, providing a price you can trust." 
    },
    { 
      icon: Globe, 
      title: "Cross-Chain by Default", 
      desc: "Built on LayerZero, DRI provides access to unified liquidity across 50+ blockchains, eliminating silos and creating one global market." 
    }
  ];

  const comparisonPoints = [
    {
      feature: "Ownership Model",
      driAdvantage: "Decentralized & Self-Custody. You own your assets.",
      maangDisadvantage: "Centralized & Custodial. They are the bank."
    },
    {
      feature: "Interoperability",
      driAdvantage: "Open & Composable. Works with all of DeFi.",
      maangDisadvantage: "Walled Garden. Works only within their ecosystem."
    },
    {
      feature: "Transparency",
      driAdvantage: "On-Chain & Auditable. Every transaction is public.",
      maangDisadvantage: "Opaque & Algorithmic. You can't see under the hood."
    },
    {
      feature: "Vision",
      driAdvantage: "Empowerment. Building open financial infrastructure for everyone.",
      maangDisadvantage: "Control. Capturing a new revenue stream from their users."
    }
  ];

  const achievements = [
    "From Concept to Mainnet in 7 Months on a bootstrapped budget of only $4,000.",
    "Backed by Industry Leaders including Circle, Avalanche, and LayerZero.",
    "Audited and Secured with all security audits passed before launch.",
    "Proactively Engaging Regulators by actively working with the SEC Crypto Task Force."
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
            <span className="text-sm font-semibold">Entropy-to-Order: The Future of Finance is Not in Big Tech</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            <span className="block text-foreground mb-4">
              MAANG Wants to Own Your Assets.
            </span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              We Think You Should Own Them Yourself.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            DRI is a decentralized protocol for on-chain index tokens that offers what big tech never will: <span className="text-primary font-semibold">self-custody, instant settlement, and a perfectly tight peg</span>. No delays. No intermediaries. Just true ownership.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => {
              const solutionSection = document.getElementById('solution');
              solutionSection?.scrollIntoView({ behavior: 'smooth' });
            }} className="group">
              Explore the Protocol
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Lock className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Walled Garden of Modern Finance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The current financial system—and big tech's approach to it—keeps you locked in and locked out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {problemPoints.map((point, i) => (
              <Card key={i} className="p-6 bg-destructive/5 border-destructive/20 hover:scale-105 transition-transform">
                <point.icon className="h-10 w-10 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{point.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">DRI: The Protocol for a Truly Open Financial Future</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Dynamic Reflective Index (DRI) is a decentralized protocol that enables real-time, on-chain replication of real-world asset indices. <span className="text-primary font-semibold">It's not a better app; it's a new foundation for finance</span> built on transparency and user control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutionPoints.map((item, i) => (
              <Card key={i} className="p-8 hover:scale-105 transition-transform bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <item.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Win Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why We Win Against MAANG</h2>
            <p className="text-xl text-muted-foreground">
              It's not just about better tech. It's about a fundamentally different approach.
            </p>
          </div>

          <div className="space-y-4">
            {comparisonPoints.map((point, i) => (
              <Card key={i} className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Feature</p>
                    <p className="text-lg font-bold">{point.feature}</p>
                  </div>
                  <div className="border-l-2 border-primary/20 pl-6">
                    <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">DRI Advantage</p>
                    <p className="text-base">{point.driAdvantage}</p>
                  </div>
                  <div className="border-l-2 border-destructive/20 pl-6">
                    <p className="text-sm font-semibold text-destructive mb-2 uppercase tracking-wide">MAANG Disadvantage</p>
                    <p className="text-base text-muted-foreground">{point.maangDisadvantage}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Traction Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Proven Execution. Unmatched Credibility.</h2>
            <p className="text-xl text-muted-foreground">
              We don't just talk. We ship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {achievements.map((achievement, i) => (
              <Card key={i} className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:scale-105 transition-transform">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: achievement.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>') }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Next Financial Paradigm</h2>
            <Card className="p-12 bg-gradient-to-br from-primary/10 to-secondary/10 max-w-4xl mx-auto">
              <p className="text-xl leading-relaxed text-muted-foreground">
                DRI is more than a protocol; it's the foundation for a new capital market. Soon, our platform will become an <span className="text-primary font-bold">RWA Factory</span>, allowing anyone to tokenize real-world assets. Our ultimate goal is to offer a direct, on-chain alternative to the traditional IPO, allowing the world's most innovative companies to raise capital on our rails instead of the NYSE.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Prodigies and The Titans</h2>
            <p className="text-xl text-muted-foreground">
              Youth meets experience. Audacity meets wisdom.
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-6">Founders</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                <h4 className="text-2xl font-bold mb-2">Naman Bajpai</h4>
                <p className="text-primary font-semibold mb-4">Co-Founder & CTO</p>
                <p className="text-muted-foreground leading-relaxed">
                  A 19-year-old prodigious engineer and the technical architect of the entire ETO ecosystem. A product of a technological dynasty, he was mentored by the creators of the India Stack and has a documented history of building everything from rockets to advanced AI frameworks.
                </p>
              </Card>
              <Card className="p-8 bg-gradient-to-br from-secondary/10 to-primary/10">
                <h4 className="text-2xl font-bold mb-2">Ahyaan Sayed</h4>
                <p className="text-primary font-semibold mb-4">Co-Founder & CEO</p>
                <p className="text-muted-foreground leading-relaxed">
                  An 18-year-old visionary strategist with a background of 'old money' and a mission to build a new financial pillar to challenge Wall Street. He is the leader of The Foundry, a VC-backed hacker house and startup ecosystem in Philadelphia.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-6">Advisors</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 bg-card/50 border-primary/20">
                <h4 className="text-xl font-bold mb-2">Glenn Tyranski</h4>
                <p className="text-muted-foreground">
                  Former Chief Regulatory Officer & SVP of the New York Stock Exchange (NYSE).
                </p>
              </Card>
              <Card className="p-8 bg-card/50 border-primary/20">
                <h4 className="text-xl font-bold mb-2">Robert L. Morier</h4>
                <p className="text-muted-foreground">
                  Senior Wall Street Managing Director with extensive capital markets and investment banking expertise.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            The future of finance will not be built by the companies that defined the last century. It will be built by those with the vision and technology to create the next one.
          </h2>
          <p className="text-2xl font-semibold text-primary">
            Let's build it together.
          </p>
          
          <Card className="p-8 bg-card/80 backdrop-blur">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-muted-foreground">Contact Us</p>
              <div className="space-y-2">
                <p className="text-xl">
                  <a href="tel:+15705920311" className="hover:text-primary transition-colors">+1 570 592 0311</a>
                </p>
                <p className="text-xl">
                  <a href="mailto:AHYAAN@ENTROPYTOORDER.XYZ" className="hover:text-primary transition-colors">AHYAAN@ENTROPYTOORDER.XYZ</a>
                </p>
                <p className="text-xl">
                  <a href="mailto:NAMAN@ENTROPYTOORDER.XYZ" className="hover:text-primary transition-colors">NAMAN@ENTROPYTOORDER.XYZ</a>
                </p>
              </div>
            </div>
          </Card>

          <Button variant="link" onClick={() => navigate('/')} className="text-lg">
            Back to Home
          </Button>
        </div>
      </section>
    </div>
  );
}
