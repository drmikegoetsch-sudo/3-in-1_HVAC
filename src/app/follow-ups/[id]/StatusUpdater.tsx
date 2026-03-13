'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function StatusUpdater({
  itemId,
  currentStatus,
  nextStatuses,
  statusLabels,
}: {
  itemId: string
  currentStatus: string
  nextStatuses: string[]
  statusLabels: Record<string, string>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function moveTo(newStatus: string) {
    setLoading(true)
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'closed') updates.closed_at = new Date().toISOString()

    const { error } = await supabase
      .from('follow_up_items')
      .update(updates)
      .eq('id', itemId)

    if (!error) {
      await supabase.from('activity_log').insert({
        follow_up_item_id: itemId,
        action_type: 'status_change',
        old_value: currentStatus,
        new_value: newStatus,
      })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      {nextStatuses.map(s => (
        <button
          key={s}
          disabled={loading}
          onClick={() => moveTo(s)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors disabled:opacity-40 tracking-[-0.01em] ${
            s === 'closed'
              ? 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#ebebed]'
              : 'bg-[#f26a1b] text-white hover:bg-[#d4560d] active:bg-[#c24e0b] shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]'
          }`}
        >
          <span>{statusLabels[s]}</span>
          <span className={`text-[15px] leading-none ${s === 'closed' ? 'text-[#c7c7cc]' : 'text-white/70'}`}>
            {s === 'closed' ? '✓' : '→'}
          </span>
        </button>
      ))}
    </div>
  )
}
