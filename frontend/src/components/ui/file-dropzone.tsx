// src/components/ui/file-dropzone.tsx
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, File, X } from 'lucide-react'
import { Button } from './button'

interface FileDropzoneProps {
  onDrop: (files: File[]) => void
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function FileDropzone({
  onDrop,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  className,
  children
}: FileDropzoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragActive && !isDragReject && "border-gray-300 hover:border-gray-400",
          className
        )}
      >
        <input {...getInputProps()} />
        
        {children || (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg text-primary">Drop your files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag and drop your resumes here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, and DOCX files (max {Math.round(maxSize / 1024 / 1024)}MB each)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <div className="text-sm text-destructive">
                {errors.map(error => error.message).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}