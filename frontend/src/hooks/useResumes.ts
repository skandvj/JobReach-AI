// Updated src/hooks/useResumes.ts (Enhanced version)
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { resumeAPI } from '@/lib/api'
import type { Resume, UploadProgress } from '@/types'
import { toast } from 'sonner'

export function useResumes() {
  const { user } = useUser()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  useEffect(() => {
    if (user?.id) {
      loadResumes()
    }
  }, [user?.id])

  const loadResumes = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await resumeAPI.list(user.id)
      setResumes(data)
    } catch (error) {
      toast.error('Failed to load resumes')
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadResumes = async (files: File[]) => {
    if (!user?.id) return

    setUploading(true)
    const progressItems: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setUploadProgress(progressItems)

    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Update progress to uploading
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'uploading', progress: 25 } : item
          ))

          const resume = await resumeAPI.upload(file, user.id!)
          
          // Update progress to processing
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'processing', progress: 75 } : item
          ))

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Update progress to success
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'success', progress: 100 } : item
          ))

          return resume
        } catch (error) {
          // Update progress to error
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'error', progress: 0, error: 'Upload failed' } : item
          ))
          throw error
        }
      })

      const uploadedResumes = await Promise.allSettled(uploadPromises)
      const successful = uploadedResumes
        .filter((result): result is PromiseFulfilledResult<Resume> => result.status === 'fulfilled')
        .map(result => result.value)

      if (successful.length > 0) {
        setResumes(prev => [...prev, ...successful])
        toast.success(`Successfully uploaded ${successful.length} resume${successful.length > 1 ? 's' : ''}`)
      }

      const failed = uploadedResumes.filter(result => result.status === 'rejected').length
      if (failed > 0) {
        toast.error(`Failed to upload ${failed} file${failed > 1 ? 's' : ''}`)
      }

    } catch (error) {
      toast.error('Upload failed')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress([]), 3000)
    }
  }

  const deleteResume = async (resumeId: number) => {
    if (!user?.id) return

    try {
      await resumeAPI.delete(resumeId, user.id)
      setResumes(prev => prev.filter(r => r.id !== resumeId))
      toast.success('Resume deleted')
    } catch (error) {
      toast.error('Failed to delete resume')
      console.error('Delete error:', error)
    }
  }

  const setDefaultResume = async (resumeId: number) => {
    if (!user?.id) return

    try {
      await resumeAPI.setDefault(resumeId, user.id)
      setResumes(prev => prev.map(r => ({
        ...r,
        isDefault: r.id === resumeId
      })))
      toast.success('Default resume updated')
    } catch (error) {
      toast.error('Failed to set default resume')
      console.error('Set default error:', error)
    }
  }

  return {
    resumes,
    loading,
    uploading,
    uploadProgress,
    uploadResumes,
    deleteResume,
    setDefaultResume,
    refreshResumes: loadResumes
  }
}
