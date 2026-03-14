import { supabase } from '@/lib/supabase'
import { STATUS_BADGE, PRIORITY_BADGE, SECTION_STATUSES, isOverdue } from '@/lib/constants'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

export const revalidate = 30

// Only statuses that live in Follow-Ups (others route to Parts/Schedule/Billing)
const STATUS_LABELS: Record<string, string> = {
  needs_pricing:          'Needs Pricing',
  waiting_quote_approval: 'Awaiting Approval',
  waiting_on_customer:    'Waiting on Customer',
  closed:                 'Closed',
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const isClosedView = params.status === 'closed'

  let query = supabase
    .from('follow_up_detail')
    .select('*')
    .is('archived_at', null)
    // Always exclude billing/payment category — those live in the Billing section
    .neq('category', 'billing' as never)
    .neq('category', 'payment' as never)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (isClosedView) {
    query = query.eq('status', 'closed' as Database['public']['Enums']['follow_up_status'])
  } else if (params.status) {
    query = query.eq('status', params.status as Database['public']['Enums']['follow_up_status'])
  } else {
    // All active: exclude closed and statuses that belong in other sections
    query = query.neq('status', 'closed' as Database['public']['Enums']['follow_up_status'])
    for (const s of SECTION_STATUSES) {
      query = query.neq('status', s as Database['public']['Enums']['follow_up_status'])
    }
  }

  const { data: items } = await query

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Follow-Ups</h1>
          <p className="text-[13px] text-[#6e6e73] mt-0.5">
            {isClosedView ? `${items?.length ?? 0} closed items` : `${items?.length ?? 0} open items`}
          </p>
        </div>
        <Link
          href="/follow-ups/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[13px] font-semibold rounded-[10px] transition-colors tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="text-[19px] font-light leading-none -mt-px">+</span>
          <span className="hidden sm:inline">New Follow-Up</span>
        </Link>
      </div>

      {/* Filters — horizontal scroll on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-none">
        <Link
          href="/follow-ups"
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors whitespace-nowrap ${
            !params.status
              ? 'bg-[#1d1d1f] text-white border-transparent'
              : 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'
          }`}
        >
          All
        </Link>
        {Object.entries(STATUS_LABELS).filter(([k]) => k !== 'closed').map(([k, v]) => (
          <Link
            key={k}
            href={`/follow-ups?status=${k}`}
            className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors whitespace-nowrap ${
              params.status === k
                ? 'bg-[#1d1d1f] text-white border-transparent'
                : 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'
            }`}
          >
            {v}
          </Link>
        ))}
        <Link
          href="/follow-ups?status=closed"
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors whitespace-nowrap ${
            isClosedView
              ? 'bg-[#1d1d1f] text-white border-transparent'
              : 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'
          }`}
        >
          Closed
        </Link>
      </div>

      {/* List */}
      {!items?.length ? (
        <div className="text-center py-20">
          <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
          <div className="text-[13px] text-[#8e8e93]">{isClosedView ? 'No closed items' : 'No open follow-ups'}</div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[1.8fr_2fr_1.4fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-2.5 border-b border-[#f2f2f7]">
            {['Customer', 'Issue', 'Status', 'Priority', 'Due', 'Tech'].map(h => (
              <div key={h} className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{h}</div>
            ))}
          </div>

          {items.map((item, index) => {
            const overdue = isOverdue(item.due_date)
            const isLast = index === items.length - 1
            const rowBase = `hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${!isLast ? 'border-b border-[#f5f5f7]' : ''} ${overdue ? 'bg-red-50/40 hover:bg-red-50/60' : ''}`

            return (
              <div key={item.id} className={`relative ${rowBase}`}>
                {/* Row background link → follow-up detail */}
                <Link href={`/follow-ups/${item.id}`} className="absolute inset-0 z-0" aria-label={item.title ?? ''} />
                {/* Desktop row */}
                <div className="relative z-10 hidden md:grid grid-cols-[1.8fr_2fr_1.4fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3">
                  <div>
                    {item.customer_id ? (
                      <Link href={`/customers/${item.customer_id}`} className="text-[13px] font-medium text-[#1d1d1f] hover:text-[#f26a1b] hover:underline truncate block transition-colors">
                        {item.customer_name}
                      </Link>
                    ) : (
                      <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{item.customer_name}</div>
                    )}
                    {item.customer_phone && (
                      <div className="text-[11px] text-[#8e8e93] mt-0.5">{item.customer_phone}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[13px] text-[#1d1d1f] truncate">{item.title}</div>
                    {item.next_action && (
                      <div className="text-[11px] text-[#6e6e73] mt-0.5 truncate">→ {item.next_action}</div>
                    )}
                  </div>
                  <div className="flex items-start">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[item.status ?? ''] ?? ''}`}>
                      {STATUS_LABELS[item.status ?? ''] ?? item.status}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${PRIORITY_BADGE[item.priority ?? ''] ?? ''}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="flex items-start pt-0.5">
                    {item.due_date ? (
                      <span className={`text-[12px] font-medium ${overdue ? 'text-red-500' : 'text-[#6e6e73]'}`}>
                        {overdue && '⚠ '}
                        {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#c7c7cc]">—</span>
                    )}
                  </div>
                  <div className="flex items-start pt-0.5">
                    <span className="text-[12px] text-[#6e6e73] truncate">{item.technician_name ?? '—'}</span>
                  </div>
                </div>

                {/* Mobile card row */}
                <div className="relative z-10 md:hidden px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      {item.customer_id ? (
                        <Link href={`/customers/${item.customer_id}`} className="text-[14px] font-medium text-[#1d1d1f] hover:text-[#f26a1b] truncate block transition-colors">
                          {item.customer_name}
                        </Link>
                      ) : (
                        <div className="text-[14px] font-medium text-[#1d1d1f] truncate">{item.customer_name}</div>
                      )}
                      <div className="text-[13px] text-[#6e6e73] mt-0.5 truncate">{item.title}</div>
                    </div>
                    <span className="text-[#c7c7cc] text-[14px] leading-none mt-0.5 shrink-0">›</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[item.status ?? ''] ?? ''}`}>
                      {STATUS_LABELS[item.status ?? ''] ?? item.status}
                    </span>
                    {item.priority === 'urgent' && (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-500">Urgent</span>
                    )}
                    {item.due_date && (
                      <span className={`text-[11px] font-medium ${overdue ? 'text-red-500' : 'text-[#8e8e93]'}`}>
                        {overdue ? '⚠ ' : ''}By {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {item.technician_name && (
                      <span className="text-[11px] text-[#8e8e93]">{item.technician_name}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
