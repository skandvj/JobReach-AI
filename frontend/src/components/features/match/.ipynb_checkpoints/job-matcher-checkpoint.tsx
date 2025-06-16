// src/components/features/match/job-matcher.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useJobMatching } from '@/hooks/useJobMatching'
import { useResumes } from '@/hooks/useResumes'
import { 
  Search, 
  FileText, 
  Users, 
  Mail, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  ExternalLink,
  Target,
  Lightbulb,
  Send,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { calculateMatchPercentage, getScoreColor, getScoreBadgeVariant } from '@/lib/utils'
import Link from 'next/link'

export function JobMatcher() {
  const { resumes } = useResumes()
  const { 
    currentMatch, 
    contacts, 
    loading, 
    loadingContacts, 
    findMatch, 
    submitFeedback,
    clearMatch
  } = useJobMatching()
  
  const [jobDescription, setJobDescription] = useState('')
  const [personalStory, setPersonalStory] = useState('')
  const [step, setStep] = useState<'input' | 'results'>('input')

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }

    try {
      await findMatch(jobDescription, personalStory)
      setStep('results')
    } catch (error) {
      console.error('Match error:', error)
    }
  }

  const handleStartOver = () => {
    setJobDescription('')
    setPersonalStory('')
    setStep('input')
    clearMatch()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleFeedback = (feedback: 1 | -1) => {
    if (currentMatch) {
      submitFeedback(currentMatch.id, feedback)
    }
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="h-16 w-16" />}
        title="No resumes found"
        description="You need to upload at least one resume before you can analyze job postings."
        action={{
          label: "Upload Resume",
          onClick: () => window.location.href = '/resumes'
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Matcher</h1>
          <p className="text-gray-600 mt-1">
            {step === 'input' 
              ? "Analyze any job posting with AI-powered insights"
              : "Your personalized job analysis results"
            }
          </p>
        </div>
        {step === 'results' && (
          <Button variant="outline" onClick={handleStartOver}>
            Analyze Another Job
          </Button>
        )}
      </div>

      {step === 'input' ? (
        <JobInputForm
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          personalStory={personalStory}
          setPersonalStory={setPersonalStory}
          onAnalyze={handleAnalyze}
          loading={loading}
          resumeCount={resumes.length}
        />
      ) : (
        <JobResults
          match={currentMatch}
          contacts={contacts}
          loadingContacts={loadingContacts}
          onFeedback={handleFeedback}
          onCopyEmail={(text) => copyToClipboard(text)}
        />
      )}
    </div>
  )
}

function JobInputForm({
  jobDescription,
  setJobDescription,
  personalStory,
  setPersonalStory,
  onAnalyze,
  loading,
  resumeCount
}: {
  jobDescription: string
  setJobDescription: (value: string) => void
  personalStory: string
  setPersonalStory: (value: string) => void
  onAnalyze: () => void
  loading: boolean
  resumeCount: number
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <p className="text-blue-800 text-sm mb-3">
                Paste any job description below and our AI will analyze it against your {resumeCount} resume{resumeCount !== 1 ? 's' : ''} to provide:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Best resume match with confidence score</li>
                <li>✓ Gap analysis and improvement suggestions</li>
                <li>✓ Relevant contacts at the company</li>
                <li>✓ Personalized outreach email template</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Job Description Analysis
          </CardTitle>
          <CardDescription>
            Paste the complete job posting for the most accurate analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description *</label>
            <Textarea
              placeholder="Paste the complete job description here, including requirements, responsibilities, and company information..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-gray-500">
              {jobDescription.length} characters • Include all details for best results
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Context (Optional)</label>
            <Textarea
              placeholder="Add any personal story, career transitions, or specific interests you'd like mentioned in outreach emails..."
              value={personalStory}
              onChange={(e) => setPersonalStory(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500">
              This helps personalize your outreach emails
            </p>
          </div>

          <Button 
            onClick={onAnalyze}
            disabled={!jobDescription.trim() || loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Job Posting
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function JobResults({
  match,
  contacts,
  loadingContacts,
  onFeedback,
  onCopyEmail
}: {
  match: any
  contacts: any[]
  loadingContacts: boolean
  onFeedback: (feedback: 1 | -1) => void
  onCopyEmail: (text: string) => void
}) {
  if (!match) return null

  const matchPercentage = calculateMatchPercentage(match.bestResume.score)

  return (
    <div className="space-y-8">
      {/* Match Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Best Resume Match
              </CardTitle>
              <CardDescription>AI analysis of your resume library</CardDescription>
            </div>
            <Badge 
              variant={getScoreBadgeVariant(match.bestResume.score)}
              className="text-lg px-3 py-1"
            >
              {matchPercentage}% Match
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold">{match.bestResume.fileName}</h4>
                  <p className="text-sm text-gray-600">Recommended resume</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(match.bestResume.score)}`}>
                  {matchPercentage}%
                </div>
                <Progress value={matchPercentage} className="w-24 mt-1" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Was this helpful?</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(1)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(-1)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Gap Analysis & Suggestions
            </CardTitle>
            <CardDescription>
              Ways to improve your resume for this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {match.gapAnalysis.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-yellow-800">{index + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Draft */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Outreach Email Draft
            </CardTitle>
            <CardDescription>
              Personalized email ready to send
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {match.emailDraft}
                </pre>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onCopyEmail(match.emailDraft)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.open(`mailto:?body=${encodeURIComponent(match.emailDraft)}`)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Open in Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Section */}
      <ContactsSection contacts={contacts} loading={loadingContacts} />
    </div>
  )
}

function ContactsSection({ contacts, loading }: { contacts: any[], loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Finding Contacts...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="mr-3" />
            <span className="text-gray-600">Searching for relevant contacts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Relevant Contacts ({contacts.length})
        </CardTitle>
        <CardDescription>
          People at the company who might be helpful to connect with
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No contacts found"
            description="We couldn't find specific contacts for this company. Try searching manually on LinkedIn."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact, index) => (
              <ContactCard key={index} contact={contact} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ContactCard({ contact }: { contact: any }) {
  const relevanceScore = Math.round(contact.mutualScore * 100)
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold">{contact.name}</h4>
          <p className="text-sm text-gray-600">{contact.role}</p>
          <p className="text-xs text-gray-500">{contact.company}</p>
        </div>
        <Badge variant={relevanceScore >= 80 ? 'success' : relevanceScore >= 60 ? 'warning' : 'outline'}>
          {relevanceScore}% relevant
        </Badge>
      </div>
      
      <div className="flex space-x-2">
        {contact.linkedinUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(contact.linkedinUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            LinkedIn
          </Button>
        )}
        {contact.email && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        )}
      </div>
    </div>
  )
}