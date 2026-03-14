/**
 * Centered empty state with checkmark icon and a message.
 */
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-[28px] mb-2 text-[#c7c7cc]">✓</div>
      <div className="text-[13px] text-[#8e8e93]">{message}</div>
    </div>
  )
}
