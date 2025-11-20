import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken, setAuthTokens } from '@/lib/auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshToken()
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    await setAuthTokens(data.accessToken, data.refreshToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}

