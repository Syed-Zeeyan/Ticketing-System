'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Status, Priority } from '@/lib/types'
import { User, MessageSquare, ArrowUp, MoreVertical, X } from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'
import Link from 'next/link'

interface KanbanCardProps {
  ticket: Ticket
  isDragging?: boolean
}

export function KanbanCard({ ticket, isDragging }: KanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [note, setNote] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      type: 'ticket',
      ticket,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const priorityColors = {
    [Priority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [Priority.CRITICAL]: 'status-urgent',
  }

  const handleAssign = async () => {
    try {
      const response = await apiClient.get('/users')
      const users = response.data
      const agents = users.filter((u: any) => u.role === 'AGENT' || u.role === 'ADMIN')
      if (agents.length > 0) {
        await apiClient.post(`/tickets/${ticket.id}/assign`, {
          assigneeId: agents[0].id,
        })
        mutate('/tickets')
        setShowActions(false)
      }
    } catch (error) {
      console.error('Failed to assign ticket')
    }
  }

  const handleEscalate = async () => {
    try {
      const priorityOrder = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL]
      const currentIndex = priorityOrder.indexOf(ticket.priority)
      if (currentIndex < priorityOrder.length - 1) {
        const newPriority = priorityOrder[currentIndex + 1]
        await apiClient.patch(`/tickets/${ticket.id}`, {
          priority: newPriority,
        })
        mutate('/tickets')
        setShowActions(false)
      }
    } catch (error) {
      console.error('Failed to escalate ticket')
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    try {
      await apiClient.post(`/tickets/${ticket.id}/comments`, { content: note })
      mutate('/tickets')
      setNote('')
      setShowNoteModal(false)
      setShowActions(false)
    } catch (error) {
      console.error('Failed to add note')
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`card cursor-grab active:cursor-grabbing ${
            isDragging ? 'shadow-2xl rotate-3' : ''
          }`}
        >
          <Link href={`/tickets/${ticket.id}`} className="block">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                {ticket.title}
              </h3>
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowActions(!showActions)
                    }}
                    className="ml-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {ticket.description}
            </p>

            <div className="flex items-center justify-between mb-2">
              <span className={`status-badge ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(ticket.createdAt), 'MMM d')}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{ticket.ownerName}</span>
            </div>
          </Link>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-gray-200 dark:border-gray-700 p-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAssign()
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Assign
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEscalate()
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Escalate
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowNoteModal(true)
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Note
                </h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your note..."
                className="input mb-4 min-h-[100px]"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="btn-primary"
                  disabled={!note.trim()}
                >
                  Add Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

