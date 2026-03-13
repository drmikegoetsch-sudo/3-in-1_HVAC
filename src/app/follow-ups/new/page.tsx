'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputClass = "w-full border border-[#d1d1d6] rounded-[8px] px-3 py-2 text-[13px] bg-white text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-1 focus:ring-[#f26a1b] focus:border-[#f26a1b] transition-shadow"
const selectClass = "w-full border border-[#d1d1d6] rounded-[8px] px-3 py-2 text-[13px] bg-white text-[#1d1d1f] focus:outline-none focus:ring-1 focus:ring-[#f26a1b] focus:border-[#f26a1b]"
const labelClass = "block text-[12px] font-medium text-[#6e6e73] mb-1"

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[12px] overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className="px-5 pt-4 pb-1">
        <div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{title}</div>
      </div>
      <div className="px-5 pb-5 pt-3 space-y-4">{children}</div>
    </div>
  )
}

export default function NewFollowUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    technician_name: '',
    title: '',
    description: '',
    category: 'part_needed',
    priority: 'standard',
    status: 'needs_pricing',
    next_action: '',
    due_date: '',
    requires_part: false,
    requires_scheduling: false,
    part_name: '',
    part_number: '',
    model_number: '',
    serial_number: '',
    vendor: '',
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({
          name: form.customer_name,
          phone: form.customer_phone || null,
          email: form.customer_email || null,
          address: form.customer_address || null,
        })
        .select('id')
        .single()

      if (custErr) throw custErr

      let technicianId: string | null = null
      if (form.technician_name.trim()) {
        const { data: tech, error: techErr } = await supabase
          .from('technicians')
          .insert({ name: form.technician_name })
          .select('id')
          .single()
        if (techErr) throw techErr
        technicianId = tech.id
      }

      const { data: item, error: itemErr } = await supabase
        .from('follow_up_items')
        .insert({
          customer_id: customer.id,
          technician_id: technicianId,
          title: form.title,
          description: form.description || null,
          category: form.category as never,
          priority: form.priority as never,
          status: form.status as never,
          next_action: form.next_action || null,
          due_date: form.due_date || null,
          requires_part: form.requires_part,
          requires_scheduling: form.requires_scheduling,
        })
        .select('id')
        .single()

      if (itemErr) throw itemErr

      if (form.requires_part && form.part_name.trim()) {
        const { error: partErr } = await supabase.from('parts_requests').insert({
          follow_up_item_id: item.id,
          part_name: form.part_name,
          part_number: form.part_number || null,
          model_number: form.model_number || null,
          serial_number: form.serial_number || null,
          vendor: form.vendor || null,
        })
        if (partErr) throw partErr
      }

      router.push(`/follow-ups/${item.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">New Follow-Up</h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">Log an unresolved issue from the field</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormCard title="Customer">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Customer Name *</label>
              <input className={inputClass} required value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Judy Maynard" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="(704) 555-0100" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={form.customer_address} onChange={e => set('customer_address', e.target.value)} placeholder="123 Main St, Unionville, NC" />
            </div>
          </div>
        </FormCard>

        <FormCard title="Issue">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Bad blower motor – needs replacement" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} resize-none`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What was found on the call…" rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Technician</label>
              <input className={inputClass} value={form.technician_name} onChange={e => set('technician_name', e.target.value)} placeholder="Adam" />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select className={selectClass} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="part_needed">Part Needed</option>
                <option value="callback">Callback</option>
                <option value="cleanup">Cleanup / Return Visit</option>
                <option value="incomplete_work">Incomplete Work</option>
                <option value="billing">Billing</option>
                <option value="payment">Payment</option>
                <option value="warranty_registration">Warranty Registration</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </FormCard>

        <FormCard title="Workflow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Priority *</label>
              <select className={selectClass} value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="urgent">Urgent — No heat/cool, safety</option>
                <option value="standard">Standard — Repair needed</option>
                <option value="low">Low — Minor, non-urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Starting Status *</label>
              <select className={selectClass} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="needs_pricing">Needs Pricing</option>
                <option value="waiting_quote_approval">Waiting on Approval</option>
                <option value="approved_order_part">Approved – Order Part</option>
                <option value="ready_to_schedule">Ready to Schedule</option>
                <option value="waiting_on_customer">Waiting on Customer</option>
                <option value="billing_followup">Billing Follow-Up</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Next Action</label>
            <input className={inputClass} value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="Call Trane at opening for cost and availability" />
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input className={inputClass} type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-[13px] text-[#3d3d3f] cursor-pointer">
              <input
                type="checkbox"
                checked={form.requires_part}
                onChange={e => set('requires_part', e.target.checked)}
                className="w-4 h-4 rounded accent-[#f26a1b]"
              />
              Requires a part
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#3d3d3f] cursor-pointer">
              <input
                type="checkbox"
                checked={form.requires_scheduling}
                onChange={e => set('requires_scheduling', e.target.checked)}
                className="w-4 h-4 rounded accent-[#f26a1b]"
              />
              Requires scheduling
            </label>
          </div>
        </FormCard>

        {form.requires_part && (
          <FormCard title="Part Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Part Name *</label>
                <input className={inputClass} value={form.part_name} onChange={e => set('part_name', e.target.value)} placeholder="Blower Motor" />
              </div>
              <div>
                <label className={labelClass}>Vendor</label>
                <input className={inputClass} value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Trane Supply" />
              </div>
              <div>
                <label className={labelClass}>Part Number</label>
                <input className={inputClass} value={form.part_number} onChange={e => set('part_number', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Model Number</label>
                <input className={inputClass} value={form.model_number} onChange={e => set('model_number', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Serial Number</label>
                <input className={inputClass} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} />
              </div>
            </div>
          </FormCard>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-[8px] px-4 py-3">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center h-10 px-5 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[13px] font-semibold rounded-[10px] transition-colors disabled:opacity-50 tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            {loading ? 'Saving…' : 'Create Follow-Up'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center h-10 px-5 bg-white border border-[#d1d1d6] text-[#3d3d3f] text-[13px] font-medium rounded-[10px] hover:bg-[#f5f5f7] transition-colors tracking-[-0.01em]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
