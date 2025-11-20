import { redirect } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import { CommandCenterContent } from './CommandCenterContent'

export default async function CommandCenterPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')
  }

  return <CommandCenterContent />
}

