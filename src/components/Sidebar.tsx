'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Wrench, CalendarDays, Receipt, Plus } from 'lucide-react'

const nav = [
  { href: '/',           label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/follow-ups', label: 'Follow-Ups',  Icon: ClipboardList },
  { href: '/parts',      label: 'Parts',       Icon: Wrench },
  { href: '/schedule',   label: 'Schedule',    Icon: CalendarDays },
  { href: '/billing',    label: 'Billing',     Icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col bg-[#111111] select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5">
        <Image
          src="/l.svg"
          alt="3N1 HVAC"
          width={32}
          height={32}
          className="shrink-0 invert opacity-90"
          priority
        />
        <div>
          <div className="text-[13px] font-bold text-white leading-tight tracking-wide">3N1 HVAC</div>
          <div className="text-[10px] text-white/40 leading-tight mt-0.5 tracking-wide">Follow-Up Manager</div>
        </div>
      </div>

      <div className="mx-3 h-px bg-white/[0.07] mb-1" />

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

      {/* New Follow-Up */}
      <div className="px-2 pb-5">
        <div className="h-px bg-white/[0.07] mb-2 mx-1" />
        <Link
          href="/follow-ups/new"
          className="flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] text-white/50 hover:bg-white/[0.06] hover:text-white/75 transition-all duration-100"
        >
          <Plus size={15} strokeWidth={1.8} className="shrink-0" />
          New Follow-Up
        </Link>
      </div>
    </aside>
  )
}
