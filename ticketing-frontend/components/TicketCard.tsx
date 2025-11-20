'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Ticket, Clock, User, AlertCircle } from 'lucide-react'
import { Ticket as TicketType, Priority, Status } from '@/lib/types'
import { format } from 'date-fns'

interface TicketCardProps {
  ticket: TicketType
}

const priorityColors = {
  [Priority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [Priority.CRITICAL]: 'status-urgent',
}

const statusClassMap = {
  [Status.OPEN]: 'status-open',
  [Status.IN_PROGRESS]: 'status-in-progress',
  [Status.RESOLVED]: 'status-resolved',
  [Status.CLOSED]: 'status-closed',
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card hover:shadow-soft-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {ticket.title}
            </h3>
          </div>
          <div className="flex space-x-2">
            <span
              className={`status-badge ${priorityColors[ticket.priority]}`}
            >
              {ticket.priority}
            </span>
            <span
              className={statusClassMap[ticket.status]}
            >
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{ticket.ownerName}</span>
            </div>
            {ticket.assigneeName && (
              <div className="flex items-center">
                <span className="mr-1">→</span>
                <span>{ticket.assigneeName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {ticket.slaDueAt && (
          <div className="mt-3 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
            <span className="text-orange-600 dark:text-orange-400">
              SLA: {format(new Date(ticket.slaDueAt), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

