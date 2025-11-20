'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { User, AdminStats } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { UserManagementTable } from '@/components/UserManagementTable'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'
import { motion } from 'framer-motion'
import { Users, Clock, AlertTriangle, Star } from 'lucide-react'

export function AdminContent() {
  const { data: users, error, isLoading } = useSWR<User[]>('/users', fetcher)
  const { data: stats } = useSWR<AdminStats>('/admin/stats', fetcher)

  const handleDelete = async (id: number) => {
    await apiClient.delete(`/users/${id}`)
    mutate('/users')
  }

  const statCards = [
    {
      label: 'Open Tickets',
      value: stats?.openCount || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Avg Resolution Time',
      value: stats?.avgResolutionTime ? `${stats.avgResolutionTime}h` : '0h',
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      label: 'SLA Breaches',
      value: stats?.slaBreaches || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      label: 'Avg Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0',
      icon: Star,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <Layout userRole="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
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
                  <div className={`${stat.color} p-3 rounded-2xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <UserManagementTable
          users={users || []}
          onDelete={handleDelete}
          loading={isLoading}
        />
      </div>
    </Layout>
  )
}

