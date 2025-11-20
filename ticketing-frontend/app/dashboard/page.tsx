import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <DashboardContent />
}

