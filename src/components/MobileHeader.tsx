'use client'

import Link from 'next/link'
import { Search, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * Mobile-only top bar showing the 3N1 HVAC logo + search icon.
 * Hidden on desktop (sidebar handles branding + search there).
 */
export default function MobileHeader() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex md:hidden items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-dark.svg"
          alt="3N1 HVAC"
          width={28}
          height={28}
          className="shrink-0"
        />
        <div>
          <div className="text-[13px] font-bold text-[#1d1d1f] leading-tight tracking-wide">3N1 HVAC</div>
          <div className="text-[10px] text-[#8e8e93] leading-tight mt-0.5 tracking-wide">Follow-Up Manager</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/search"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f0f0f5] active:bg-[#e8e8ed] transition-colors"
          aria-label="Search"
        >
          <Search size={18} className="text-[#6e6e73]" />
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f0f0f5] active:bg-[#e8e8ed] transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={17} className="text-[#6e6e73]" />
        </button>
      </div>
    </header>
  )
}
