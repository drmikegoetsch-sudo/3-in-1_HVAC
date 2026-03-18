import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/constants'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatusUpdater from './StatusUpdater'
import RestoreButton from './RestoreButton'
import CommunicationLogger from './CommunicationLogger'
import ArchiveButton from './ArchiveButton'

export const revalidate = 0 // always fresh for detail pages

const STATUS_TRANSITIONS: Record<string, string[]> = {
  needs_pricing:          ['waiting_quote_approval', 'ready_to_schedule', 'closed'],
  waiting_quote_approval: ['approved_order_part', 'ready_to_schedule', 'closed'],
  approved_order_part:    ['waiting_on_part', 'closed'],
  waiting_on_part:        ['ready_to_schedule', 'closed'],
  ready_to_schedule:      ['scheduled', 'waiting_on_customer', 'billing_followup'],
  waiting_on_customer:    ['scheduled', 'closed'],
  scheduled:              ['closed', 'billing_followup'],
  billing_followup:       ['closed'],
  closed:                 [],
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-[12px] ${className}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide mb-2">
      {children}
    </div>
  )
}

export default async function FollowUpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: item }, { data: part }, { data: comms }, { data: activity }] = await Promise.all([
    supabase.from('follow_up_items').select('*, customers(*), technicians(*)').eq('id', id).single(),
    supabase.from('parts_requests').select('*').eq('follow_up_item_id', id).maybeSingle(),
    supabase.from('communications').select('*').eq('follow_up_item_id', id).order('sent_at', { ascending: false }),
    supabase.from('activity_log').select('*').eq('follow_up_item_id', id).order('created_at', { ascending: false }),
  ])

  if (!item) notFound()

  const customer = item.customers as { name: string; phone: string | null; email: string | null; address: string | null } | null
  const technician = item.technicians as { name: string } | null
  const nextStatuses = STATUS_TRANSITIONS[item.status] ?? []

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-2.5 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[item.status] ?? ''}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <span className="text-[13px] text-[#8e8e93]">·</span>
              <span className="text-[13px] text-[#6e6e73] capitalize">{item.priority} priority</span>
              <span className="text-[13px] text-[#8e8e93]">·</span>
              <span className="text-[13px] text-[#8e8e93]">
                {new Date(item.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Customer */}
          <Card>
            <div className="px-4 pt-4 pb-1">
              <SectionLabel>Customer</SectionLabel>
            </div>
            <div className="px-4 pb-4 space-y-px">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-[14px] font-medium text-[#1d1d1f]">{customer?.name}</div>
                <Link
                  href={`/customers/${item.customer_id}`}
                  className="text-[11px] text-[#f26a1b] hover:text-[#d4560d] shrink-0 transition-colors"
                >
                  View history →
                </Link>
              </div>
              {customer?.phone && (
                <div className="text-[13px] text-[#f26a1b] font-medium">{customer.phone}</div>
              )}
              {customer?.email && <div className="text-[13px] text-[#6e6e73]">{customer.email}</div>}
              {customer?.address && <div className="text-[13px] text-[#8e8e93]">{customer.address}</div>}
              {technician && (
                <div className="text-[12px] text-[#8e8e93] pt-1">Tech: {technician.name}</div>
              )}
            </div>
          </Card>

          {/* Description */}
          {item.description && (
            <Card>
              <div className="px-4 pt-4 pb-1">
                <SectionLabel>Description</SectionLabel>
              </div>
              <div className="px-4 pb-4">
                <p className="text-[13px] text-[#3d3d3f] whitespace-pre-wrap leading-relaxed">{item.description}</p>
              </div>
            </Card>
          )}

          {/* Part */}
          {part && (
            <Card>
              <div className="px-4 pt-4 pb-1">
                <SectionLabel>Part</SectionLabel>
              </div>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {[
                  ['Part', part.part_name],
                  ['Vendor', part.vendor],
                  ['Part #', part.part_number],
                  ['Model', part.model_number],
                  ['Serial', part.serial_number],
                  ['Cost', part.cost ? `$${part.cost}` : null],
                  ['Quoted', part.quoted_price ? `$${part.quoted_price}` : null],
                  ['ETA', part.eta_date ? new Date(part.eta_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-[11px] text-[#8e8e93] mb-0.5">{label}</div>
                    <div className="text-[13px] font-medium text-[#1d1d1f]">{value}</div>
                  </div>
                ))}
                <div>
                  <div className="text-[11px] text-[#8e8e93] mb-0.5">Order Status</div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                    part.order_status === 'received'    ? 'bg-emerald-50 text-emerald-600' :
                    part.order_status === 'ordered'     ? 'bg-blue-50 text-blue-600' :
                    part.order_status === 'backordered' ? 'bg-red-50 text-red-500' :
                    'bg-[#f5f5f7] text-[#6e6e73]'
                  }`}>
                    {part.order_status}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Communications */}
          <Card>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Communications</SectionLabel>
              </div>
              <CommunicationLogger followUpItemId={id} />
              {comms && comms.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {comms.map((c, i) => (
                    <div key={c.id} className={`text-[13px] ${i < comms.length - 1 ? 'pb-3 border-b border-[#f5f5f7]' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          c.direction === 'outbound' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {c.direction}
                        </span>
                        <span className="text-[12px] text-[#8e8e93] capitalize">{c.method}</span>
                        <span className="text-[12px] text-[#c7c7cc]">
                          {new Date(c.sent_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {c.summary && <p className="text-[#3d3d3f] leading-relaxed">{c.summary}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#8e8e93] mt-3">No communications logged yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:order-last order-first">

          {/* Status update */}
          <Card>
            <div className="px-4 pt-4 pb-4">
              <SectionLabel>Move To</SectionLabel>
              {nextStatuses.length > 0 ? (
                <StatusUpdater
                  itemId={id}
                  currentStatus={item.status}
                  nextStatuses={nextStatuses}
                  statusLabels={STATUS_LABELS}
                />
              ) : (
                <RestoreButton
                  itemId={id}
                  currentStatus={item.status ?? 'closed'}
                />
              )}
            </div>
          </Card>

          {/* Details */}
          <Card>
            <div className="px-4 pt-4 pb-4 space-y-4">
              <SectionLabel>Details</SectionLabel>
              <div>
                <div className="text-[11px] text-[#8e8e93] mb-0.5">Category</div>
                <div className="text-[13px] font-medium text-[#1d1d1f] capitalize">
                  {item.category?.replace(/_/g, ' ')}
                </div>
              </div>
              {item.due_date && (
                <div>
                  <div className="text-[11px] text-[#8e8e93] mb-0.5">Due Date</div>
                  <div className="text-[13px] font-medium text-[#1d1d1f]">
                    {new Date(item.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )}
              {item.next_action && (
                <div>
                  <div className="text-[11px] text-[#8e8e93] mb-0.5">Next Action</div>
                  <div className="text-[13px] font-medium text-[#1d1d1f]">{item.next_action}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Activity */}
          {activity && activity.length > 0 && (
            <Card>
              <div className="px-4 pt-4 pb-4">
                <SectionLabel>Activity</SectionLabel>
                <div className="space-y-3 mt-1">
                  {activity.slice(0, 8).map(a => (
                    <div key={a.id} className="text-[12px]">
                      <div className="font-medium text-[#1d1d1f] capitalize">
                        {a.action_type.replace(/_/g, ' ')}
                      </div>
                      {a.old_value && a.new_value && (
                        <div className="text-[#8e8e93] mt-0.5">
                          {a.old_value} → {a.new_value}
                        </div>
                      )}
                      {a.note && <div className="text-[#6e6e73] mt-0.5">{a.note}</div>}
                      <div className="text-[#c7c7cc] mt-0.5">
                        {new Date(a.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Archive */}
          <div className="px-1">
            <ArchiveButton itemId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
