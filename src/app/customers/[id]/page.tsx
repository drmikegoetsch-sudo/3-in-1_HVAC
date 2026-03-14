import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_BADGE, shortDate } from '@/lib/constants'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, MapPin, ChevronLeft } from 'lucide-react'

export const revalidate = 0

const CATEGORY_LABELS: Record<string, string> = {
  part_needed:           'Part Needed',
  callback:              'Callback',
  cleanup:               'Cleanup',
  incomplete_work:       'Incomplete Work',
  billing:               'Billing',
  payment:               'Payment',
  warranty_registration: 'Warranty',
  other:                 'Other',
}

export default async function CustomerHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: customer }, { data: open }, { data: closed }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', id).single(),
    supabase
      .from('follow_up_items')
      .select('id, title, status, category, due_date, created_at, priority')
      .eq('customer_id', id)
      .is('archived_at', null)
      .neq('status', 'closed')
      .order('created_at', { ascending: false }),
    supabase
      .from('follow_up_items')
      .select('id, title, status, category, due_date, closed_at, created_at')
      .eq('customer_id', id)
      .is('archived_at', null)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false }),
  ])

  if (!customer) notFound()

  const openItems = open ?? []
  const closedItems = closed ?? []
  const totalCount = openItems.length + closedItems.length

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* Back link */}
      <Link
        href="/follow-ups"
        className="inline-flex items-center gap-1 text-[12px] text-[#8e8e93] hover:text-[#6e6e73] transition-colors mb-5"
      >
        <ChevronLeft size={14} />
        Follow-Ups
      </Link>

      {/* Customer info card */}
      <div
        className="bg-white rounded-[14px] p-5 mb-6"
        style={{ boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
              {customer.name}
            </h1>
            <div className="mt-2.5 space-y-1.5">
              {customer.phone && (
                <div className="flex items-center gap-2 text-[13px] text-[#f26a1b] font-medium">
                  <Phone size={13} className="shrink-0" />
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-[13px] text-[#6e6e73]">
                  <Mail size={13} className="shrink-0" />
                  {customer.email}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-[13px] text-[#8e8e93]">
                  <MapPin size={13} className="shrink-0" />
                  {customer.address}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[22px] font-semibold text-[#1d1d1f] tabular-nums">{totalCount}</div>
            <div className="text-[11px] text-[#8e8e93]">job{totalCount !== 1 ? 's' : ''} total</div>
          </div>
        </div>
      </div>

      {/* Open follow-ups */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="w-2 h-2 rounded-full bg-[#f26a1b] shrink-0" />
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Open</span>
          <span className="text-[11px] font-semibold text-[#8e8e93]">{openItems.length}</span>
        </div>

        {openItems.length === 0 ? (
          <p className="text-[13px] text-[#8e8e93] px-1">No open follow-ups</p>
        ) : (
          <div
            className="bg-white rounded-[14px] overflow-hidden"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            {openItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/follow-ups/${item.id}`}
                className={`flex items-start justify-between px-4 py-3.5 hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${
                  index < openItems.length - 1 ? 'border-b border-[#f5f5f7]' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-[#1d1d1f] truncate">{item.title}</div>
                  <div className="text-[12px] text-[#8e8e93] mt-0.5">
                    {CATEGORY_LABELS[item.category ?? ''] ?? item.category}
                    {item.created_at && (
                      <> · {shortDate(item.created_at)}</>
                    )}
                  </div>
                </div>
                <div className="shrink-0 ml-4 text-right space-y-1.5">
                  {item.status && (
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[item.status] ?? ''}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  )}
                  {item.due_date && (
                    <div className="text-[11px] text-[#8e8e93]">{shortDate(item.due_date)}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Closed follow-ups */}
      {closedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-2 h-2 rounded-full bg-[#d1d1d6] shrink-0" />
            <span className="text-[13px] font-semibold text-[#1d1d1f]">Closed</span>
            <span className="text-[11px] font-semibold text-[#8e8e93]">{closedItems.length}</span>
          </div>
          <div
            className="bg-white rounded-[14px] overflow-hidden"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            {closedItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/follow-ups/${item.id}`}
                className={`flex items-start justify-between px-4 py-3.5 hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${
                  index < closedItems.length - 1 ? 'border-b border-[#f5f5f7]' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-[#8e8e93] truncate">{item.title}</div>
                  <div className="text-[12px] text-[#c7c7cc] mt-0.5">
                    {CATEGORY_LABELS[item.category ?? ''] ?? item.category}
                    {item.created_at && (
                      <> · {shortDate(item.created_at)}</>
                    )}
                  </div>
                </div>
                <div className="shrink-0 ml-4 text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE['closed'] ?? ''}`}>
                    Closed
                  </span>
                  {(item.closed_at ?? item.due_date) && (
                    <div className="text-[11px] text-[#c7c7cc] mt-1">
                      {shortDate(item.closed_at ?? item.due_date)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
