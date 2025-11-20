'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Ticket, Comment, Attachment, Status, Priority, User, Role } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { CommentThread } from '@/components/CommentThread'
import { AttachmentUploader } from '@/components/AttachmentUploader'
import { AttachmentList } from '@/components/AttachmentList'
import { TicketRating } from '@/components/TicketRating'
import { apiClient } from '@/lib/api'
import { mutate } from 'swr'
import { ArrowLeft, User as UserIcon, Calendar, AlertCircle, Tag, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TicketDetailContentProps {
  ticketId: string
}

export function TicketDetailContent({ ticketId }: TicketDetailContentProps) {
  const router = useRouter()
  const { data: ticket, isLoading: ticketLoading } = useSWR<Ticket>(
    `/tickets/${ticketId}`,
    fetcher
  )
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const { data: currentUser } = useSWR<User>('/auth/me', fetcher)

  useEffect(() => {
    if (ticket) {
      const loadComments = async () => {
        try {
          const response = await apiClient.get(`/tickets/${ticketId}/comments`)
          setComments(response.data || [])
        } catch (err) {
          setComments([])
        }
      }
      const loadAttachments = async () => {
        try {
          const response = await apiClient.get(`/tickets/${ticketId}/attachments`)
          setAttachments(response.data || [])
        } catch (err) {
          setAttachments([])
        }
      }
      loadComments()
      loadAttachments()
    }
  }, [ticket, ticketId])

  const handleAddComment = async (content: string) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, { content })
    setComments([...comments, response.data])
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setAttachments([...attachments, response.data])
    mutate(`/tickets/${ticketId}`)
  }

  const handleStatusChange = async (newStatus: Status) => {
    try {
      await apiClient.post(`/tickets/${ticketId}/status`, { status: newStatus })
      mutate(`/tickets/${ticketId}`)
      mutate('/tickets')
    } catch (err) {
      console.error('Failed to update ticket status')
    }
  }

  if (ticketLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Ticket not found</p>
        </div>
      </Layout>
    )
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

  return (
    <Layout>
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {ticket.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  <span
                    className={`status-badge ${priorityColors[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span
                    className={statusClassMap[ticket.status]}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <UserIcon className="w-4 h-4 mr-2" />
              <span>
                Owner: <span className="font-medium">{ticket.ownerName}</span>
              </span>
            </div>
            {ticket.assigneeName && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>
                  Assigned to: <span className="font-medium">{ticket.assigneeName}</span>
                </span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Created: {format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm')}</span>
            </div>
            {ticket.slaDueAt && (
              <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>SLA: {format(new Date(ticket.slaDueAt), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
          </div>

          {(ticket.status === Status.OPEN || ticket.status === Status.IN_PROGRESS) && (
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => handleStatusChange(Status.RESOLVED)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Resolved</span>
              </button>
              <button
                onClick={() => handleStatusChange(Status.CLOSED)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Close Ticket</span>
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Attachments
            </h3>
            <AttachmentList attachments={attachments} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <AttachmentUploader onUpload={handleUpload} ticketId={ticket.id} />
          </div>
        </div>

        <div className="card">
          <CommentThread
            comments={comments || []}
            onAddComment={handleAddComment}
          />
        </div>

        {(ticket.status === Status.RESOLVED || ticket.status === Status.CLOSED) && 
         currentUser && 
         currentUser.role === Role.USER && 
         currentUser.id === ticket.ownerId && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rate this Ticket
            </h3>
            <TicketRating
              ticketId={ticket.id}
              currentRating={ticket.rating}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

