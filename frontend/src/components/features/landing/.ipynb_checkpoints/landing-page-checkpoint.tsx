// src/components/features/landing/landing-page.tsx
'use client'

import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Zap, 
  Users, 
  Mail, 
  Star, 
  ArrowRight,
  Check,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">JobAssist AI</span>
                <Badge variant="info" className="ml-2">Beta</Badge>
              </div>
            </div>
            <SignInButton mode="modal">
              <Button variant="outline" className="hidden sm:flex">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="info" className="mb-6 animate-fade-in">
              🚀 Now in Beta - Free Access
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 animate-fade-in">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Career Copilot
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in">
              Transform your job search with AI. Get instant resume matching, gap analysis, 
              and personalized outreach—all in under 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <SignInButton mode="modal">
                <Button size="xl" className="text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignInButton>
              <Button variant="outline" size="xl" className="text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 animate-fade-in">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-1">4.9/5 from beta users</span>
              </div>
              <div className="text-gray-300">•</div>
              <span>500+ resumes analyzed</span>
              <div className="text-gray-300">•</div>
              <span>80%+ success rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to land your dream job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform streamlines your entire job application process
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="Instant Matching"
              description="AI analyzes your resumes and finds the perfect match for any job in seconds"
              highlight="< 5 seconds"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-green-600" />}
              title="Gap Analysis"
              description="Get specific, actionable suggestions to optimize your resume for each role"
              highlight="80%+ accuracy"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-purple-600" />}
              title="Contact Discovery"
              description="Find relevant people at target companies with warm connection opportunities"
              highlight="10+ contacts"
            />
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-orange-600" />}
              title="Smart Outreach"
              description="Generate personalized emails that actually get responses from recruiters"
              highlight="25%+ response rate"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get from job posting to personalized outreach in 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="Upload Your Resumes"
                description="Upload multiple resume versions to build your smart library"
                details={["PDF & DOCX support", "Automatic text extraction", "Smart categorization"]}
              />
              <StepCard
                number="2"
                title="Paste Job Description"
                description="Copy any job posting and let our AI analyze the requirements"
                details={["Instant parsing", "Skill extraction", "Requirement matching"]}
              />
              <StepCard
                number="3"
                title="Get Complete Package"
                description="Receive matched resume, insights, contacts, and email draft"
                details={["Best resume match", "Gap analysis", "Contact discovery", "Email template"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Proven Results from Beta Users
            </h2>
            <p className="text-xl text-gray-300">
              Real metrics from job seekers using JobAssist AI
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard
              value="< 5min"
              label="Average Prep Time"
              description="Down from 40+ minutes"
              icon={<Zap className="h-8 w-8 text-blue-400" />}
            />
            <StatCard
              value="25%+"
              label="Response Rate Increase"
              description="More recruiter replies"
              icon={<TrendingUp className="h-8 w-8 text-green-400" />}
            />
            <StatCard
              value="80%+"
              label="Match Accuracy"
              description="User satisfaction rate"
              icon={<Target className="h-8 w-8 text-purple-400" />}
            />
            <StatCard
              value="500+"
              label="Resumes Analyzed"
              description="And growing daily"
              icon={<Shield className="h-8 w-8 text-orange-400" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of job seekers already using AI to land their dream roles
          </p>
          <SignInButton mode="modal">
            <Button size="xl" variant="secondary" className="text-lg px-8 py-4">
              Start Free Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignInButton>
          <p className="text-sm mt-4 opacity-75">
            No credit card required • Free during beta • Premium features included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold">JobAssist AI</span>
                <p className="text-sm text-gray-400">Empowering careers with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  highlight 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
  highlight: string
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <Badge variant="outline" className="w-fit mx-auto">{highlight}</Badge>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ 
  number, 
  title, 
  description, 
  details 
}: { 
  number: string
  title: string
  description: string
  details: string[]
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {details.map((detail, index) => (
          <li key={index} className="flex items-center justify-center text-sm text-gray-500">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatCard({ 
  value, 
  label, 
  description, 
  icon 
}: { 
  value: string
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 w-fit">
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-lg font-medium mb-1">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  )
}