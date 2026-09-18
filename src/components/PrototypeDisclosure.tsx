interface PrototypeDisclosureProps {
  subject: 'order' | 'booking'
  className?: string
}

export function PrototypeDisclosure({ subject, className = '' }: PrototypeDisclosureProps) {
  const verb = subject === 'order' ? 'submitted' : 'confirmed'
  return (
    <p
      role="note"
      className={`rounded-xl border border-burgundy/15 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy ${className}`}
    >
      No payment has been collected and this {subject} has not been {verb}.
    </p>
  )
}
