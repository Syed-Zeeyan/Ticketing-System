'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Ticket, Status } from '@/lib/types'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { motion } from 'framer-motion'

const columns: { id: Status; title: string }[] = [
  { id: Status.OPEN, title: 'Open' },
  { id: Status.IN_PROGRESS, title: 'In Progress' },
  { id: Status.RESOLVED, title: 'Resolved' },
  { id: Status.CLOSED, title: 'Closed' },
]

export function KanbanBoard() {
  const { data: tickets, isLoading } = useSWR<Ticket[]>('/tickets', fetcher)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [ticketsByStatus, setTicketsByStatus] = useState<Record<Status, Ticket[]>>({
    [Status.OPEN]: [],
    [Status.IN_PROGRESS]: [],
    [Status.RESOLVED]: [],
    [Status.CLOSED]: [],
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (tickets) {
      const grouped = tickets.reduce(
        (acc, ticket) => {
          if (!acc[ticket.status]) {
            acc[ticket.status] = []
          }
          acc[ticket.status].push(ticket)
          return acc
        },
        {
          [Status.OPEN]: [],
          [Status.IN_PROGRESS]: [],
          [Status.RESOLVED]: [],
          [Status.CLOSED]: [],
        } as Record<Status, Ticket[]>
      )
      setTicketsByStatus(grouped)
    }
  }, [tickets])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as number
    const overId = over.id

    const activeTicket = findTicket(activeId)
    if (!activeTicket) return

    if (typeof overId === 'string' && Object.values(Status).includes(overId as Status)) {
      const newStatus = overId as Status
      if (activeTicket.status !== newStatus) {
        setTicketsByStatus((prev) => {
          const newState = { ...prev }
          newState[activeTicket.status] = newState[activeTicket.status].filter(
            (t) => t.id !== activeId
          )
          if (!newState[newStatus].find((t) => t.id === activeId)) {
            newState[newStatus] = [
              ...newState[newStatus],
              { ...activeTicket, status: newStatus },
            ]
          }
          return newState
        })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as number
    const activeTicket = findTicket(activeId)
    if (!activeTicket) return

    const overId = over.id

    if (typeof overId === 'string' && Object.values(Status).includes(overId as Status)) {
      const newStatus = overId as Status
      if (activeTicket.status !== newStatus) {
        try {
          await apiClient.post(`/tickets/${activeId}/status`, { status: newStatus })
          mutate('/tickets')
        } catch (error) {
          setTicketsByStatus((prev) => {
            const newState = { ...prev }
            newState[newStatus] = newState[newStatus].filter((t) => t.id !== activeId)
            newState[activeTicket.status] = [...newState[activeTicket.status], activeTicket]
            return newState
          })
        }
      }
    } else if (typeof overId === 'number') {
      const overTicket = findTicket(overId)
      if (!overTicket || activeTicket.status !== overTicket.status) return

      const oldIndex = ticketsByStatus[activeTicket.status].findIndex((t) => t.id === activeId)
      const newIndex = ticketsByStatus[overTicket.status].findIndex((t) => t.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        setTicketsByStatus((prev) => ({
          ...prev,
          [activeTicket.status]: arrayMove(prev[activeTicket.status], oldIndex, newIndex),
        }))
      }
    }
  }

  const findTicket = (id: number): Ticket | undefined => {
    for (const status of Object.values(Status)) {
      const ticket = ticketsByStatus[status].find((t) => t.id === id)
      if (ticket) return ticket
    }
    return undefined
  }

  const activeTicket = activeId ? findTicket(activeId) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 h-full">
        {columns.map((column, index) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex-shrink-0 w-80 h-full"
          >
            <KanbanColumn
              status={column.id}
              title={column.title}
              tickets={ticketsByStatus[column.id] || []}
            />
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="rotate-3 opacity-95">
            <KanbanCard ticket={activeTicket} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

