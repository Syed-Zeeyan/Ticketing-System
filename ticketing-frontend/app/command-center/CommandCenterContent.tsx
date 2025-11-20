'use client'

import { Layout } from '@/components/Layout'
import { KanbanBoard } from '@/components/KanbanBoard'

export function CommandCenterContent() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tickets with drag and drop
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </div>
    </Layout>
  )
}

