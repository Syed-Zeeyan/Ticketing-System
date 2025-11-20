'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, AlertTriangle, TrendingUp } from 'lucide-react'
import { TriagePrediction, Priority } from '@/lib/types'
import { apiClient } from '@/lib/api'

interface TriageSuggestionsProps {
  title: string
  description: string
  onApply: (prediction: TriagePrediction) => void
  onDismiss: () => void
}

export function TriageSuggestions({ title, description, onApply, onDismiss }: TriageSuggestionsProps) {
  const [prediction, setPrediction] = useState<TriagePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrediction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post('/triage/predict', { title, description })
      setPrediction(response.data)
    } catch (err) {
      setError('Failed to get suggestions')
    } finally {
      setLoading(false)
    }
  }, [title, description])

  useEffect(() => {
    if (title.trim() && description.trim()) {
      const timer = setTimeout(() => {
        fetchPrediction()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [title, description, fetchPrediction])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card border-l-4 border-primary"
      >
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing...</span>
        </div>
      </motion.div>
    )
  }

  if (error || !prediction) {
    return null
  }

  const priorityColors = {
    [Priority.LOW]: 'text-blue-600 dark:text-blue-400',
    [Priority.MEDIUM]: 'text-yellow-600 dark:text-yellow-400',
    [Priority.HIGH]: 'text-orange-600 dark:text-orange-400',
    [Priority.CRITICAL]: 'text-red-600 dark:text-red-400',
  }

  const confidencePercentage = Math.round(prediction.confidence * 100)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="card border-l-4 border-primary bg-primary-50 dark:bg-primary-900/20"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Suggestions</h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Suggested Priority</span>
              <span className={`text-sm font-medium ${priorityColors[prediction.suggestedPriority]}`}>
                {prediction.suggestedPriority}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Confidence: {confidencePercentage}%
            </p>
          </div>

          {prediction.predictedSlaBreachProbability > 0.5 && (
            <div className="flex items-center space-x-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-800 dark:text-orange-200">
                High SLA breach risk: {Math.round(prediction.predictedSlaBreachProbability * 100)}%
              </span>
            </div>
          )}

          {prediction.keywords && prediction.keywords.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key indicators:</p>
              <div className="flex flex-wrap gap-1">
                {prediction.keywords.map((keyword, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    {keyword}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => onApply(prediction)}
              className="flex-1 flex items-center justify-center space-x-2 btn-primary text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Suggestion</span>
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

