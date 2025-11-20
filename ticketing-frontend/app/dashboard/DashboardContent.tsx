'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Ticket } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { StatsDashboard } from '@/components/StatsDashboard'
import { TicketList } from '@/components/TicketList'
import { TicketEditor } from '@/components/TicketEditor'
import { Plus } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'

export function DashboardContent() {
  const [showEditor, setShowEditor] = useState(false)
  const { data: tickets, error, isLoading } = useSWR<Ticket[]>('/tickets', fetcher)

  const handleCreateTicket = async (data: {
    title: string
    description: string
    priority: any
  }) => {
    await apiClient.post('/tickets', data)
    mutate('/tickets')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </button>
        </div>

        <StatsDashboard tickets={tickets || []} loading={isLoading} />

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Tickets
          </h2>
          <TicketList tickets={tickets || []} loading={isLoading} />
        </div>

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

