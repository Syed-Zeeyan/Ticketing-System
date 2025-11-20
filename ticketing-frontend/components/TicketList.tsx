'use client'

import { TicketCard } from './TicketCard'
import { Ticket } from '@/lib/types'
import { motion } from 'framer-motion'

interface TicketListProps {
  tickets: Ticket[]
  loading?: boolean
}

export function TicketList({ tickets, loading }: TicketListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No tickets found</p>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent, ticketId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.href = `/tickets/${ticketId}`
    }
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
    >
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          role="listitem"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, ticket.id)}
        >
          <TicketCard ticket={ticket} />
        </motion.div>
      ))}
    </div>
  )
}

