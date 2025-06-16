// src/components/features/history/job-history.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { matchAPI } from '@/lib/api'
import { formatDate, calculateMatchPercentage, getScoreBadgeVariant, truncateText } from '@/lib/utils'
import { 
  History, 
  Search, 
  FileText, 
  Calendar,
  Filter,
  Eye,
  Trash2,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { toast } from 'sonner'

export function JobHistory() {
  const { user } = useUser()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadMatches()
    }
  }, [user?.id])

  const loadMatches = async (pageNum = 1) => {
    try {
      setLoading(true)
      if (user?.id) {
        const response = await matchAPI.getHistory(user.id, pageNum, 10)
        if (pageNum === 1) {
          setMatches(response.data)
        } else {
          setMatches(prev => [...prev, ...response.data])
        }
        setHasMore(pageNum < response.pagination.totalPages)
        setPage(pageNum)
      }
    } catch (error) {
      toast.error('Failed to load history')
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadMatches(page + 1)
    }
  }

  const filteredMatches = matches.filter(match =>
    match.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.bestResume.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Analysis History</h1>
          <p className="text-gray-600 mt-1">
            Review your past job matches and insights
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={<History className="h-16 w-16" />}
          title="No job analyses yet"
          description="Start by analyzing your first job posting to see your match history here."
          action={{
            label: "Analyze a Job",
            onClick: () => window.location.href = '/match'
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Matches List */}
          <div className="grid gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onView={() => setSelectedMatch(match)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

function MatchCard({ match, onView }: { match: any, onView: () => void }) {
  const matchPercentage = calculateMatchPercentage(match.bestResume.score)
  const jobTitle = extractJobTitle(match.jobDescription)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{jobTitle}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {truncateText(match.jobDescription, 120)}
                </p>
              </div>
              <Badge variant={getScoreBadgeVariant(match.bestResume.score)}>
                {matchPercentage}% Match
              </Badge>
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
              {match.feedbackScore && (
                <div className="flex items-center space-x-1">
                  {match.feedbackScore === 1 ? (
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                  )}
                  <span>Feedback given</span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" className="ml-4">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MatchDetailModal({ match, onClose }: { match: any, onClose: () => void }) {
  const matchPercentage = calculateMatchPercentage(match.bestResume.score)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Job Analysis Details</h2>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{match.bestResume.fileName}</span>
                    <Badge variant={getScoreBadgeVariant(match.bestResume.score)}>
                      {matchPercentage}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Analyzed on {formatDate(match.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 line-clamp-6">
                  {match.jobDescription}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.gapAnalysis.map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Draft */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {match.emailDraft}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function extractJobTitle(jobDescription: string): string {
  const lines = jobDescription.split('\n').filter(line => line.trim())
  const firstLine = lines[0]?.trim() || 'Job Position'
  
  // Clean up common prefixes
  return firstLine
    .replace(/^(job title|position|role):\s*/i, '')
    .replace(/^(we are looking for|seeking|hiring)\s*/i, '')
    .slice(0, 60)
}

