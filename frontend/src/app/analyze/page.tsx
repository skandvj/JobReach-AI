'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { matchAPI, contactAPI, type JobMatch, type ContactInfo } from '@/lib/api'
import { formatDate, calculateMatchPercentage } from '@/lib/utils'
import { ArrowLeft, Search, FileText, Users, Mail, ThumbsUp, ThumbsDown, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AnalyzePage() {
  const { user } = useUser()
  const [jobDescription, setJobDescription] = useState('')
  const [personalStory, setPersonalStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JobMatch | null>(null)
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const handleAnalyze = async () => {
    if (!user?.id || !jobDescription.trim()) return

    setLoading(true)
    try {
      const match = await matchAPI.findMatch({
        job_description: jobDescription,
        personal_story: personalStory
      }, user.id)
      
      setResult(match)
      
      // Load contacts
      setLoadingContacts(true)
      try {
        const contactsData = await contactAPI.getContacts(match.id, user.id)
        setContacts(contactsData)
      } catch (error) {
        console.error('Contacts error:', error)
      } finally {
        setLoadingContacts(false)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please make sure you have uploaded at least one resume.')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (feedback: 1 | -1) => {
    if (!result || !user?.id) return
    
    try {
      await matchAPI.submitFeedback(result.id, feedback, user.id)
      alert('Thank you for your feedback!')
    } catch (error) {
      console.error('Feedback error:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Job Analysis</h1>
        </div>

        {!result ? (
          /* Input Form */
          <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Analyze Job Posting</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Story (Optional)
                </label>
                <textarea
                  value={personalStory}
                  onChange={(e) => setPersonalStory(e.target.value)}
                  placeholder="Add any personal context for outreach emails..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Analyze Job Posting
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Best Resume Match */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Best Resume Match
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.bestResume.score >= 0.8 ? 'bg-green-100 text-green-800' :
                  result.bestResume.score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {calculateMatchPercentage(result.bestResume.score)}% Match
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{result.bestResume.fileName}</h3>
                  <p className="text-sm text-gray-600">Recommended resume for this position</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Gap Analysis & Suggestions</h3>
                  <ul className="space-y-2">
                    {result.gapAnalysis.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <button
                    onClick={() => handleFeedback(1)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback(-1)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Draft */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Outreach Email Draft
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{result.emailDraft}</pre>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(result.emailDraft)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Email
                  </button>
                  <button 
                    onClick={() => window.open(`mailto:?body=${encodeURIComponent(result.emailDraft)}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open in Email
                  </button>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Relevant Contacts {contacts.length > 0 && `(${contacts.length})`}
              </h2>
              
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Finding relevant contacts...</span>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No contacts found for this company.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {contacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                          <p className="text-xs text-gray-500">{contact.company}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {Math.round(contact.mutualScore * 100)}% relevant
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {contact.linkedinUrl && (
                          <button 
                            onClick={() => window.open(contact.linkedinUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            LinkedIn
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setContacts([])
                  setJobDescription('')
                  setPersonalStory('')
                }}
                className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200 transition-colors"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
