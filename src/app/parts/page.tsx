import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function PartsPage() {
  const { data: items } = await supabase
    .from('follow_up_detail')
    .select('*')
    .is('archived_at', null)
    .in('status', ['approved_order_part', 'waiting_on_part'])
    .order('due_date', { ascending: true })

  const toOrder  = items?.filter(i => i.status === 'approved_order_part') ?? []
  const onTheWay = items?.filter(i => i.status === 'waiting_on_part') ?? []

  function ItemList({ list }: { list: typeof toOrder }) {
    if (list.length === 0) {
      return <p className="text-[13px] text-[#8e8e93] py-2">None right now</p>
    }
    return (
      <div
        className="bg-white rounded-[12px] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        {list.map((item, index) => {
          const isLast = index === list.length - 1
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
                    {item.part_number ? ` · #${item.part_number}` : ''}
                  </div>
                )}
                {item.next_action && (
                  <div className="text-[12px] text-[#8e8e93] mt-1">→ {item.next_action}</div>
                )}
              </div>
              <div className="text-right shrink-0 ml-4 space-y-1">
                {item.part_eta && (
                  <div className="text-[12px] text-purple-600 font-medium">
                    ETA {new Date(item.part_eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {item.due_date && (
                  <div className="text-[12px] text-[#8e8e93]">
                    Due {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {item.priority === 'urgent' && (
                  <div className="text-[11px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded inline-block">
                    Urgent
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Parts</h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">Track approved parts from order through arrival</p>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#f26a1b]" />
          <span className="text-[13px] font-semibold text-[#1d1d1f]">To Order</span>
          <span className="text-[11px] font-semibold text-[#8e8e93]">{toOrder.length}</span>
        </div>
        <ItemList list={toOrder} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-[13px] font-semibold text-[#1d1d1f]">On the Way</span>
          <span className="text-[11px] font-semibold text-[#8e8e93]">{onTheWay.length}</span>
        </div>
        <ItemList list={onTheWay} />
      </div>
    </div>
  )
}
