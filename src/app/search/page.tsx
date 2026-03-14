'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_BADGE, shortDate, isOverdue } from '@/lib/constants'

type Result = {
  id: string | null
  customer_name: string | null
  title: string | null
  status: string | null
  category: string | null
  due_date: string | null
  priority: string | null
  archived_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  part_needed:          'Part Needed',
  callback:             'Callback',
  cleanup:              'Cleanup',
  incomplete_work:      'Incomplete Work',
  billing:              'Billing',
  payment:              'Payment',
  warranty_registration:'Warranty',
  other:                'Other',
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8 max-w-2xl"><div className="h-11 bg-[#f0f0f5] rounded-[12px] animate-pulse" /></div>}>
      <SearchInner />
    </Suspense>
  )
}

function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync URL param → input on navigation
  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    if (q.trim().length >= 2) runSearch(q)
    else setResults([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function runSearch(q: string) {
    setLoading(true)
    const { data } = await supabase
      .from('follow_up_detail')
      .select('id, customer_name, title, status, category, due_date, priority, archived_at')
      .is('archived_at', null)
      .or(
        `customer_name.ilike.%${q}%,title.ilike.%${q}%,description.ilike.%${q}%,part_name.ilike.%${q}%`
      )
      .order('updated_at', { ascending: false })
      .limit(40)
    setResults((data ?? []) as Result[])
    setLoading(false)
  }

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setResults([])
      router.replace('/search', { scroll: false })
      return
    }
    debounceRef.current = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(value.trim())}`, { scroll: false })
      runSearch(value.trim())
    }, 300)
  }

  function clearSearch() {
    setQuery('')
    setResults([])
    router.replace('/search', { scroll: false })
    inputRef.current?.focus()
  }

  const hasQuery = query.trim().length >= 2

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search customers, titles, parts…"
          className="w-full pl-9 pr-9 py-2.5 text-[14px] bg-white border border-[#d1d1d6] rounded-[12px] text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#f26a1b]/25 focus:border-[#f26a1b] transition-all"
          style={{ boxShadow: 'var(--card-shadow)' }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c7c7cc] hover:text-[#8e8e93] transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Results */}
      {!hasQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={32} className="text-[#d1d1d6] mb-3" />
          <p className="text-[14px] text-[#8e8e93]">Search customers, job titles, or parts</p>
          <p className="text-[12px] text-[#c7c7cc] mt-1">Type at least 2 characters</p>
        </div>
      )}

      {hasQuery && loading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-[#f26a1b]/30 border-t-[#f26a1b] rounded-full animate-spin" />
        </div>
      )}

      {hasQuery && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[14px] text-[#8e8e93]">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-[12px] text-[#c7c7cc] mt-1">Try a customer name, job description, or part</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-[12px] text-[#8e8e93] mb-3 px-1">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div
            className="bg-white rounded-[14px] overflow-hidden"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            {results.map((item, index) => {
              if (!item.id) return null
              const overdue = isOverdue(item.due_date)
              return (
                <Link
                  key={item.id}
                  href={`/follow-ups/${item.id}`}
                  className={`flex items-start justify-between px-4 py-3.5 hover:bg-[#f9f9fb] active:bg-[#f5f5f7] transition-colors ${
                    index < results.length - 1 ? 'border-b border-[#f5f5f7]' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-[#1d1d1f] truncate">
                      {item.customer_name}
                    </div>
                    <div className="text-[13px] text-[#6e6e73] mt-0.5 truncate">{item.title}</div>
                    {item.category && (
                      <div className="text-[11px] text-[#8e8e93] mt-1">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 ml-4 text-right space-y-1.5">
                    {item.status && (
                      <div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[item.status] ?? ''}`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                    )}
                    {item.due_date && (
                      <div className={`text-[11px] font-medium ${overdue ? 'text-red-500' : 'text-[#8e8e93]'}`}>
                        {overdue ? '⚠ ' : ''}{shortDate(item.due_date)}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
