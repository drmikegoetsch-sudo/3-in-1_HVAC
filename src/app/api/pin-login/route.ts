import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

type PinUser = { name: string; email: string }

function lookupPin(pin: string): PinUser | null {
  const entries = (process.env.PIN_USERS ?? '').split(',')
  for (const entry of entries) {
    const [p, name, email] = entry.split(':')
    if (p === pin && name && email) return { name, email }
  }
  return null
}

function signCookie(name: string, email: string, timestamp: number): string {
  return createHmac('sha256', process.env.PIN_SECRET!)
    .update(`pin:${name}:${email}:${timestamp}`)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  const { pin } = await request.json()
  if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 })

  const user = lookupPin(pin)
  if (!user) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })

  const timestamp = Date.now()
  const signature = signCookie(user.name, user.email, timestamp)
  const cookieValue = `${signature}:${user.name}:${user.email}:${timestamp}`

  const response = NextResponse.json({ ok: true, name: user.name })
  response.cookies.set('pin_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return response
}
