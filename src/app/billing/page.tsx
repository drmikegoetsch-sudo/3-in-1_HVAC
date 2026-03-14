import { supabase } from '@/lib/supabase'
import { isOverdue, shortDate } from '@/lib/constants'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import ViewToggle from '@/components/ViewToggle'
import EmptyState from '@/components/EmptyState'

export const revalidate = 30

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
    <PageShell title="Billing" subtitle="Outstanding invoices and payment follow-ups">
      <ViewToggle basePath="/billing" isClosedView={isClosedView} />

      {!items?.length ? (
        <EmptyState message={isClosedView ? 'No closed billing items' : 'No billing follow-ups'} />
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          {items.map((item, index) => {
            const overdue = !isClosedView && isOverdue(item.due_date)
            return (
              <div
                key={item.id}
                className={`relative flex items-center justify-between px-4 py-3.5 hover:bg-[#f9f9fb] transition-colors ${
                  index < items.length - 1 ? 'border-b border-[#f5f5f7]' : ''
                } ${overdue ? 'bg-red-50/30' : ''}`}
              >
                <Link href={`/follow-ups/${item.id}`} className="absolute inset-0 z-0" aria-label={item.title ?? ''} />
                <div className="relative z-10 min-w-0">
                  {item.customer_id ? (
                    <Link href={`/customers/${item.customer_id}`} className="text-[14px] font-medium text-[#1d1d1f] hover:text-[#f26a1b] hover:underline block transition-colors">
                      {item.customer_name}
                    </Link>
                  ) : (
                    <div className="text-[14px] font-medium text-[#1d1d1f]">{item.customer_name}</div>
                  )}
                  <div className="text-[13px] text-[#6e6e73] mt-0.5">{item.title}</div>
                  {item.customer_phone && (
                    <div className="text-[12px] text-[#f26a1b] font-medium mt-1">{item.customer_phone}</div>
                  )}
                </div>
                <div className="relative z-10 text-right shrink-0 ml-4">
                  {item.due_date && (
                    <div className={`text-[12px] font-medium ${overdue ? 'text-red-500' : 'text-[#6e6e73]'}`}>
                      {overdue ? '⚠ Overdue · ' : ''}
                      {shortDate(item.due_date)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
