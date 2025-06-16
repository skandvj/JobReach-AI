import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Resume {
  id: number
  fileName: string
  filePath: string
  fileSize?: number
  createdAt: string
}

export interface JobMatch {
  id: number
  bestResume: {
    id: number
    fileName: string
    score: number
  }
  gapAnalysis: string[]
  emailDraft: string
  jobDescription: string
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

// Resume API
export const resumeAPI = {
  list: async (clerkUserId: string): Promise<Resume[]> => {
    const response = await api.get(`/resumes/?clerk_user_id=${clerkUserId}`);
    return response.data.resumes;
  },

  upload: async (file: File, clerkUserId: string): Promise<Resume> => {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('clerk_user_id', clerkUserId)
    
    const response = await api.post('/resumes/upload?clerk_user_id=${clerkUserId}', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return response.data
  },

  delete: async (resumeId: number, clerkUserId: string): Promise<void> => {
    await api.delete(`/resumes/${resumeId}?clerk_user_id=${clerkUserId}`)
  }
}

// Match API
export const matchAPI = {
  findMatch: async (request: {
    job_description: string
    personal_story?: string
  }, clerkUserId: string): Promise<JobMatch> => {
    const response = await api.post('/match/', request, {
      params: { clerk_user_id: clerkUserId }
    })
    return response.data
  },

  getHistory: async (clerkUserId: string): Promise<JobMatch[]> => {
    const response = await api.get(`/match/history?clerk_user_id=${clerkUserId}`)
    return response.data
  },

  submitFeedback: async (matchId: number, feedback: number, clerkUserId: string): Promise<void> => {
    await api.post(`/match/${matchId}/feedback`, { feedback }, {
      params: { clerk_user_id: clerkUserId }
    })
  }
}

// Contact API
export const contactAPI = {
  getContacts: async (matchId: number, clerkUserId: string): Promise<ContactInfo[]> => {
    const response = await api.get(`/contacts/${matchId}?clerk_user_id=${clerkUserId}`)
    return response.data
  }
}
