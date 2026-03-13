'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/',           label: 'Home',     icon: '⊟' },
  { href: '/follow-ups', label: 'Follow-Ups', icon: '≡' },
  { href: '/parts',      label: 'Parts',    icon: '⚙' },
  { href: '/schedule',   label: 'Schedule', icon: '◻' },
  { href: '/billing',    label: 'Billing',  icon: '$' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-50 bg-white/90 backdrop-blur-xl border-t border-[#e5e5e7]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {nav.map(({ href, label, icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? 'text-[#f26a1b]' : 'text-[#8e8e93]'
            }`}
          >
            <span className="text-[20px] leading-none">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
