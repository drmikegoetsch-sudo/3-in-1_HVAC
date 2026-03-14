import { supabase } from '@/lib/supabase'
import { getGreeting } from '@/lib/constants'
import Link from 'next/link'

export const revalidate = 30

const STATUSES = [
  { key: 'needs_pricing',          label: 'Needs Pricing',        href: '/follow-ups?status=needs_pricing' },
  { key: 'waiting_quote_approval', label: 'Awaiting Approval',    href: '/follow-ups?status=waiting_quote_approval' },
  { key: 'approved_order_part',    label: 'Order Part',           href: '/parts?tab=approved_order_part' },
  { key: 'waiting_on_part',        label: 'Waiting on Part',      href: '/parts?tab=waiting_on_part' },
  { key: 'ready_to_schedule',      label: 'Ready to Schedule',    href: '/schedule' },
  { key: 'waiting_on_customer',    label: 'Waiting on Customer',  href: '/follow-ups?status=waiting_on_customer' },
  { key: 'billing_followup',       label: 'Billing Follow-Up',    href: '/billing' },
]

export default async function DashboardPage() {
  const { data: summary } = await supabase
    .from('open_follow_ups_summary')
    .select('*')

  const counts: Record<string, { total: number; overdue: number }> = {}
  for (const row of summary ?? []) {
    const s = row.status!
    if (!counts[s]) counts[s] = { total: 0, overdue: 0 }
    counts[s].total += row.total ?? 0
    counts[s].overdue += row.overdue ?? 0
  }

  const totalOpen = Object.values(counts).reduce((a, b) => a + b.total, 0)
  const activeStatuses = STATUSES.filter(({ key }) => (counts[key]?.total ?? 0) > 0)

  /* ── Empty state: beautiful centered greeting ── */
  if (activeStatuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 min-h-[65vh] relative">
        {/* Soft radial glow behind everything */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(242,106,27,0.06) 0%, transparent 100%)',
          }}
        />

        {/* Animated check ring */}
        <div className="relative mb-6 empty-animate">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="block">
            {/* Outer dashed ring with gradient — slow spin */}
            <circle
              cx="36" cy="36" r="34"
              stroke="url(#ring-grad)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className="empty-ring"
            />
            {/* Inner circle */}
            <circle cx="36" cy="36" r="26" fill="white" />
            <circle cx="36" cy="36" r="26" fill="url(#inner-grad)" opacity="0.45" />
            {/* Checkmark draws in */}
            <path
              d="M26 36.5 L33 43 L46 29"
              stroke="#f26a1b"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="empty-check"
            />
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f26a1b" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f26a1b" stopOpacity="0.5" />
              </linearGradient>
              <radialGradient id="inner-grad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#f26a1b" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f26a1b" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Greeting */}
        <h1 className="text-[28px] md:text-[34px] font-semibold text-[#1d1d1f] tracking-tight empty-animate empty-animate-delay-1">
          {getGreeting()}
        </h1>
        <p className="text-[15px] md:text-[16px] text-[#8e8e93] mt-1.5 empty-animate empty-animate-delay-2">
          Everything is caught up.
        </p>

        {/* CTA — pill button with brand glow */}
        <Link
          href="/follow-ups/new"
          className="mt-8 inline-flex items-center gap-2 h-10 px-5 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[14px] font-semibold rounded-full transition-colors tracking-[-0.01em] shadow-[0_2px_8px_rgba(242,106,27,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] empty-animate empty-animate-delay-3"
        >
          <span className="text-[18px] font-light leading-none -mt-px">+</span>
          New Follow-Up
        </Link>
      </div>
    )
  }

  /* ── Active items: straight to business ── */
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-5">
        <p className="text-[14px] text-[#6e6e73]">
          {totalOpen} item{totalOpen !== 1 ? 's' : ''} need attention
        </p>
        <Link
          href="/follow-ups/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[13px] font-semibold rounded-[10px] transition-colors shrink-0 tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="text-[19px] font-light leading-none -mt-px">+</span>
          New Follow-Up
        </Link>
      </div>

      <div
        className="max-w-lg bg-white rounded-[12px] overflow-hidden"
        style={{ boxShadow: 'var(--card-shadow)' }}
      >
        {activeStatuses.map(({ key, label, href }, index) => {
          const c = counts[key] ?? { total: 0, overdue: 0 }
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center justify-between px-4 py-[11px] hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${
                index < activeStatuses.length - 1 ? 'border-b border-[#f2f2f7]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                    c.overdue > 0 ? 'bg-red-400' : 'bg-[#d1d1d6]'
                  }`}
                />
                <span className="text-[14px] text-[#1d1d1f]">{label}</span>
                {c.overdue > 0 && (
                  <span className="text-[11px] text-red-500 font-medium tabular-nums">
                    {c.overdue} overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#1d1d1f] tabular-nums">{c.total}</span>
                <span className="text-[#c7c7cc] text-[13px] leading-none">›</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
