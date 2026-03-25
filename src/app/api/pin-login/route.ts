import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function signPinCookie(timestamp: number): string {
  return createHmac('sha256', process.env.PIN_SECRET!)
    .update(`pin:${timestamp}`)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  const { pin } = await request.json()

  if (!pin || pin !== process.env.TEAM_PIN) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  const timestamp = Date.now()
  const signature = signPinCookie(timestamp)
  const cookieValue = `${signature}:${timestamp}`

  const response = NextResponse.json({ ok: true })
  response.cookies.set('pin_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  return response
}
