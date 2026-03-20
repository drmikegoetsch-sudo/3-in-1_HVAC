'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Wrench, CalendarDays, Receipt, Plus, Search, LogOut } from 'lucide-react'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const nav = [
  { href: '/',           label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/follow-ups', label: 'Follow-Ups',  Icon: ClipboardList },
  { href: '/parts',      label: 'Parts',       Icon: Wrench },
  { href: '/schedule',   label: 'Schedule',    Icon: CalendarDays },
  { href: '/billing',    label: 'Billing',     Icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q.length >= 2) router.push(`/search?q=${encodeURIComponent(q)}`)
    else router.push('/search')
  }

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col bg-[#111111] select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5">
        <Image
          src="/logo-dark.svg"
          alt="3N1 HVAC"
          width={32}
          height={32}
          className="shrink-0 opacity-90"
          priority
        />
        <div>
          <div className="text-[13px] font-bold text-white leading-tight tracking-wide">3N1 HVAC</div>
          <div className="text-[10px] text-white/40 leading-tight mt-0.5 tracking-wide">Follow-Up Manager</div>
        </div>
      </div>

      <div className="mx-3 h-px bg-white/[0.07] mb-3" />

      {/* Search */}
      <form onSubmit={handleSearch} className="px-2 mb-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-7 pr-2.5 py-1.5 text-[12px] bg-white/[0.07] hover:bg-white/[0.1] text-white/70 placeholder:text-white/25 rounded-[7px] border border-transparent focus:outline-none focus:bg-white/[0.1] focus:border-white/[0.12] transition-all"
          />
        </div>
      </form>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-px">
        {nav.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] transition-all duration-100 ${
                active
                  ? 'bg-[rgba(242,106,27,0.15)] text-[#f26a1b] font-medium'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/75'
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* New Follow-Up + Logout */}
      <div className="px-2 pb-5">
        <div className="h-px bg-white/[0.07] mb-2 mx-1" />
        <Link
          href="/follow-ups/new"
          className="flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] text-white/50 hover:bg-white/[0.06] hover:text-white/75 transition-all duration-100"
        >
          <Plus size={15} strokeWidth={1.8} className="shrink-0" />
          New Follow-Up
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] text-white/30 hover:bg-white/[0.06] hover:text-white/50 transition-all duration-100 mt-px"
        >
          <LogOut size={15} strokeWidth={1.8} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
