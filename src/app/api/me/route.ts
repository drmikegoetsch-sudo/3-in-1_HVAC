import { createHmac } from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PIN_SESSION_MAX_AGE = 60 * 60 * 24 * 1000

function parsePinCookie(value: string): { name: string; email: string } | null {
  if (!process.env.PIN_SECRET) return null
  const parts = value.split(':')
  if (parts.length < 4) return null
  const [signature, name, email, timestampStr] = parts
  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) return null
  if (Date.now() - timestamp > PIN_SESSION_MAX_AGE) return null
  const expected = createHmac('sha256', process.env.PIN_SECRET)
    .update(`pin:${name}:${email}:${timestamp}`)
    .digest('hex')
  if (signature !== expected) return null
  return { name, email }
}

export async function GET() {
  const cookieStore = await cookies()

  // Check Supabase auth first
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Team',
      authType: 'magic_link',
    })
  }

  // Check PIN session
  const pinCookie = cookieStore.get('pin_session')
  if (pinCookie) {
    const pinUser = parsePinCookie(pinCookie.value)
    if (pinUser) {
      return NextResponse.json({
        id: null,
        email: pinUser.email,
        name: pinUser.name,
        authType: 'pin',
      })
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}
