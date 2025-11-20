import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = await getTokenFromCookie()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
        })

        if (response.ok) {
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

async function getTokenFromCookie(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/auth/token', { 
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        return data.token || null
      }
    } catch (err) {
      console.error('Failed to get token from cookie:', err)
      return null
    }
  }
  return null
}

export { getTokenFromCookie }

