'use client'

import { useUser, SignInButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser()

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to dashboard if already signed in
  if (isSignedIn) {
    redirect('/dashboard')
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            JobAssist AI
            <span className="block text-blue-600 text-5xl mt-2">Career Copilot</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your job search with AI. Get instant resume matching, gap analysis, 
            and personalized outreach—all in under 5 minutes.
          </p>

          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
                Get Started Free
              </button>
            </SignInButton>
            <Link 
              href="/about" 
              className="inline-block border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Matching</h3>
              <p className="text-gray-600">AI finds your best resume for any job in seconds</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Gap Analysis</h3>
              <p className="text-gray-600">Get specific suggestions to improve your resume</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Smart Outreach</h3>
              <p className="text-gray-600">Generate personalized emails that get responses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
