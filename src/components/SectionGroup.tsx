import Link from 'next/link'

type Item = {
  id: string | null
  customer_name: string | null
  title: string | null
  due_date: string | null
  priority: string | null
  [key: string]: unknown
}

/**
 * A section with colored dot header + item list.
 * Used on Parts, Schedule, Billing for grouping items.
 */
export default function SectionGroup({
  label,
  count,
  color,
  items,
  renderExtra,
  className = '',
}: {
  label: string
  count: number
  color: string
  items: Item[]
  renderExtra?: (item: Item) => React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[13px] font-semibold text-[#1d1d1f]">{label}</span>
        <span className="text-[11px] font-semibold text-[#8e8e93]">{count}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[#8e8e93] py-2">None right now</p>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={`/follow-ups/${item.id}`}
              className={`flex items-start justify-between px-4 py-3.5 hover:bg-[#f9f9fb] transition-colors ${
                index < items.length - 1 ? 'border-b border-[#f5f5f7]' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[#1d1d1f]">{item.customer_name}</div>
                <div className="text-[13px] text-[#6e6e73] mt-0.5">{item.title}</div>
                {renderExtra?.(item)}
              </div>
              <div className="text-right shrink-0 ml-4 space-y-1">
                {item.due_date && (
                  <div className="text-[12px] text-[#8e8e93]">
                    {new Date(item.due_date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {item.priority === 'urgent' && (
                  <div className="text-[11px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded inline-block">
                    Urgent
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
