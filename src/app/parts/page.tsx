import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const TABS = [
  { status: 'needs_pricing',       label: 'Needs Pricing' },
  { status: 'approved_order_part', label: 'Needs Ordering' },
  { status: 'waiting_on_part',     label: 'Waiting on Arrival' },
]

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const activeTab = params.tab ?? 'needs_pricing'

  const { data: items } = await supabase
    .from('follow_up_detail')
    .select('*')
    .eq('status', activeTab as 'needs_pricing' | 'approved_order_part' | 'waiting_on_part')
    .eq('requires_part', true)
    .order('due_date', { ascending: true })

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Parts</h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">Track part orders from pricing through arrival</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#e9e9eb] rounded-[10px] w-full sm:w-fit mb-6 overflow-x-auto">
        {TABS.map(({ status, label }) => (
          <Link
            key={status}
            href={`/parts?tab=${status}`}
            className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 ${
              activeTab === status
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                : 'text-[#6e6e73] hover:text-[#3d3d3f]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!items?.length ? (
        <div className="text-center py-16">
          <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
          <div className="text-[13px] text-[#8e8e93]">Nothing here</div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <Link
                key={item.id}
                href={`/follow-ups/${item.id}`}
                className={`flex items-start justify-between px-4 py-3.5 hover:bg-[#f9f9fb] transition-colors ${
                  !isLast ? 'border-b border-[#f5f5f7]' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{item.customer_name}</div>
                  <div className="text-[13px] text-[#6e6e73] mt-0.5">{item.title}</div>
                  {item.part_name && (
                    <div className="text-[12px] text-[#f26a1b] font-medium mt-1">
                      {item.vendor ? `${item.vendor} — ` : ''}{item.part_name}
                    </div>
                  )}
                  {item.next_action && (
                    <div className="text-[12px] text-[#8e8e93] mt-1">→ {item.next_action}</div>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4 space-y-1">
                  {item.due_date && (
                    <div className="text-[12px] text-[#8e8e93]">
                      Due {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {item.part_eta && (
                    <div className="text-[12px] text-purple-600 font-medium">
                      ETA {new Date(item.part_eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className={`text-[11px] font-medium capitalize inline-block px-2 py-0.5 rounded ${
                    item.priority === 'urgent' ? 'bg-red-50 text-red-500' :
                    item.priority === 'low'    ? 'bg-[#f5f5f7] text-[#8e8e93]' :
                    'bg-[#f5f5f7] text-[#6e6e73]'
                  }`}>
                    {item.priority}
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
