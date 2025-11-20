import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { AdminContent } from './AdminContent'

export default async function AdminPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <AdminContent />
}

