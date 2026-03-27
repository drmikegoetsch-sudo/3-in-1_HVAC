'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { STATUS_LABELS } from '@/lib/constants'
import {
  Wrench,
  PhoneForwarded,
  Sparkles,
  AlertTriangle,
  Receipt,
  CreditCard,
  ShieldCheck,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'

/* ── Style tokens ── */
const inputClass =
  'w-full max-w-full border border-[#d1d1d6] rounded-[10px] px-3.5 py-2.5 text-[14px] bg-white text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#f26a1b]/25 focus:border-[#f26a1b] transition-all'
const selectClass =
  'w-full border border-[#d1d1d6] rounded-[10px] px-3.5 py-2.5 text-[14px] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#f26a1b]/25 focus:border-[#f26a1b] transition-all'
const labelClass = 'block text-[12px] font-semibold text-[#6e6e73] mb-1.5 uppercase tracking-wide'

/* ── Category config: what each category auto-sets + which fields it reveals ── */
type CategoryConfig = {
  label: string
  icon: React.ElementType
  status: string
  requires_part: boolean
  requires_scheduling: boolean
  /** Which contextual fields to show in section 3 */
  fields: ('part' | 'description' | 'next_action' | 'due_date')[]
  placeholder: string
}

const CATEGORIES: Record<string, CategoryConfig> = {
  part_needed: {
    label: 'Part Needed',
    icon: Wrench,
    status: 'needs_pricing',
    requires_part: true,
    requires_scheduling: false,
    fields: ['part', 'due_date'],
    placeholder: 'e.g., Blower motor for AC unit',
  },
  callback: {
    label: 'Callback',
    icon: PhoneForwarded,
    status: 'waiting_on_customer',
    requires_part: false,
    requires_scheduling: false,
    fields: ['next_action', 'due_date'],
    placeholder: 'e.g., Follow up on thermostat issue',
  },
  cleanup: {
    label: 'Cleanup',
    icon: Sparkles,
    status: 'ready_to_schedule',
    requires_part: false,
    requires_scheduling: true,
    fields: ['description', 'due_date'],
    placeholder: 'e.g., Return visit to finish ductwork',
  },
  incomplete_work: {
    label: 'Incomplete',
    icon: AlertTriangle,
    status: 'ready_to_schedule',
    requires_part: false,
    requires_scheduling: true,
    fields: ['description', 'due_date'],
    placeholder: 'e.g., Install second zone damper',
  },
  billing: {
    label: 'Billing',
    icon: Receipt,
    status: 'billing_followup',
    requires_part: false,
    requires_scheduling: false,
    fields: ['due_date'],
    placeholder: 'e.g., Send invoice for compressor replacement',
  },
  payment: {
    label: 'Payment',
    icon: CreditCard,
    status: 'billing_followup',
    requires_part: false,
    requires_scheduling: false,
    fields: ['due_date'],
    placeholder: 'e.g., Collect balance for service call',
  },
  warranty_registration: {
    label: 'Warranty',
    icon: ShieldCheck,
    status: 'needs_pricing',
    requires_part: false,
    requires_scheduling: false,
    fields: ['description'],
    placeholder: 'e.g., Register Trane heat pump warranty',
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    status: 'needs_pricing',
    requires_part: false,
    requires_scheduling: false,
    fields: ['description', 'next_action'],
    placeholder: 'e.g., Customer wants seasonal maintenance quote',
  },
}

export default function NewFollowUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    technician_name: '',
    title: '',
    description: '',
    category: '',
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
    job_type: '' as '' | 'service' | 'install' | 'either',
    crew_size: 0 as 0 | 1 | 2,
  })

  const set = (k: string, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }))

  const activeConfig = form.category ? CATEGORIES[form.category] : null
  const visibleFields = activeConfig?.fields ?? []

  /** Tap a category card — auto-set status + flags, clear previous category-specific data */
  function selectCategory(key: string) {
    const cfg = CATEGORIES[key]
    setForm(f => ({
      ...f,
      category: key,
      status: cfg.status,
      requires_part: cfg.requires_part,
      requires_scheduling: cfg.requires_scheduling,
    }))
  }

  /* ── Submit logic — identical to original ── */
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

      const browser = createSupabaseBrowserClient()
      const { data: { user } } = await browser.auth.getUser()

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
          created_by: user?.id ?? null,
          job_type: form.job_type || null,
          crew_size: form.crew_size || null,
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
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? 'Something went wrong'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
          New Follow-Up
        </h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">
          Log an unresolved issue from the field
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ═══════════════════════════════════════════
            SECTION 1 — WHO (always visible)
           ═══════════════════════════════════════════ */}
        <div
          className="bg-white rounded-[14px] p-5"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Customer Name *</label>
              <input
                className={`${inputClass} text-[16px] font-medium`}
                required
                autoFocus
                value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)}
                placeholder="Judy Maynard"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                type="tel"
                value={form.customer_phone}
                onChange={e => set('customer_phone', e.target.value)}
                placeholder="(704) 555-0100"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 2 — WHAT (category cards)
           ═══════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">
              What type of follow-up?
            </span>
            {!form.category && (
              <span className="text-[11px] text-[#c7c7cc]">Tap to select</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(CATEGORIES).map(([key, cfg]) => {
              const Icon = cfg.icon
              const selected = form.category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectCategory(key)}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-[12px] px-2 py-3
                    transition-all duration-150 cursor-pointer
                    ${
                      selected
                        ? 'bg-[#fff7f2] border-2 border-[#f26a1b] shadow-[0_0_0_3px_rgba(242,106,27,0.1)]'
                        : 'bg-white border border-[#e5e5e7] hover:border-[#d1d1d6] hover:bg-[#fafafa]'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className={selected ? 'text-[#f26a1b]' : 'text-[#8e8e93]'}
                  />
                  <span
                    className={`text-[11px] leading-tight text-center font-medium ${
                      selected ? 'text-[#f26a1b]' : 'text-[#6e6e73]'
                    }`}
                  >
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 3 — DETAILS (appears after category tap)
           ═══════════════════════════════════════════ */}
        {activeConfig && (
          <div
            className="bg-white rounded-[14px] p-5 form-section-enter"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            <div className="space-y-4">
              {/* Title — always required */}
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  className={inputClass}
                  required
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder={activeConfig.placeholder}
                />
              </div>

              {/* ── Job Type + Crew Size — hidden for billing/payment/warranty ── */}
              {!['billing', 'payment', 'warranty_registration'].includes(form.category) && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Job Type */}
                <div>
                  <label className={labelClass}>Job Type</label>
                  <div className="flex gap-2">
                    {(['service', 'install', 'either'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('job_type', form.job_type === t ? '' : t)}
                        className={`flex-1 py-2 rounded-[9px] text-[12px] font-semibold capitalize transition-all border ${
                          form.job_type === t
                            ? 'bg-[#fff7f2] border-[#f26a1b] text-[#f26a1b] shadow-[0_0_0_2px_rgba(242,106,27,0.15)]'
                            : 'bg-white border-[#e5e5e7] text-[#6e6e73] hover:border-[#d1d1d6]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crew Size */}
                <div>
                  <label className={labelClass}>Crew Size</label>
                  <div className="flex gap-2">
                    {([1, 2] as const).map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set('crew_size', form.crew_size === n ? 0 : n)}
                        className={`flex-1 py-2 rounded-[9px] text-[12px] font-semibold transition-all border ${
                          form.crew_size === n
                            ? 'bg-[#fff7f2] border-[#f26a1b] text-[#f26a1b] shadow-[0_0_0_2px_rgba(242,106,27,0.15)]'
                            : 'bg-white border-[#e5e5e7] text-[#6e6e73] hover:border-[#d1d1d6]'
                        }`}
                      >
                        {n === 1 ? '1 Person' : '2 People'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Description — if category needs it */}
              {visibleFields.includes('description') && (
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="What was found on the call…"
                    rows={3}
                  />
                </div>
              )}

              {/* Next Action — if category needs it */}
              {visibleFields.includes('next_action') && (
                <div>
                  <label className={labelClass}>Next Action</label>
                  <input
                    className={inputClass}
                    value={form.next_action}
                    onChange={e => set('next_action', e.target.value)}
                    placeholder="e.g., Call customer Monday at 9 AM"
                  />
                </div>
              )}

              {/* Due Date — if category needs it */}
              {visibleFields.includes('due_date') && (
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.due_date}
                    onChange={e => set('due_date', e.target.value)}
                  />
                </div>
              )}

              {/* Part fields — if Part Needed category */}
              {visibleFields.includes('part') && (
                <div className="space-y-4 pt-2 border-t border-[#f2f2f7]">
                  <div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide pt-2">
                    Part Info
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Part Name *</label>
                      <input
                        className={inputClass}
                        value={form.part_name}
                        onChange={e => set('part_name', e.target.value)}
                        placeholder="Blower Motor"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Vendor</label>
                      <input
                        className={inputClass}
                        value={form.vendor}
                        onChange={e => set('vendor', e.target.value)}
                        placeholder="Trane Supply"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Part Number</label>
                      <input
                        className={inputClass}
                        value={form.part_number}
                        onChange={e => set('part_number', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            SECTION 4 — MORE OPTIONS (collapsed)
           ═══════════════════════════════════════════ */}
        {activeConfig && (
          <div>
            <button
              type="button"
              onClick={() => setMoreOpen(o => !o)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#8e8e93] hover:text-[#6e6e73] transition-colors px-1 py-1 cursor-pointer"
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
              />
              More Options
            </button>

            {moreOpen && (
              <div
                className="bg-white rounded-[14px] p-5 mt-2 form-section-enter"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <div className="space-y-4">
                  {/* Email + Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        className={inputClass}
                        type="email"
                        value={form.customer_email}
                        onChange={e => set('customer_email', e.target.value)}
                        placeholder="judy@email.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Technician</label>
                      <input
                        className={inputClass}
                        value={form.technician_name}
                        onChange={e => set('technician_name', e.target.value)}
                        placeholder="Adam"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Address</label>
                    <input
                      className={inputClass}
                      value={form.customer_address}
                      onChange={e => set('customer_address', e.target.value)}
                      placeholder="123 Main St, Unionville, NC"
                    />
                  </div>

                  {/* Description — if not already shown by category */}
                  {!visibleFields.includes('description') && (
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Additional notes…"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Next Action — if not already shown */}
                  {!visibleFields.includes('next_action') && (
                    <div>
                      <label className={labelClass}>Next Action</label>
                      <input
                        className={inputClass}
                        value={form.next_action}
                        onChange={e => set('next_action', e.target.value)}
                        placeholder="e.g., Call Trane at opening for cost"
                      />
                    </div>
                  )}

                  {/* Due Date — if not already shown */}
                  {!visibleFields.includes('due_date') && (
                    <div>
                      <label className={labelClass}>Due Date</label>
                      <input
                        className={inputClass}
                        type="date"
                        value={form.due_date}
                        onChange={e => set('due_date', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Priority override */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Priority</label>
                      <select
                        className={selectClass}
                        value={form.priority}
                        onChange={e => set('priority', e.target.value)}
                      >
                        <option value="urgent">Urgent — No heat/cool, safety</option>
                        <option value="standard">Standard — Repair needed</option>
                        <option value="low">Low — Minor, non-urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status Override</label>
                      <select
                        className={selectClass}
                        value={form.status}
                        onChange={e => set('status', e.target.value)}
                      >
                        <option value="needs_pricing">Needs Pricing</option>
                        <option value="waiting_quote_approval">Waiting on Approval</option>
                        <option value="approved_order_part">Approved – Order Part</option>
                        <option value="ready_to_schedule">Ready to Schedule</option>
                        <option value="waiting_on_customer">Waiting on Customer</option>
                        <option value="billing_followup">Billing Follow-Up</option>
                      </select>
                    </div>
                  </div>

                  {/* Model + serial — always available in More Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Model Number</label>
                      <input
                        className={inputClass}
                        value={form.model_number}
                        onChange={e => set('model_number', e.target.value)}
                        placeholder="e.g., XR15-060"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Serial Number</label>
                      <input
                        className={inputClass}
                        value={form.serial_number}
                        onChange={e => set('serial_number', e.target.value)}
                        placeholder="e.g., 1234567890"
                      />
                    </div>
                  </div>

                  {/* Part fields — if not already shown by category */}
                  {!visibleFields.includes('part') && (
                    <div className="space-y-4 pt-2 border-t border-[#f2f2f7]">
                      <div className="flex items-center gap-3 pt-2">
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
                      {form.requires_part && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Part Name</label>
                            <input
                              className={inputClass}
                              value={form.part_name}
                              onChange={e => set('part_name', e.target.value)}
                              placeholder="Blower Motor"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Vendor</label>
                            <input
                              className={inputClass}
                              value={form.vendor}
                              onChange={e => set('vendor', e.target.value)}
                              placeholder="Trane Supply"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Part Number</label>
                            <input
                              className={inputClass}
                              value={form.part_number}
                              onChange={e => set('part_number', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            SUBMIT AREA
           ═══════════════════════════════════════════ */}
        {activeConfig && (
          <div className="space-y-3 pt-1 pb-6">
            {/* Status summary */}
            <p className="text-[12px] text-[#8e8e93] px-1">
              Will be created as{' '}
              <span className="font-semibold text-[#1d1d1f]">
                {STATUS_LABELS[form.status] ?? form.status}
              </span>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-[10px] px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center h-11 px-6 bg-[#f26a1b] hover:bg-[#d4560d] active:bg-[#c24e0b] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50 tracking-[-0.01em] shadow-[0_2px_8px_rgba(242,106,27,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                {loading ? 'Saving…' : 'Create Follow-Up'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center h-11 px-5 bg-white border border-[#d1d1d6] text-[#3d3d3f] text-[14px] font-medium rounded-full hover:bg-[#f5f5f7] transition-colors tracking-[-0.01em]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
