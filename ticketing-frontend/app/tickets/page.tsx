import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { TicketsContent } from './TicketsContent'

export default async function TicketsPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <TicketsContent />
}

