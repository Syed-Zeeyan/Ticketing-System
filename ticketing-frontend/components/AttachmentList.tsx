'use client'

import { Attachment } from '@/lib/types'
import { Download, File, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api'

interface AttachmentListProps {
  attachments: Attachment[]
  onDelete?: (id: number) => Promise<void>
  canDelete?: boolean
}

export function AttachmentList({ attachments, onDelete, canDelete = false }: AttachmentListProps) {
  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await apiClient.get(`/files/${attachment.id}`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', attachment.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file')
    }
  }

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No attachments</p>
    )
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <motion.div
          key={attachment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <File className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {attachment.filename}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(attachment.createdAt), 'MMM d, yyyy')} by {attachment.uploadedByName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(attachment)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              aria-label="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(attachment.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                aria-label="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

