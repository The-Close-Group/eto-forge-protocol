import { Link } from 'react-router-dom';
import { Callout } from './Callout';

// Custom link component that handles internal docs links
function DocsLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  // Handle relative links (no protocol or leading slash) - treat as docs internal links
  const isRelative = href && !href.startsWith('/') && !href.startsWith('http') && !href.startsWith('#');
  const isDocsInternal = href?.startsWith('/docs/');

  if (isRelative || isDocsInternal) {
    // Convert relative paths to absolute /docs/ paths
    const path = isRelative ? `/docs/${href}` : href;
    return (
      <Link to={path!} className="text-emerald-400 hover:text-emerald-300 underline" {...props}>
        {children}
      </Link>
    );
  }

  // Hash links (anchor links within the page)
  if (href?.startsWith('#')) {
    return (
      <a href={href} className="text-emerald-400 hover:text-emerald-300 underline" {...props}>
        {children}
      </a>
    );
  }

  // External links
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline" {...props}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  // Custom components
  Callout,

  // Override default elements
  a: DocsLink,

  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-4xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold text-white mt-8 mb-3 border-b border-white/10 pb-2">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold text-white mt-6 mb-2">{children}</h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-lg font-medium text-white mt-4 mb-2">{children}</h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1 ml-4">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1 ml-4">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-300">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-200">{children}</em>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300">{children}</code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-400 my-4">{children}</blockquote>
  ),
  hr: () => <hr className="border-white/10 my-8" />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse border border-white/10">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-white/10 bg-white/5 px-4 py-2 text-left font-semibold text-white">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-white/10 px-4 py-2 text-gray-300">{children}</td>
  ),
};
