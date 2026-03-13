import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ closed?: string }>
}) {
  const params = await searchParams
  const isClosedView = params.closed === '1'

  const { data: items } = isClosedView
    ? await supabase
        .from('follow_up_detail')
        .select('*')
        .is('archived_at', null)
        .eq('status', 'closed' as never)
        .or('category.eq.billing,category.eq.payment')
        .order('due_date', { ascending: false })
    : await supabase
        .from('follow_up_detail')
        .select('*')
        .is('archived_at', null)
        .neq('status', 'closed' as never)
        .or('status.eq.billing_followup,category.eq.billing,category.eq.payment')
        .order('due_date', { ascending: true })

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Billing</h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">Outstanding invoices and payment follow-ups</p>
      </div>

      {/* Active / Closed toggle */}
      <div className="flex gap-1.5 mb-7">
        <Link
          href="/billing"
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
            !isClosedView
              ? 'bg-[#1d1d1f] text-white border-transparent'
              : 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'
          }`}
        >
          Active
        </Link>
        <Link
          href="/billing?closed=1"
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
            isClosedView
              ? 'bg-[#1d1d1f] text-white border-transparent'
              : 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'
          }`}
        >
          Closed
        </Link>
      </div>

      {!items?.length ? (
        <div className="text-center py-16">
          <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
          <div className="text-[13px] text-[#8e8e93]">
            {isClosedView ? 'No closed billing items' : 'No billing follow-ups'}
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          {items.map((item, index) => {
            const overdue = !isClosedView && item.due_date && new Date(item.due_date) < new Date(new Date().toDateString())
            const isLast = index === items.length - 1
            return (
              <Link
                key={item.id}
                href={`/follow-ups/${item.id}`}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-[#f9f9fb] transition-colors ${
                  !isLast ? 'border-b border-[#f5f5f7]' : ''
                } ${overdue ? 'bg-red-50/30' : ''}`}
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{item.customer_name}</div>
                  <div className="text-[13px] text-[#6e6e73] mt-0.5">{item.title}</div>
                  {item.customer_phone && (
                    <div className="text-[12px] text-[#f26a1b] font-medium mt-1">{item.customer_phone}</div>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {item.due_date && (
                    <div className={`text-[12px] font-medium ${overdue ? 'text-red-500' : 'text-[#6e6e73]'}`}>
                      {overdue ? '⚠ Overdue · ' : ''}
                      {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
