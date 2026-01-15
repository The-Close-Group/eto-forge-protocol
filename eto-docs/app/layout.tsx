import { RootProvider } from 'fumadocs-ui/provider/next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import 'katex/dist/katex.min.css';
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
    icon: '/docs/eto-single.svg',
    shortcut: '/docs/eto-single.svg',
    apple: '/docs/eto-single.svg',
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
        <RootProvider>
          <DocsLayout
            tree={source.pageTree}
            sidebar={{ defaultOpenLevel: 1, collapsible: true }}
            {...baseOptions()}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
