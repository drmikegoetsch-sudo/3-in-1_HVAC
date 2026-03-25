'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(
    urlError === 'user_limit'
      ? 'This app is at its maximum user capacity. Contact your administrator.'
      : urlError === 'auth'
      ? 'Sign-in failed. Please try again.'
      : ''
  )

  // PIN state
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  function handlePinDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...pin]
    next[index] = digit
    setPin(next)
    setPinError('')

    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus()
    }

    // Auto-submit when all 4 digits filled
    if (digit && index === 3) {
      const full = [...next].join('')
      if (full.length === 4) submitPin(full)
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
  }

  async function submitPin(code: string) {
    setPinLoading(true)
    setPinError('')
    const res = await fetch('/api/pin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: code }),
    })
    if (res.ok) {
      router.push('/follow-ups')
    } else {
      setPinError('Incorrect PIN. Try again.')
      setPin(['', '', '', ''])
      setPinLoading(false)
      pinRefs[0].current?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="3N1 HVAC" className="h-[72px] w-auto" />
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
            <>
              {/* ── Magic link form ── */}
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

                {error && <p className="text-[13px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-[10px] bg-[#f26a1b] text-white text-[15px] font-semibold tracking-[-0.01em] hover:bg-[#d4560d] active:bg-[#c24e0b] disabled:opacity-40 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                >
                  {loading ? 'Sending…' : 'Send Sign-In Link'}
                </button>
              </form>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#f0f0f5]" />
                <span className="text-[12px] text-[#aeaeb2] font-medium">or</span>
                <div className="flex-1 h-px bg-[#f0f0f5]" />
              </div>

              {/* ── PIN entry ── */}
              <div>
                <p className="text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide mb-3">
                  Team PIN
                </p>
                <div className="flex gap-3 justify-center">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={pinRefs[i]}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handlePinDigit(i, e.target.value)}
                      onKeyDown={e => handlePinKeyDown(i, e)}
                      disabled={pinLoading}
                      className={`w-14 h-14 text-center text-[22px] font-semibold rounded-[10px] border
                        ${pinError ? 'border-red-400 bg-red-50' : 'border-[#d1d1d6] bg-[#fafafa]'}
                        text-[#1d1d1f] outline-none focus:border-[#f26a1b] focus:ring-2 focus:ring-[#f26a1b]/20
                        transition-all disabled:opacity-50 caret-transparent`}
                    />
                  ))}
                </div>
                {pinError && (
                  <p className="text-[12px] text-red-500 text-center mt-2">{pinError}</p>
                )}
                {pinLoading && (
                  <p className="text-[12px] text-[#aeaeb2] text-center mt-2">Verifying…</p>
                )}
              </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
