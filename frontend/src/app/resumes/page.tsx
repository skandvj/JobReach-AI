'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useDropzone } from 'react-dropzone'
import { resumeAPI, type Resume } from '@/lib/api'
import { formatDate, formatFileSize } from '@/lib/utils'
import { ArrowLeft, Upload, FileText, Trash2, Download } from 'lucide-react'
import Link from 'next/link'

export default function ResumesPage() {
  const { user } = useUser()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{file: File, progress: number, status: string}[]>([])

  useEffect(() => {
    if (user?.id) {
      loadResumes()
    }
  }, [user?.id])

  const loadResumes = async () => {
    try {
      if (user?.id) {
        const data = await resumeAPI.list(user.id)
        setResumes(data)
      }
    } catch (error) {
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user?.id) return

    setUploading(true)
    const progressItems = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))
    setUploadProgress(progressItems)

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      try {
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 50 } : item
        ))

        const resume = await resumeAPI.upload(file, user.id)
        
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 100, status: 'completed' } : item
        ))

        setResumes(prev => [...prev, resume])
      } catch (error) {
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'error' } : item
        ))
        console.error('Upload error:', error)
      }
    }

    setUploading(false)
    setTimeout(() => setUploadProgress([]), 3000)
  }, [user?.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: true,
    disabled: uploading
  })

  const deleteResume = async (resumeId: number) => {
    if (!user?.id || !confirm('Are you sure you want to delete this resume?')) return

    try {
      await resumeAPI.delete(resumeId, user.id)
      setResumes(prev => prev.filter(r => r.id !== resumeId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Resume Library</h1>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop your files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag and drop your resumes here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, and DOCX files
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadProgress.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">{item.file.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'uploading' && (
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status === 'completed' ? 'Done' : 
                       item.status === 'error' ? 'Error' : 'Uploading'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume List */}
        {resumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
            <p className="text-gray-600">Upload your first resume to get started with AI-powered job matching.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{resume.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(resume.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {resume.fileSize ? formatFileSize(resume.fileSize) : 'Unknown size'}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteResume(resume.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
