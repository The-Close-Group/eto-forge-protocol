import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Asset prefix for serving from /docs subdirectory
  assetPrefix: '/docs',
  // Trailing slash for static export
  trailingSlash: true,
};

export default withMDX(config);
