import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  needs_pricing:          'Needs Pricing',
  waiting_quote_approval: 'Awaiting Approval',
  approved_order_part:    'Order Part',
  waiting_on_part:        'Waiting on Part',
  ready_to_schedule:      'Ready to Schedule',
  waiting_on_customer:    'Waiting on Customer',
  scheduled:              'Scheduled',
  billing_followup:       'Billing Follow-Up',
  closed:                 'Closed',
}

const STATUS_BADGE: Record<string, string> = {
  needs_pricing:          'bg-amber-50 text-amber-600',
  waiting_quote_approval: 'bg-blue-50 text-blue-600',
  approved_order_part:    'bg-orange-50 text-[#f26a1b]',
  waiting_on_part:        'bg-purple-50 text-purple-600',
  ready_to_schedule:      'bg-emerald-50 text-emerald-600',
  waiting_on_customer:    'bg-[#f5f5f7] text-[#6e6e73]',
  scheduled:              'bg-teal-50 text-teal-600',
  billing_followup:       'bg-red-50 text-red-500',
  closed:                 'bg-[#f5f5f7] text-[#8e8e93]',
}

const PRIORITY_BADGE: Record<string, string> = {
  urgent:   'bg-red-50 text-red-500',
  standard: 'bg-[#f5f5f7] text-[#6e6e73]',
  low:      'bg-[#f5f5f7] text-[#8e8e93]',
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  let query = supabase
    .from('follow_up_detail')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (params.status) query = query.eq('status', params.status as Database['public']['Enums']['follow_up_status'])

  const { data: items } = await query

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Follow-Ups</h1>
          <p className="text-[13px] text-[#6e6e73] mt-0.5">{items?.length ?? 0} open items</p>
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
      </div>

      {/* List */}
      {!items?.length ? (
        <div className="text-center py-20">
          <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
          <div className="text-[13px] text-[#8e8e93]">No open follow-ups</div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
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
              <Link key={item.id} href={`/follow-ups/${item.id}`} className={`block ${rowBase}`}>
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[1.8fr_2fr_1.4fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{item.customer_name}</div>
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
                <div className="md:hidden px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-[#1d1d1f] truncate">{item.customer_name}</div>
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
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
