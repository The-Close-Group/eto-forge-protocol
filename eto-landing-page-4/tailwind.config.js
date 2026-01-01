/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stable: {
          dark: '#013a2f',      // Deep forest green (Backgrounds)
          darker: '#002b22',    // Darker shade
          primary: '#00D06C',   // Bright emerald accent (Buttons, Highlights)
          light: '#F0FDF4',     // Very light mint (Hero bg)
          gray: '#F3F4F6',      // Light gray
          text: '#111827',      // Main text
          muted: '#4B5563',     // Secondary text
          border: '#E5E7EB',    // Light border
          'border-dark': 'rgba(255,255,255,0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
        'grid-pattern-dark': "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}

