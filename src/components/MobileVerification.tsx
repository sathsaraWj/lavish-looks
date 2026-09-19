import { useEffect, useRef, useState } from 'react'
import { MOBILE_ERROR, SEND_OTP_DELAY_MS } from '../lib/otp'
import { normalizeSriLankanMobile } from '../lib/validation'
import { OtpModal } from './OtpModal'
import { Spinner } from './Spinner'

interface MobileVerificationProps {
  phone: string
  onPhoneChange: (value: string) => void
  /** Called once the customer has verified the number and chosen to continue. */
  onVerified: () => void
}

export function MobileVerification({ phone, onPhoneChange, onVerified }: Readonly<MobileVerificationProps>) {
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  // Guards against a second click landing before React has re-rendered the disabled state.
  const busyRef = useRef(false)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault()
    if (busyRef.current) return
    const normalized = normalizeSriLankanMobile(phone)
    if (!normalized) {
      setError(MOBILE_ERROR)
      inputRef.current?.focus()
      return
    }
    setError(null)
    busyRef.current = true
    setSending(true)
    // No SMS is sent. The short delay only stands in for the network round trip
    // so the loading state is visible before the verification dialog opens.
    timerRef.current = window.setTimeout(() => {
      busyRef.current = false
      setSending(false)
      setSentTo(normalized)
      setModalOpen(true)
    }, SEND_OTP_DELAY_MS)
  }

  const handleChangeNumber = () => {
    setModalOpen(false)
    // Wait for the dialog to hand focus back, then place the cursor in the number field.
    window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  return (
    <section className="rounded-2xl border border-gold-light/40 bg-cream p-6 sm:p-8">
      <h2 className="text-xl text-burgundy">Verify your mobile number</h2>
      <p className="mt-2 text-sm text-mauve">
        We&rsquo;ll send a six-digit verification code to your Dialog mobile number before you pay with
        Dialog Pay QR.
      </p>

      <form onSubmit={handleSend} noValidate className="mt-6">
        <label htmlFor="dialog-mobile" className="block text-sm font-semibold text-burgundy">
          Dialog mobile number
        </label>
        <input
          ref={inputRef}
          id="dialog-mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          readOnly={sending}
          onChange={(e) => {
            onPhoneChange(e.target.value)
            if (error) setError(null)
          }}
          placeholder="e.g. 077 123 4567"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'dialog-mobile-error' : 'dialog-mobile-hint'}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base focus:border-burgundy focus:outline-none read-only:bg-cream sm:text-sm"
        />
        {error ? (
          <p id="dialog-mobile-error" role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : (
          <p id="dialog-mobile-hint" className="mt-1 text-xs text-mauve">
            Used only to complete your payment through the Dialog Pay QR flow.
          </p>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {sending ? 'Sending verification code' : ''}
        </p>
        <button
          type="submit"
          disabled={sending || modalOpen}
          aria-busy={sending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {sending && <Spinner />}
          {sending ? 'Sending verification code…' : 'Send OTP'}
        </button>
      </form>

      <OtpModal open={modalOpen} mobile={sentTo} onCancel={handleChangeNumber} onContinue={onVerified} />
    </section>
  )
}
