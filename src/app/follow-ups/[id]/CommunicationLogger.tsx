'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CommunicationLogger({ followUpItemId }: { followUpItemId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ direction: 'outbound', method: 'phone', summary: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('communications').insert({
      follow_up_item_id: followUpItemId,
      direction: form.direction as 'inbound' | 'outbound',
      method: form.method as 'phone' | 'text' | 'email' | 'in_person' | 'other',
      summary: form.summary || null,
    })
    if (!error) {
      setOpen(false)
      setForm({ direction: 'outbound', method: 'phone', summary: '' })
      router.refresh()
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#fff4ee] hover:bg-[#ffe8d5] text-[#f26a1b] text-[12px] font-semibold rounded-[7px] transition-colors tracking-[-0.01em]"
      >
        <span className="text-[15px] font-light leading-none -mt-px">+</span>
        Log Contact
      </button>
    )
  }

  const selectClass = "border border-[#d1d1d6] rounded-[7px] px-2.5 py-1.5 text-[12px] bg-white text-[#1d1d1f] focus:outline-none focus:ring-1 focus:ring-[#f26a1b]"

  return (
    <form onSubmit={handleSubmit} className="bg-[#f9f9fb] border border-[#e5e5e7] rounded-[10px] p-3 space-y-2.5 mt-2">
      <div className="flex gap-2">
        <select
          value={form.direction}
          onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}
          className={selectClass}
        >
          <option value="outbound">Outbound</option>
          <option value="inbound">Inbound</option>
        </select>
        <select
          value={form.method}
          onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
          className={selectClass}
        >
          <option value="phone">Phone</option>
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="in_person">In Person</option>
        </select>
      </div>
      <textarea
        placeholder="Summary of conversation..."
        value={form.summary}
        onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
        rows={2}
        className="w-full border border-[#d1d1d6] rounded-[7px] px-2.5 py-1.5 text-[13px] bg-white text-[#1d1d1f] resize-none focus:outline-none focus:ring-1 focus:ring-[#f26a1b] placeholder:text-[#c7c7cc]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center h-8 px-4 bg-[#f26a1b] hover:bg-[#d4560d] text-white text-[12px] font-semibold rounded-[8px] transition-colors disabled:opacity-50 tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center h-8 px-4 bg-white border border-[#d1d1d6] text-[#3d3d3f] text-[12px] font-medium rounded-[8px] hover:bg-[#f5f5f7] transition-colors tracking-[-0.01em]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
