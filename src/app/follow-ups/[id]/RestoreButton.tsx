'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Database } from '@/lib/database.types'

type FollowUpStatus = Database['public']['Enums']['follow_up_status']

export default function RestoreButton({
  itemId,
  currentStatus,
}: {
  itemId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function restore() {
    setLoading(true)

    // Look up the status the item was in just before it was closed
    const { data: logEntry } = await supabase
      .from('activity_log')
      .select('old_value')
      .eq('follow_up_item_id', itemId)
      .eq('action_type', 'status_change')
      .eq('new_value', 'closed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const restoreStatus = (logEntry?.old_value ?? 'needs_pricing') as FollowUpStatus

    const { error } = await supabase
      .from('follow_up_items')
      .update({ status: restoreStatus, closed_at: null })
      .eq('id', itemId)

    if (!error) {
      const browser = createSupabaseBrowserClient()
      const { data: { user } } = await browser.auth.getUser()
      await supabase.from('activity_log').insert({
        follow_up_item_id: itemId,
        action_type: 'status_change',
        old_value: currentStatus,
        new_value: restoreStatus,
        created_by: user?.id ?? null,
      })
      setDone(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-[13px] text-[#8e8e93]">This follow-up is closed.</p>
      <button
        onClick={restore}
        disabled={loading || done}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors disabled:opacity-40 tracking-[-0.01em] bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebed] active:bg-[#e0e0e5]"
      >
        <span>{done ? 'Restored!' : loading ? 'Restoring…' : 'Restore Follow-Up'}</span>
        <span className="text-[15px] leading-none text-[#6e6e73]">↩</span>
      </button>
    </div>
  )
}
