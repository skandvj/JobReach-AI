'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Upload, Search, History, FileText, Target, Users, Mail } from 'lucide-react'

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">JobAssist AI</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.firstName || 'User'}!
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to find your next opportunity?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/resumes" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Upload Resume</h3>
              </div>
              <p className="text-gray-600 mb-4">Add your resume to get started</p>
              <div className="text-blue-600 font-medium">Upload Now →</div>
            </div>
          </Link>

          <Link href="/analyze" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Analyze Job</h3>
              </div>
              <p className="text-gray-600 mb-4">Match your resume to job postings</p>
              <div className="text-green-600 font-medium">Start Analysis →</div>
            </div>
          </Link>

          <Link href="/history" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <History className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">View History</h3>
              </div>
              <p className="text-gray-600 mb-4">See your past job matches</p>
              <div className="text-purple-600 font-medium">View History →</div>
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Resumes</div>
            </div>
            <div className="p-4">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Job Matches</div>
            </div>
            <div className="p-4">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Contacts Found</div>
            </div>
            <div className="p-4">
              <Mail className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Emails Sent</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
