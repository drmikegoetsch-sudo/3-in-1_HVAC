/**
 * Consistent page wrapper — title, subtitle, optional right action.
 * Every section page uses this.
 */
export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">{title}</h1>
        <p className="text-[13px] text-[#6e6e73] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
