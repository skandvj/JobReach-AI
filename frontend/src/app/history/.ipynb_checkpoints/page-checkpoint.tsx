// src/app/history/page.tsx
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { JobHistory } from '@/components/features/history/job-history'

export default function HistoryPage() {
  return (
    <AppLayout>
      <JobHistory />
    </AppLayout>
  )
}
