import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { TicketDetailContent } from './TicketDetailContent'

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <TicketDetailContent ticketId={params.id} />
}

