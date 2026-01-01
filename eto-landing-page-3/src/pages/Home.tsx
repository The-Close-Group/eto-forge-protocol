import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      {/* Navigation Bar */}
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Left Side */}
            <Link 
              to="/" 
              className="flex items-center transition-opacity hover:opacity-80"
              aria-label="ETO Protocol Home"
            >
              <img 
                src="/eto-brand-logo.svg" 
                alt="ETO Protocol" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Navigation Items - Right Side (placeholder for future nav items) */}
            <div className="flex items-center gap-8">
              {/* Future navigation items can go here */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          {/* Content will go here */}
        </div>
      </main>
    </div>
  )
}

export default Home
