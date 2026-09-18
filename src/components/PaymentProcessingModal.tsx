import { useEffect, useRef, useState } from 'react'
import { formatLKR } from '../lib/format'

type Phase = 'processing' | 'done'

const TOTAL_DURATION_MS = 5000
const TICK_MS = 100

function getStatusMessage(progress: number): string {
  if (progress < 40) return 'Processing…'
  if (progress < 80) return 'Verifying payment…'
  return 'Finalising…'
}

interface PaymentProcessingModalProps {
  open: boolean
  amount: number
  onDone: () => void
}

export function PaymentProcessingModal({ open, amount, onDone }: PaymentProcessingModalProps) {
  const [phase, setPhase] = useState<Phase>('processing')
  const [progress, setProgress] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined
    setPhase('processing')
    setProgress(0)
    const steps = TOTAL_DURATION_MS / TICK_MS
    let tick = 0
    const interval = window.setInterval(() => {
      tick += 1
      setProgress(Math.min(100, Math.round((tick / steps) * 100)))
      if (tick >= steps) {
        window.clearInterval(interval)
        setPhase('done')
      }
    }, TICK_MS)
    return () => window.clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Listened at the document level (not via bubbling from a focused element)
  // so Escape still works even if focus was knocked off the dialog, e.g. by
  // a stray click on the backdrop.
  useEffect(() => {
    if (!open) return undefined
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'done') {
        onDone()
      }
    }
    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [open, phase, onDone])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl outline-none"
      >
        {phase === 'processing' ? (
          <>
            <h2 id="payment-modal-title" className="text-xl text-burgundy">
              Confirming Payment
            </h2>
            <p className="mt-2 text-sm text-mauve">{formatLKR(amount)}</p>
            <div
              className="mt-6 h-2 w-full overflow-hidden rounded-full bg-cream"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Payment verification progress"
            >
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-burgundy" role="status" aria-live="polite">
              {getStatusMessage(progress)}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
              ✓
            </div>
            <h2 id="payment-modal-title" className="mt-4 text-xl text-burgundy">
              Payment preview completed
            </h2>
            <p className="mt-2 text-sm text-mauve">No payment has been collected.</p>
            <button
              type="button"
              onClick={onDone}
              className="mt-6 w-full rounded-full bg-burgundy px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  )
}
