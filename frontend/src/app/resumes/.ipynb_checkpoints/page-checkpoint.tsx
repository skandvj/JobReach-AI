// src/app/resumes/page.tsx
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { ResumeManager } from '@/components/features/resumes/resume-manager'

export default function ResumesPage() {
  return (
    <AppLayout>
      <ResumeManager />
    </AppLayout>
  )
}