'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ArchiveButton({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const { error } = await supabase
      .from('follow_up_items')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', itemId)

    if (!error) {
      router.push('/follow-ups')
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-[10px] p-3.5 space-y-3">
        <p className="text-[13px] text-[#3d3d3f]">Remove this follow-up from all queues?</p>
        <div className="flex gap-2">
          <button
            onClick={handleArchive}
            disabled={loading}
            className="inline-flex items-center h-8 px-4 bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold rounded-[8px] transition-colors disabled:opacity-50 tracking-[-0.01em]"
          >
            {loading ? 'Archiving…' : 'Archive'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="inline-flex items-center h-8 px-4 bg-white border border-[#d1d1d6] text-[#3d3d3f] text-[12px] font-medium rounded-[8px] hover:bg-[#f5f5f7] transition-colors tracking-[-0.01em]"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[12px] text-[#8e8e93] hover:text-red-500 transition-colors"
    >
      Archive follow-up
    </button>
  )
}
