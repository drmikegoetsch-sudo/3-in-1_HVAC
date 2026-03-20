import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Upsert the user's profile so their name appears in activity logs
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { error: profileError } = await supabase.from('user_profiles').upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name ?? user.email.split('@')[0],
        }, { onConflict: 'id' })

        // If the user limit trigger fired, sign them out and show a friendly error
        if (profileError?.message?.includes('user_limit_reached')) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=user_limit`)
        }
      }
      return NextResponse.redirect(`${origin}/follow-ups`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
