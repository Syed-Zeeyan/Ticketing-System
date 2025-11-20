import { getTokenFromCookie } from './api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function fetcher(url: string) {
  const token = await getTokenFromCookie()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login'
        throw new Error('Not authenticated')
      }
    }
  }

  const response = await fetch(`${API_URL}${url}`, {
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login'
        }
      }
      throw new Error(response.status === 401 ? 'Unauthorized' : 'Forbidden')
    }
    throw new Error('Failed to fetch')
  }

  return response.json()
}

