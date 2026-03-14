/* ──────────────────────────────────────────────────────
   Shared constants used across pages
   ────────────────────────────────────────────────────── */

export const STATUS_LABELS: Record<string, string> = {
  needs_pricing:          'Needs Pricing',
  waiting_quote_approval: 'Awaiting Approval',
  approved_order_part:    'Order Part',
  waiting_on_part:        'Waiting on Part',
  ready_to_schedule:      'Ready to Schedule',
  waiting_on_customer:    'Waiting on Customer',
  scheduled:              'Scheduled',
  billing_followup:       'Billing Follow-Up',
  closed:                 'Closed',
}

export const STATUS_BADGE: Record<string, string> = {
  needs_pricing:          'bg-amber-50 text-amber-600',
  waiting_quote_approval: 'bg-blue-50 text-blue-600',
  approved_order_part:    'bg-orange-50 text-[#f26a1b]',
  waiting_on_part:        'bg-purple-50 text-purple-600',
  ready_to_schedule:      'bg-emerald-50 text-emerald-600',
  waiting_on_customer:    'bg-[#f5f5f7] text-[#6e6e73]',
  scheduled:              'bg-teal-50 text-teal-600',
  billing_followup:       'bg-red-50 text-red-500',
  closed:                 'bg-[#f5f5f7] text-[#8e8e93]',
}

export const PRIORITY_BADGE: Record<string, string> = {
  urgent:   'bg-red-50 text-red-500',
  standard: 'bg-[#f5f5f7] text-[#6e6e73]',
  low:      'bg-[#f5f5f7] text-[#8e8e93]',
}

/** Statuses that route to other sections (not Follow-Ups) */
export const SECTION_STATUSES = [
  'billing_followup',
  'approved_order_part',
  'waiting_on_part',
  'ready_to_schedule',
  'scheduled',
] as const

/** Format a date string as "Mar 14" */
export function shortDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Check if a due date is past today */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

/** Return a time-of-day greeting */
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
