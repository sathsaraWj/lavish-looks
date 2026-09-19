import { useEffect, useRef, useState } from 'react'
import {
  OTP_ERRORS,
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  RESEND_OTP_DELAY_MS,
  VERIFY_OTP_DELAY_MS,
  formatCountdown,
  maskMobile,
  parsePastedCode,
  validateOtpCode,
} from '../lib/otp'
import { useModalBehavior } from '../lib/useModalBehavior'
import { Spinner } from './Spinner'

type Phase = 'entry' | 'verifying' | 'success'

interface OtpModalProps {
  open: boolean
  /** Local ten-digit mobile number, e.g. 0771234567. */
  mobile: string
  /** Customer closed the dialog to change the number. */
  onCancel: () => void
  /** Verification finished and the customer chose to continue. */
  onContinue: () => void
}

const emptyDigits = () => Array.from({ length: OTP_LENGTH }, () => '')

export function OtpModal({ open, ...props }: Readonly<OtpModalProps>) {
  if (!open) return null
  // Mounted only while open so every opening starts with fresh state and timers.
  return <OtpDialog {...props} />
}

function OtpDialog({ mobile, onCancel, onContinue }: Readonly<Omit<OtpModalProps, 'open'>>) {
  const [digits, setDigits] = useState<string[]>(emptyDigits)
  const [phase, setPhase] = useState<Phase>('entry')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendAt, setResendAt] = useState(() => Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)

  const dialogRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const continueRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  // Guards against a second click landing before React has re-rendered the disabled state.
  const busyRef = useRef(false)

  const masked = maskMobile(mobile)
  const inputsLocked = phase !== 'entry' || resending
  const canResend = phase === 'entry' && !resending && secondsLeft === 0

  const handleEscape = () => {
    if (phase === 'entry' && !resending) onCancel()
    else if (phase === 'success') onContinue()
  }
  // Declared before the focus effect so it records the opener as the element to restore focus to.
  useModalBehavior(dialogRef, handleEscape)

  useEffect(() => {
    inputsRef.current[0]?.focus()
    return () => window.clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    if (phase === 'success') continueRef.current?.focus()
  }, [phase])

  // Resend cooldown, measured against a fixed timestamp so a throttled background tab stays accurate.
  useEffect(() => {
    if (phase === 'success') return undefined
    const id = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)))
    }, 500)
    return () => window.clearInterval(id)
  }, [resendAt, phase])

  const focusBox = (index: number) => inputsRef.current[index]?.focus()

  const setBox = (index: number, value: string) =>
    setDigits((prev) => prev.map((d, i) => (i === index ? value : d)))

  const applyDigits = (text: string, startIndex: number) => {
    const parsed = parsePastedCode(text)
    if (!parsed) return
    if ('error' in parsed) {
      setError(parsed.error)
      return
    }
    setError(null)
    setNotice(null)
    const incoming = parsed.digits.split('')
    if (incoming.length === OTP_LENGTH) {
      setDigits(incoming)
      focusBox(OTP_LENGTH - 1)
      return
    }
    setDigits((prev) => prev.map((d, i) => (i >= startIndex && i - startIndex < incoming.length ? incoming[i - startIndex] : d)))
    focusBox(Math.min(startIndex + incoming.length, OTP_LENGTH - 1))
  }

  const handleChange = (index: number, raw: string) => {
    if (inputsLocked) return
    let value = raw.replace(/\s/g, '')
    if (value === '') {
      setBox(index, '')
      setError(null)
      return
    }
    // Typing over an existing digit without the box being selected yields two characters.
    const existing = digits[index]
    if (value.length === 2 && existing && value.includes(existing)) {
      value = value.replace(existing, '')
    }
    if (value.length === 1) {
      if (!/\d/.test(value)) {
        setError(OTP_ERRORS.digitsOnly)
        return
      }
      setBox(index, value)
      setError(null)
      setNotice(null)
      if (index < OTP_LENGTH - 1) focusBox(index + 1)
      return
    }
    // More than one character: SMS auto-fill or a paste routed through onChange.
    applyDigits(value, index)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputsLocked) return
    if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
      event.preventDefault()
      setBox(index - 1, '')
      setError(null)
      focusBox(index - 1)
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (inputsLocked) return
    applyDigits(event.clipboardData.getData('text'), index)
  }

  const handleVerify = (event: React.FormEvent) => {
    event.preventDefault()
    if (busyRef.current || inputsLocked) return
    const problem = validateOtpCode(digits.join(''))
    if (problem) {
      setError(problem)
      const firstEmpty = digits.indexOf('')
      focusBox(firstEmpty === -1 ? 0 : firstEmpty)
      return
    }
    setError(null)
    setNotice(null)
    busyRef.current = true
    setPhase('verifying')
    // Intentional for the presentation flow: any six-digit code is accepted, so
    // "verifying" is just a short timer. No request is made anywhere.
    timerRef.current = window.setTimeout(() => {
      busyRef.current = false
      setPhase('success')
    }, VERIFY_OTP_DELAY_MS)
  }

  const handleResend = () => {
    if (busyRef.current || !canResend) return
    busyRef.current = true
    setResending(true)
    setError(null)
    setNotice(null)
    timerRef.current = window.setTimeout(() => {
      busyRef.current = false
      setResending(false)
      setDigits(emptyDigits())
      setResendAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)
      setNotice(`A new verification code has been sent to ${masked}.`)
      focusBox(0)
    }, RESEND_OTP_DELAY_MS)
  }

  const linkButton =
    'font-semibold text-burgundy underline underline-offset-2 transition hover:text-burgundy-light disabled:cursor-not-allowed disabled:text-mauve/60 disabled:no-underline'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-title"
          tabIndex={-1}
          className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl outline-none sm:p-8"
        >
          <p className="sr-only" role="status" aria-live="polite">
            {phase === 'success' ? 'Verification successful' : phase === 'verifying' ? 'Verifying code' : ''}
          </p>

          {phase === 'success' ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
                ✓
              </div>
              <h2 id="otp-title" className="mt-4 text-xl text-burgundy">
                Verification successful
              </h2>
              <p className="mt-2 text-sm text-mauve">Your mobile number {masked} has been verified.</p>
              <button
                ref={continueRef}
                type="button"
                onClick={onContinue}
                className="mt-6 w-full rounded-full bg-burgundy px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
              >
                Continue to Dialog Pay QR
              </button>
            </>
          ) : (
            <form onSubmit={handleVerify} noValidate>
              <h2 id="otp-title" className="text-xl text-burgundy">
                Enter verification code
              </h2>
              <p id="otp-label" className="mt-2 text-sm text-mauve">
                Enter the six-digit verification code sent to{' '}
                <span className="whitespace-nowrap font-semibold text-burgundy">{masked}</span>.
              </p>

              <div role="group" aria-labelledby="otp-label" className="mt-6 flex justify-center gap-1.5 sm:gap-2">
                {digits.map((digit, index) => (
                  <input
                    key={`otp-box-${index}`}
                    ref={(el) => {
                      inputsRef.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    enterKeyHint="done"
                    value={digit}
                    readOnly={inputsLocked}
                    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'otp-error' : undefined}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(index, e)}
                    onFocus={(e) => e.target.select()}
                    className={`h-12 max-w-[3.25rem] min-w-0 flex-1 rounded-xl border bg-white text-center text-xl font-semibold text-burgundy transition focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20 read-only:bg-cream ${
                      error ? 'border-red-500' : digit ? 'border-burgundy/50' : 'border-black/15'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p id="otp-error" role="alert" className="mt-3 text-xs text-red-600">
                  {error}
                </p>
              )}
              <p role="status" aria-live="polite" className="mt-3 min-h-4 text-xs text-mauve">
                {notice}
              </p>

              <button
                type="submit"
                disabled={inputsLocked}
                aria-busy={phase === 'verifying'}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {phase === 'verifying' && <Spinner />}
                {phase === 'verifying' ? 'Verifying…' : 'Verify OTP'}
              </button>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
                <button type="button" onClick={handleResend} disabled={!canResend} className={linkButton}>
                  {resending ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Sending verification code…
                    </span>
                  ) : secondsLeft > 0 ? (
                    `Resend OTP in ${formatCountdown(secondsLeft)}`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
                <button type="button" onClick={onCancel} disabled={inputsLocked} className={linkButton}>
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
