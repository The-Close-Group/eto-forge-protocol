
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { WalletConnector } from '@/components/WalletConnector';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SEO from '@/components/SEO';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import layerZeroLogo from '@/assets/layerzero-logo.png';
import avalancheLogo from '@/assets/avalanche-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';

const sponsors = [
  { name: 'Avalanche', logo: avalancheLogo },
  { name: 'LayerZero', logo: layerZeroLogo },
  { name: 'USDC', logo: usdcLogo },
];

export default function SignIn() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { walletAddress } = useWallet();

// Form schema
const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const form = useForm<{ email: string; password: string }>({
  resolver: zodResolver(SignInSchema),
  defaultValues: { email: '', password: '' },
});

// Redirect to dashboard when authenticated
useEffect(() => {
  if (isAuthenticated) {
    navigate('/dashboard');
  }
}, [isAuthenticated, navigate]);

const onSubmit = async (values: { email: string; password: string }) => {
  const { error } = await supabase.auth.signInWithPassword(values);
  if (error) {
    toast.error(error.message || 'Sign in failed');
  } else {
    toast.success('Signed in successfully');
    navigate('/dashboard');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <SEO
        title="Sign In – ETO Trading"
        description="Connect your wallet to access ETO Trading. Secure, fast, and multi‑chain ready."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <div className="w-full max-w-5xl px-6 py-10 animate-enter">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            ETO Trading
          </h1>
          <p className="text-muted-foreground text-lg">
            Seamless cross‑chain trading with LayerZero and Dynamic Market Making
          </p>
        </div>

        {/* Temporary production shortcut */}
        <div className="flex justify-end mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              localStorage.setItem('eto-bypass-auth', 'true');
              toast.success('Bypass enabled. Redirecting to Dashboard.');
              navigate('/dashboard');
            }}
          >
            Skip to Dashboard (temporary)
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {/* Wallet + Email Tabs */}
            <div>
              <Tabs defaultValue="wallets" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="wallets">Wallets</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="wallets" className="mt-4">
                  <WalletConnector />
                </TabsContent>
                <TabsContent value="email" className="mt-4">
                  <div className="border border-border/60 rounded-xl bg-card/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold mb-4">Sign in with email</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Quick tips moved under connector */}
            <div className="border border-border/60 rounded-xl bg-card/80 backdrop-blur p-6 shadow-sm">
              <Accordion type="single" collapsible defaultValue="tips">
                <AccordionItem value="tips" className="border-b-0">
                  <AccordionTrigger className="text-sm font-medium">Quick tips</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use MetaMask or WalletConnect to get started quickly</li>
                      <li>• Your funds remain in your wallet; ETO executes on-chain</li>
                      <li>• This is a pre‑launch environment – metrics are zeroed</li>
                    </ul>
                    <div className="mt-5 text-xs text-muted-foreground">Press ⌘K / Ctrl+K to quickly navigate</div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Right column intentionally left empty for now */}
        </div>

        {/* Sponsors Section */}
        <Card className="p-6 bg-card/90 border border-border mt-6">
          <div className="text-center space-y-4">
            <h3 className="text-sm text-soft-muted">Backed By</h3>
            <div className="flex justify-center items-center gap-6">
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className="flex flex-col items-center space-y-2">
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-8 h-8 object-contain" />
                  <span className="text-xs font-normal text-soft-muted">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
