'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Ticket, Status, User } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { TicketList } from '@/components/TicketList'
import { StatsDashboard } from '@/components/StatsDashboard'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'

export function AgentContent() {
  const { data: tickets, isLoading } = useSWR<Ticket[]>('/tickets', fetcher)
  const { data: users } = useSWR<User[]>('/users', fetcher)

  const handleStatusChange = async (ticketId: number, status: Status) => {
    await apiClient.post(`/tickets/${ticketId}/status`, { status })
    mutate('/tickets')
  }

  const handleAssign = async (ticketId: number, assigneeId: number) => {
    await apiClient.post(`/tickets/${ticketId}/assign`, { assigneeId })
    mutate('/tickets')
  }

  const unassignedTickets = tickets?.filter((t) => !t.assigneeId) || []
  const assignedTickets = tickets?.filter((t) => t.assigneeId) || []

  return (
    <Layout userRole="AGENT">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>

        <StatsDashboard tickets={tickets || []} loading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Unassigned Tickets
              </h2>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                {unassignedTickets.length}
              </span>
            </div>
            <div className="space-y-4">
              {unassignedTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {ticket.description.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleStatusChange(ticket.id, Status.IN_PROGRESS)}
                        className="flex items-center space-x-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Take</span>
                      </button>
                      {users && (
                        <select
                          id={`assign-${ticket.id}`}
                          name="assignee"
                          autoComplete="off"
                          onChange={(e) =>
                            handleAssign(ticket.id, parseInt(e.target.value))
                          }
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        >
                          <option value="">Assign to...</option>
                          {users
                            .filter((u) => u.role === 'AGENT' || u.role === 'ADMIN')
                            .map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.fullName}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assigned Tickets
              </h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                {assignedTickets.length}
              </span>
            </div>
            <div className="space-y-4">
              {assignedTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Assigned to: {ticket.assigneeName}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleStatusChange(ticket.id, Status.RESOLVED)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(ticket.id, Status.CLOSED)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All Tickets
          </h2>
          <TicketList tickets={tickets || []} loading={isLoading} />
        </div>
      </div>
    </Layout>
  )
}

