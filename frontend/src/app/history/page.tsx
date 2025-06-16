'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { matchAPI, type JobMatch } from '@/lib/api'
import { formatDate, calculateMatchPercentage } from '@/lib/utils'
import { ArrowLeft, History, FileText, Calendar, Search } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const { user } = useUser()
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadHistory()
    }
  }, [user?.id])

  const loadHistory = async () => {
    try {
      if (user?.id) {
        const data = await matchAPI.getHistory(user.id)
        setMatches(data)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter(match =>
    match.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.bestResume.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {matches.length === 0 ? 'No analyses yet' : 'No matches found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {matches.length === 0 
                ? 'Start by analyzing your first job posting to see your history here.'
                : 'Try adjusting your search terms.'
              }
            </p>
            {matches.length === 0 && (
              <Link 
                href="/analyze"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Analyze a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          Job Analysis #{match.id}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {match.jobDescription.substring(0, 200)}...
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 ${
                        match.bestResume.score >= 0.8 ? 'bg-green-100 text-green-800' :
                        match.bestResume.score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {calculateMatchPercentage(match.bestResume.score)}% Match
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{match.bestResume.fileName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(match.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <details className="group">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </summary>
                        <div className="mt-3 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Gap Analysis</h4>
                            <ul className="space-y-1">
                              {match.gapAnalysis.slice(0, 3).map((suggestion, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  • {suggestion}
                                </li>
                              ))}
                              {match.gapAnalysis.length > 3 && (
                                <li className="text-sm text-gray-500">
                                  +{match.gapAnalysis.length - 3} more suggestions
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Email Draft Preview</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {match.emailDraft.substring(0, 200)}...
                            </p>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
