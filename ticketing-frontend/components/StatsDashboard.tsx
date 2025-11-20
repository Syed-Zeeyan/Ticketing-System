'use client'

import { Ticket, Status, Priority } from '@/lib/types'
import { Ticket as TicketIcon, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsDashboardProps {
  tickets: Ticket[]
  loading?: boolean
}

export function StatsDashboard({ tickets, loading }: StatsDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === Status.OPEN).length,
    inProgress: tickets.filter((t) => t.status === Status.IN_PROGRESS).length,
    resolved: tickets.filter((t) => t.status === Status.RESOLVED || t.status === Status.CLOSED)
      .length,
    critical: tickets.filter((t) => t.priority === Priority.CRITICAL).length,
    high: tickets.filter((t) => t.priority === Priority.HIGH).length,
  }

  const statCards = [
    {
      label: 'Total Tickets',
      value: stats.total,
      icon: TicketIcon,
      color: 'bg-blue-500',
    },
    {
      label: 'Open',
      value: stats.open,
      icon: AlertCircle,
      color: 'bg-green-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Priority Distribution
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Critical</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.critical}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.critical / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.high}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Open</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.open}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resolved</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.resolved}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

