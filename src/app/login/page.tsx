'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Something went wrong. Please try again.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-dark.svg"
            alt="3N1 HVAC"
            width={180}
            height={72}
            priority
            unoptimized
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] px-8 py-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#fff4ec] flex items-center justify-center mx-auto mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="#f26a1b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-2">Check your inbox</h2>
              <p className="text-[14px] text-[#6e6e73] leading-relaxed">
                We sent a sign-in link to<br />
                <span className="font-medium text-[#1d1d1f]">{email}</span>
              </p>
              <p className="text-[12px] text-[#aeaeb2] mt-4">
                Didn&apos;t get it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="text-[#f26a1b] hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            /* ── Login form ── */
            <>
              <h1 className="text-[20px] font-semibold text-[#1d1d1f] mb-1">Sign in</h1>
              <p className="text-[14px] text-[#6e6e73] mb-6">
                Enter your email and we&apos;ll send you a sign-in link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 uppercase tracking-wide"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@3n1hvac.com"
                    required
                    className="w-full px-4 py-3 rounded-[10px] border border-[#d1d1d6] bg-[#fafafa] text-[15px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none focus:border-[#f26a1b] focus:ring-2 focus:ring-[#f26a1b]/20 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-[10px] bg-[#f26a1b] text-white text-[15px] font-semibold tracking-[-0.01em] hover:bg-[#d4560d] active:bg-[#c24e0b] disabled:opacity-40 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                >
                  {loading ? 'Sending…' : 'Send Sign-In Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[12px] text-[#aeaeb2] mt-6">
          3N1 HVAC · Internal Use Only
        </p>
      </div>
    </div>
  )
}
