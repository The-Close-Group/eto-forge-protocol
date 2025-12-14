# ETO Documentation

Official documentation for the Equity Token Offering (ETO) Protocol - bringing real-world equity exposure on-chain with native DeFi primitives.

This documentation site is built with Next.js and [Fumadocs](https://fumadocs.dev).

## Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Project Structure

- `content/docs/`: Documentation content in MDX format
  - `introduction/`: Background, what is ETO, MAANG tokens, trust & security
  - `architecture/`: Technical architecture documentation
- `lib/source.ts`: Content source adapter configuration
- `lib/layout.shared.tsx`: Shared layout options and branding
- `app/docs/`: Documentation layout and pages
- `app/api/search/route.ts`: Search functionality

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Fumadocs](https://fumadocs.dev)
