import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center text-center flex-1 px-4">
      <Image 
        src="/eto-logo.svg" 
        alt="ETO" 
        width={209.6} 
        height={99.2}
        className="mb-8"
        priority
      />
      <h1 className="text-4xl font-bold mb-4">ETO Docs & FAQ</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Bringing Global Markets On-Chain.
      </p>
      <Link 
        href="/docs" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
      >
        View Documentation
      </Link>
    </div>
  );
}
