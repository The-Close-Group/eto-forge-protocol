import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import {
  Bricolage_Grotesque,
  Inter,
  Schibsted_Grotesk,
} from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ETO Documentation',
    template: '%s | ETO',
  },
  description: 'Documentation for ETO - Equity Token Offering Protocol',
  icons: {
    icon: '/eto-single.svg',
    shortcut: '/eto-single.svg',
    apple: '/eto-single.svg',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${schibstedGrotesk.variable} ${bricolageGrotesque.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
