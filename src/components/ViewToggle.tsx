import Link from 'next/link'

/**
 * Active / Closed pill toggle — used on Parts, Schedule, Billing pages.
 * Renders two pills; the active one is filled dark, the other outlined.
 */
export default function ViewToggle({
  basePath,
  isClosedView,
}: {
  basePath: string
  isClosedView: boolean
}) {
  const base =
    'px-3 py-1 rounded-full text-[12px] font-medium border transition-colors'
  const on  = 'bg-[#1d1d1f] text-white border-transparent'
  const off = 'bg-white text-[#6e6e73] border-[#d1d1d6] hover:text-[#1d1d1f] hover:border-[#8e8e93]'

  return (
    <div className="flex gap-1.5 mb-7">
      <Link href={basePath} className={`${base} ${!isClosedView ? on : off}`}>
        Active
      </Link>
      <Link href={`${basePath}?closed=1`} className={`${base} ${isClosedView ? on : off}`}>
        Closed
      </Link>
    </div>
  )
}
