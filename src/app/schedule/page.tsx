import { supabase } from '@/lib/supabase'
import PageShell from '@/components/PageShell'
import ViewToggle from '@/components/ViewToggle'
import SectionGroup from '@/components/SectionGroup'
import EmptyState from '@/components/EmptyState'

export const revalidate = 30

export default async function SchedulePage({
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
        .neq('category', 'billing' as never)
        .neq('category', 'payment' as never)
        .neq('category', 'part_needed' as never)
        .order('due_date', { ascending: false })
    : await supabase
        .from('follow_up_detail')
        .select('*')
        .is('archived_at', null)
        .in('status', ['ready_to_schedule', 'waiting_on_customer', 'scheduled'])
        .order('due_date', { ascending: true })

  const ready     = items?.filter(i => i.status === 'ready_to_schedule') ?? []
  const waiting   = items?.filter(i => i.status === 'waiting_on_customer') ?? []
  const scheduled = items?.filter(i => i.status === 'scheduled') ?? []

  const scheduleExtra = (item: Record<string, unknown>) => (
    <>
      {item.customer_phone && (
        <div className="text-[12px] text-[#f26a1b] font-medium mt-1">{item.customer_phone as string}</div>
      )}
    </>
  )

  return (
    <PageShell title="Schedule" subtitle="Call these customers to book their return visit">
      <ViewToggle basePath="/schedule" isClosedView={isClosedView} />

      {isClosedView ? (
        !items?.length ? (
          <EmptyState message="No closed schedule items" />
        ) : (
          <SectionGroup
            label="Closed"
            count={items.length}
            color="#8e8e93"
            items={items}
            renderExtra={scheduleExtra}
          />
        )
      ) : (
        <>
          <SectionGroup
            label="Ready to Schedule"
            count={ready.length}
            color="#34d399"
            items={ready}
            renderExtra={scheduleExtra}
            className="mb-7"
          />
          <SectionGroup
            label="Waiting on Customer"
            count={waiting.length}
            color="#d1d1d6"
            items={waiting}
            renderExtra={scheduleExtra}
            className="mb-7"
          />
          <SectionGroup
            label="Scheduled"
            count={scheduled.length}
            color="#2dd4bf"
            items={scheduled}
            renderExtra={scheduleExtra}
          />
        </>
      )}
    </PageShell>
  )
}
