'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'

interface TicketRatingProps {
  ticketId: number
  currentRating?: number
  onRated?: () => void
}

export function TicketRating({ ticketId, currentRating, onRated }: TicketRatingProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setSubmitting(true)
    try {
      await apiClient.post(`/tickets/${ticketId}/rate`, {
        rating,
        feedback: feedback.trim() || undefined,
      })
      setSubmitted(true)
      mutate(`/tickets/${ticketId}`)
      onRated?.()
    } catch (error) {
      console.error('Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted || currentRating) {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (currentRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {currentRating || rating}/5
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Rate this ticket</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </motion.div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium mb-1">
          Feedback (optional)
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="input"
          placeholder="Share your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="btn-primary"
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  )
}

