// src/components/features/resumes/resume-manager.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { StatusBadge } from '@/components/ui/status-badge'
import { useResumes } from '@/hooks/useResumes'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Star,
  Eye,
  MoreVertical,
  Plus
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

export function ResumeManager() {
  const { 
    resumes, 
    loading, 
    uploading, 
    uploadProgress, 
    uploadResumes, 
    deleteResume, 
    setDefaultResume 
  } = useResumes()
  const [showUploader, setShowUploader] = useState(false)

  const handleFileUpload = async (files: File[]) => {
    await uploadResumes(files)
    setShowUploader(false)
  }

  const handleDownload = async (resume: any) => {
    try {
      // In a real app, this would trigger a download
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleDelete = async (resumeId: number) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      await deleteResume(resumeId)
    }
  }

  const handleSetDefault = async (resumeId: number) => {
    await setDefaultResume(resumeId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Library</h1>
          <p className="text-gray-600 mt-1">
            Manage your resume collection and upload new versions
          </p>
        </div>
        <Button 
          onClick={() => setShowUploader(true)}
          size="lg"
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      {/* Upload Interface */}
      {showUploader && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Resumes
            </CardTitle>
            <CardDescription>
              Add PDF or DOCX files to your resume library. You can upload multiple files at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onDrop={handleFileUpload}
              disabled={uploading}
              className="mb-4"
            />
            
            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium">Upload Progress</h4>
                {uploadProgress.map((item, index) => (
                  <UploadProgressItem key={index} item={item} />
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUploader(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Grid */}
      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="No resumes uploaded yet"
          description="Upload your first resume to start building your library. You can add multiple versions for different types of roles."
          action={{
            label: "Upload Your First Resume",
            onClick: () => setShowUploader(true)
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDownload={() => handleDownload(resume)}
              onDelete={() => handleDelete(resume.id)}
              onSetDefault={() => handleSetDefault(resume.id)}
            />
          ))}
        </div>
      )}

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Upload different resume versions for different types of roles (e.g., technical, managerial)</li>
            <li>• Use clear, descriptive filenames like "John_Doe_Software_Engineer_2024.pdf"</li>
            <li>• Keep your resumes updated with your latest experience and skills</li>
            <li>• Set your most versatile resume as default for quick job matching</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function UploadProgressItem({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium text-sm">{item.file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <StatusBadge status={item.status} />
        {item.status === 'uploading' && (
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ResumeCard({ 
  resume, 
  onDownload, 
  onDelete, 
  onSetDefault 
}: {
  resume: any
  onDownload: () => void
  onDelete: () => void
  onSetDefault: () => void
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            {resume.isDefault && (
              <Badge variant="success" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{resume.fileName}</CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Uploaded {formatDate(resume.createdAt)}</span>
            {resume.fileSize && <span>{formatFileSize(resume.fileSize)}</span>}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {!resume.isDefault && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onSetDefault}
                className="text-xs"
              >
                Set Default
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onDelete}
              className="text-destructive hover:bg-destructive hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
