import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Good morning</h1>
          <p className="text-[14px] text-[#6e6e73] mt-0.5">
            {totalOpen === 0
              ? 'Everything is caught up.'
              : `${totalOpen} item${totalOpen !== 1 ? 's' : ''} need attention`}
          </p>
        </div>
        <Link
          href="/follow-ups/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[13px] font-semibold rounded-[10px] transition-colors shrink-0 tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="text-[19px] font-light leading-none -mt-px">+</span>
          New Follow-Up
        </Link>
      </div>

      <div className="max-w-lg">
      {activeStatuses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
          <div className="text-[13px] text-[#8e8e93]">Nothing open</div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          {activeStatuses.map(({ key, label, href }, index) => {
            const c = counts[key] ?? { total: 0, overdue: 0 }
            const isLast = index === activeStatuses.length - 1
            return (
              <Link
                key={key}
                href={href}
                className={`flex items-center justify-between px-4 py-[11px] hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${
                  !isLast ? 'border-b border-[#f2f2f7]' : ''
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
      )}
      </div>
    </div>
  )
}
