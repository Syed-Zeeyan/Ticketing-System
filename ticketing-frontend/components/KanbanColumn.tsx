'use client'

import { useMemo } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Ticket, Status } from '@/lib/types'
import { KanbanCard } from './KanbanCard'
import { motion } from 'framer-motion'

interface KanbanColumnProps {
  status: Status
  title: string
  tickets: Ticket[]
}

export function KanbanColumn({ status, title, tickets }: KanbanColumnProps) {
  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets])

  const statusColors = {
    [Status.OPEN]: 'border-blue-500',
    [Status.IN_PROGRESS]: 'border-orange-500',
    [Status.RESOLVED]: 'border-green-500',
    [Status.CLOSED]: 'border-gray-500',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h2>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
          {tickets.length}
        </span>
      </div>

      <div
        className={`flex-1 h-full rounded-2xl border-2 border-dashed ${statusColors[status]} bg-gray-50 dark:bg-gray-800/50 p-3 overflow-y-auto overflow-x-hidden`}
      >
        <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <KanbanCard ticket={ticket} />
              </motion.div>
            ))}
            {tickets.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600">
                <p className="text-sm">No tickets</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

