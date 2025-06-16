
// src/components/features/dashboard/dashboard-overview.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useResumes } from '@/hooks/useResumes'
import { analyticsAPI } from '@/lib/api'
import { 
  FileText, 
  Search, 
  Upload, 
  TrendingUp, 
  Users, 
  Mail,
  Target,
  Clock,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface DashboardStats {
  totalResumes: number
  totalMatches: number
  avgMatchScore: number
  totalContacts: number
}

export function DashboardOverview() {
  const { user } = useUser()
  const { resumes, loading: resumesLoading } = useResumes()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  const loadStats = async () => {
    try {
      if (user?.id) {
        const data = await analyticsAPI.getStats(user.id)
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (resumesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const hasResumes = resumes.length > 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {hasResumes 
              ? "Ready to find your next opportunity?" 
              : "Let's get started by uploading your first resume"
            }
          </p>
        </div>
        {hasResumes && (
          <Button asChild size="lg" className="mt-4 sm:mt-0">
            <Link href="/match">
              <Search className="h-4 w-4 mr-2" />
              Find Job Match
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      {!hasResumes ? (
        <EmptyStateOnboarding />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Resumes"
              value={stats?.totalResumes || 0}
              icon={<FileText className="h-5 w-5" />}
              description="In your library"
              color="blue"
            />
            <StatsCard
              title="Job Matches"
              value={stats?.totalMatches || 0}
              icon={<Target className="h-5 w-5" />}
              description="Analyzed this month"
              color="green"
            />
            <StatsCard
              title="Avg. Match Score"
              value={`${Math.round((stats?.avgMatchScore || 0) * 100)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Success rate"
              color="purple"
            />
            <StatsCard
              title="Contacts Found"
              value={stats?.totalContacts || 0}
              icon={<Users className="h-5 w-5" />}
              description="Potential connections"
              color="orange"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <QuickActionCard
              title="Upload New Resume"
              description="Add another resume variant to your library"
              icon={<Upload className="h-8 w-8 text-blue-600" />}
              href="/resumes"
              action="Upload"
            />
            <QuickActionCard
              title="Find Job Match"
              description="Analyze a new job posting with AI"
              icon={<Search className="h-8 w-8 text-green-600" />}
              href="/match"
              action="Analyze"
            />
            <QuickActionCard
              title="View History"
              description="Review your past job analyses"
              icon={<Clock className="h-8 w-8 text-purple-600" />}
              href="/history"
              action="View"
            />
          </div>

          {/* Recent Resumes */}
          <RecentResumesSection resumes={resumes.slice(0, 3)} />
        </>
      )}
    </div>
  )
}

function EmptyStateOnboarding() {
  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="py-12">
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Welcome to JobAssist AI!"
          description="Upload your first resume to start getting AI-powered job matching and insights. You can upload multiple resume variants for different types of roles."
          action={{
            label: "Upload Your First Resume",
            onClick: () => window.location.href = '/resumes'
          }}
        />
      </CardContent>
    </Card>
  )
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  description, 
  color 
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  action 
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  action: string
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <Link href={href}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 text-center">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
            {action}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}

function RecentResumesSection({ resumes }: { resumes: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Resumes</CardTitle>
          <CardDescription>Your latest uploaded resumes</CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/resumes">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{resume.fileName}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatDate(resume.createdAt)}
                  </p>
                </div>
              </div>
              {resume.isDefault && (
                <Badge variant="success">Default</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}