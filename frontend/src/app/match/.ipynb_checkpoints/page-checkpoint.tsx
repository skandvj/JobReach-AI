// src/app/match/page.tsx
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { JobMatcher } from '@/components/features/match/job-matcher'

export default function MatchPage() {
  return (
    <AppLayout>
      <JobMatcher />
    </AppLayout>
  )
}