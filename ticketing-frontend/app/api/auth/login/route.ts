import { NextRequest, NextResponse } from 'next/server'
import { setAuthTokens } from '@/lib/auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    
    if (!data.accessToken || !data.refreshToken) {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      )
    }

    await setAuthTokens(data.accessToken, data.refreshToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed', details: String(error) },
      { status: 500 }
    )
  }
}

