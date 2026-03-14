import { supabase } from '@/lib/supabase'
import PageShell from '@/components/PageShell'
import ViewToggle from '@/components/ViewToggle'
import SectionGroup from '@/components/SectionGroup'
import EmptyState from '@/components/EmptyState'

export const revalidate = 30

export default async function PartsPage({
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
        .eq('category', 'part_needed' as never)
        .order('due_date', { ascending: false })
    : await supabase
        .from('follow_up_detail')
        .select('*')
        .is('archived_at', null)
        .in('status', ['approved_order_part', 'waiting_on_part'])
        .order('due_date', { ascending: true })

  const toOrder  = items?.filter(i => i.status === 'approved_order_part') ?? []
  const onTheWay = items?.filter(i => i.status === 'waiting_on_part') ?? []

  const partExtra = (item: Record<string, unknown>) => (
    <>
      {item.part_name && (
        <div className="text-[12px] text-[#f26a1b] font-medium mt-1">
          {item.vendor ? `${item.vendor} — ` : ''}{item.part_name as string}
          {item.part_number ? ` · #${item.part_number}` : ''}
        </div>
      )}
      {item.part_eta && (
        <div className="text-[12px] text-purple-600 font-medium mt-0.5">
          ETA {new Date(item.part_eta as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </>
  )

  return (
    <PageShell title="Parts" subtitle="Track approved parts from order through arrival">
      <ViewToggle basePath="/parts" isClosedView={isClosedView} />

      {isClosedView ? (
        !items?.length ? (
          <EmptyState message="No closed parts items" />
        ) : (
          <SectionGroup
            label="Closed"
            count={items.length}
            color="#8e8e93"
            items={items}
            renderExtra={partExtra}
          />
        )
      ) : (
        <>
          <SectionGroup
            label="To Order"
            count={toOrder.length}
            color="#f26a1b"
            items={toOrder}
            renderExtra={partExtra}
            className="mb-7"
          />
          <SectionGroup
            label="On the Way"
            count={onTheWay.length}
            color="#a855f7"
            items={onTheWay}
            renderExtra={partExtra}
          />
        </>
      )}
    </PageShell>
  )
}
