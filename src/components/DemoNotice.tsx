export function DemoNotice({ className = '' }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full bg-burgundy/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-burgundy ${className}`}
    >
      Demo only — no real payment or booking is made
    </p>
  )
}
