import { useEffect, useRef, useState } from 'react'
import { formatLKR } from '../lib/format'
import { PAYMENT_DURATION_MS } from '../lib/otp'
import { useModalBehavior } from '../lib/useModalBehavior'

const STAGES = [
  { status: 'Processing payment…', label: 'Processing' },
  { status: 'Verifying transaction…', label: 'Verifying' },
  { status: 'Completing payment…', label: 'Completing' },
] as const

interface PaymentProcessingModalProps {
  open: boolean
  amount: number
  /** Label for the button that leaves the dialog, e.g. "View booking summary". */
  summaryLabel: string
  onDone: () => void
}

export function PaymentProcessingModal({ open, ...props }: Readonly<PaymentProcessingModalProps>) {
  if (!open) return null
  // Mounted only while open so every opening restarts the sequence from zero.
  return <PaymentDialog {...props} />
}

function PaymentDialog({ amount, summaryLabel, onDone }: Readonly<Omit<PaymentProcessingModalProps, 'open'>>) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLButtonElement>(null)

  // Escape only leaves the dialog once the sequence has finished.
  useModalBehavior(dialogRef, () => {
    if (done) onDone()
  })

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    if (done) summaryRef.current?.focus()
  }, [done])

  // The whole sequence is a timer. Nothing is sent to a payment provider: the
  // presentation flow simply plays five seconds of progress and then reports success.
  useEffect(() => {
    const startedAt = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      if (elapsed >= PAYMENT_DURATION_MS) {
        window.clearInterval(id)
        setProgress(100)
        setDone(true)
      } else {
        setProgress((elapsed / PAYMENT_DURATION_MS) * 100)
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const stageIndex = Math.min(STAGES.length - 1, Math.floor((progress / 100) * STAGES.length))
  const currentStatus = STAGES[stageIndex].status

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          tabIndex={-1}
          className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl outline-none sm:p-8"
        >
          <p className="sr-only" role="status" aria-live="polite">
            {done ? 'Payment successful' : currentStatus}
          </p>

          {done ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
                ✓
              </div>
              <h2 id="payment-title" className="mt-4 text-xl text-burgundy">
                Payment successful
              </h2>
              <p className="mt-2 text-sm text-mauve">{formatLKR(amount)} · Dialog Pay QR</p>
              <button
                ref={summaryRef}
                type="button"
                onClick={onDone}
                className="mt-6 w-full rounded-full bg-burgundy px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
              >
                {summaryLabel}
              </button>
            </>
          ) : (
            <>
              <h2 id="payment-title" className="text-xl text-burgundy">
                Payment in progress
              </h2>
              <p className="mt-2 text-sm text-mauve">{formatLKR(amount)}</p>
              <div
                className="mt-6 h-2 w-full overflow-hidden rounded-full bg-cream"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Payment progress"
              >
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-100 ease-linear motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p aria-hidden="true" className="mt-4 text-sm font-medium text-burgundy">
                {currentStatus}
              </p>
              <ol
                aria-hidden="true"
                className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-wide"
              >
                {STAGES.map((stage, index) => {
                  let tone = 'text-mauve/50'
                  if (index < stageIndex) tone = 'text-gold'
                  else if (index === stageIndex) tone = 'text-burgundy'
                  return (
                    <li key={stage.label} className={tone}>
                      {index < stageIndex ? '✓ ' : ''}
                      {stage.label}
                    </li>
                  )
                })}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
