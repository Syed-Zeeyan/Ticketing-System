'use client'

import { useState } from 'react'
import { Comment } from '@/lib/types'
import { User, Send } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface CommentThreadProps {
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  loading?: boolean
}

export function CommentThread({ comments, onAddComment, loading }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } catch (err) {
      console.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          id="comment-input"
          name="comment"
          type="text"
          autoComplete="off"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
          disabled={submitting || loading}
        />
        <button
          type="submit"
          disabled={submitting || loading || !newComment.trim()}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

