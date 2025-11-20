import { getAuthToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function serverFetcher(url: string) {
  const token = await getAuthToken()
  
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  return response.json()
}

