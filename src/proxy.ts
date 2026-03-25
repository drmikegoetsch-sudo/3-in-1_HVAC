import { createHmac } from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PIN_SESSION_MAX_AGE = 60 * 60 * 24 * 1000 // 24 hours in ms

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

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // Refresh session if it exists — keeps users logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Check for valid PIN session cookie
  const pinCookie = request.cookies.get('pin_session')
  const pinUser = pinCookie ? parsePinCookie(pinCookie.value) : null

  const isAuthenticated = !!user || !!pinUser

  const isPublic =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/intake') ||
    request.nextUrl.pathname.startsWith('/api/pin-login')

  // Not logged in → send to login
  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Already logged in → don't show login page
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/follow-ups', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon\\.svg|opengraph-image|.*\\.svg|.*\\.png|.*\\.ico).*)',
  ],
}
