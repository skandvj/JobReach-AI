// src/app/settings/page.tsx
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { UserSettings } from '@/components/features/settings/user-settings'

export default function SettingsPage() {
  return (
    <AppLayout>
      <UserSettings />
    </AppLayout>
  )
}