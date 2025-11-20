import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { AgentContent } from './AgentContent'

export default async function AgentPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <AgentContent />
}

