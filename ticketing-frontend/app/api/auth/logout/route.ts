import { NextResponse } from 'next/server'
import { clearAuthTokens } from '@/lib/auth'

export async function POST() {
  await clearAuthTokens()
  return NextResponse.json({ success: true })
}

