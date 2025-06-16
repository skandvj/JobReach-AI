// src/types/index.ts
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Resume {
  id: number
  fileName: string
  filePath: string
  fileSize?: number
  contentText?: string
  isDefault?: boolean
  createdAt: string
  updatedAt?: string
}

export interface JobMatch {
  id: number
  bestResume: {
    id: number
    fileName: string
    filePath: string
    content: string
    score: number
  }
  gapAnalysis: string[]
  emailDraft: string
  jobDescription: string
  matchScore: number
  feedbackScore?: number
  createdAt: string
}

export interface ContactInfo {
  name: string
  role: string
  company: string
  linkedinUrl?: string
  email?: string
  mutualScore: number
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
