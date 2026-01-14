import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

// Get the base path for assets - uses assetPrefix in production
const basePath = process.env.NODE_ENV === 'production' ? '/docs' : '';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/eto-markets',
    links: [],
    nav: {
      title: (
        <Image
          src={`${basePath}/eto-logo.svg`}
          alt="ETO"
          width={131}
          height={62}
          className="h-8 w-auto"
          priority
        />
      ),
      url: `${basePath}/docs`,
      transparentMode: 'none',
    },
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: true,
      mode: 'light-dark-system',
    },
  };
}
