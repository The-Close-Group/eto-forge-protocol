import { useState } from 'react'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ETO Protocol Landing Page
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Vite + React 18 + TypeScript + Tailwind CSS + React Router
        </p>

        <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Count is {count}
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p>✅ Vite configured</p>
          <p>✅ React 18 ready</p>
          <p>✅ TypeScript enabled</p>
          <p>✅ Tailwind CSS working</p>
          <p>✅ React Router DOM installed</p>
        </div>
      </div>
    </div>
  )
}

export default Home
