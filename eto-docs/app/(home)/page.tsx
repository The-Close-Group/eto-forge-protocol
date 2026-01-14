import Link from 'next/link';

export default function HomePage() {
  // Static export: redirect via meta refresh instead of server redirect
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0;url=/docs/docs/" />
      </head>
      <body>
        <p>Redirecting to <Link href="/docs">documentation</Link>...</p>
      </body>
    </html>
  );
}
