'use client'

import Image from 'next/image'

/**
 * Mobile-only top bar showing the 3N1 HVAC logo.
 * Hidden on desktop (sidebar handles branding there).
 */
export default function MobileHeader() {
  return (
    <header className="flex md:hidden items-center gap-2.5 px-4 pt-3 pb-2">
      <Image
        src="/l.svg"
        alt="3N1 HVAC"
        width={28}
        height={28}
        className="shrink-0"
        priority
      />
      <div>
        <div className="text-[13px] font-bold text-[#1d1d1f] leading-tight tracking-wide">3N1 HVAC</div>
        <div className="text-[10px] text-[#8e8e93] leading-tight mt-0.5 tracking-wide">Follow-Up Manager</div>
      </div>
    </header>
  )
}
