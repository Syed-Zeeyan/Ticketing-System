'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AttachmentUploaderProps {
  onUpload: (file: File) => Promise<void>
  ticketId: number
}

export function AttachmentUploader({ onUpload, ticketId }: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain']
  const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf', '.txt']

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError('File type not allowed. Allowed: PNG, JPG, PDF, TXT')
      return
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      setError('File type not allowed. Allowed: PNG, JPG, PDF, TXT')
      return
    }

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onUpload(file)

      setProgress(100)
      clearInterval(progressInterval)

      setTimeout(() => {
        setUploading(false)
        setProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 500)
    } catch (err) {
      setError('Failed to upload file')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h3>
        <label className="cursor-pointer">
          <input
            id="file-upload"
            name="file"
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </div>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <File className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Uploading...
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div
                    className="bg-primary-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {progress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

