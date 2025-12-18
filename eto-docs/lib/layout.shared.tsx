import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/fuma-nama/fumadocs',
    links: [],
    nav: {
      title: (
        <Image
          src="/eto-logo.svg"
          alt="ETO"
          width={131}
          height={62}
          className="h-8 w-auto"
          priority
        />
      ),
      url: '/docs',
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
