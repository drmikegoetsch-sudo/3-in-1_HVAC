'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Wrench, CalendarDays, Receipt } from 'lucide-react'

const nav = [
  {
    href: '/',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    activeColor: '#3b82f6',   // blue
    activeBg: '#eff6ff',
  },
  {
    href: '/follow-ups',
    label: 'Follow-Ups',
    Icon: ClipboardList,
    activeColor: '#f26a1b',   // brand orange
    activeBg: '#fff4ee',
  },
  {
    href: '/parts',
    label: 'Parts',
    Icon: Wrench,
    activeColor: '#a855f7',   // purple
    activeBg: '#faf5ff',
  },
  {
    href: '/schedule',
    label: 'Schedule',
    Icon: CalendarDays,
    activeColor: '#14b8a6',   // teal
    activeBg: '#f0fdfa',
  },
  {
    href: '/billing',
    label: 'Billing',
    Icon: Receipt,
    activeColor: '#22c55e',   // green
    activeBg: '#f0fdf4',
  },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-50 bg-white/95 backdrop-blur-xl border-t border-[#e5e5e7]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {nav.map(({ href, label, Icon, activeColor, activeBg }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-all"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-all"
              style={active ? { background: activeBg } : {}}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                color={active ? activeColor : '#8e8e93'}
              />
            </span>
            <span
              className="text-[10px] font-medium tracking-tight transition-colors"
              style={{ color: active ? activeColor : '#8e8e93' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
