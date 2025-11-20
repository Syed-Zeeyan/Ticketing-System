'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Ticket, Priority, Status, TicketSearchResponse } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { TicketList } from '@/components/TicketList'
import { TicketEditor } from '@/components/TicketEditor'
import { Plus, Search, Filter } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'

export function TicketsContent() {
  const [showEditor, setShowEditor] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  
  const searchParams = new URLSearchParams()
  if (searchQuery) searchParams.set('q', searchQuery)
  if (statusFilter) searchParams.set('status', statusFilter)
  if (priorityFilter) searchParams.set('priority', priorityFilter)
  searchParams.set('page', page.toString())
  searchParams.set('size', '20')

  const { data: searchResult, error, isLoading } = useSWR<TicketSearchResponse>(
    `/tickets/search?${searchParams.toString()}`,
    fetcher
  )

  const tickets = searchResult?.content || []
  const totalPages = searchResult?.totalPages || 0

  const handleCreateTicket = async (data: {
    title: string
    description: string
    priority: Priority
  }) => {
    await apiClient.post('/tickets', data)
    mutate(`/tickets/search?${searchParams.toString()}`)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search-tickets"
              name="search"
              type="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                id="status-filter"
                name="status"
                autoComplete="off"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 text-sm"
              >
                <option value="">All Status</option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <select
              id="priority-filter"
              name="priority"
              autoComplete="off"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setPage(0)
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 text-sm"
            >
              <option value="">All Priority</option>
              {Object.values(Priority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TicketList tickets={tickets} loading={isLoading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {showEditor && (
          <TicketEditor
            onSave={handleCreateTicket}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    </Layout>
  )
}

