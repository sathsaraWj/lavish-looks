/*
 * One-time-passcode helpers for the mobile verification step.
 *
 * IMPORTANT: this website is a static presentation. It has no SMS service, no
 * backend and no payment gateway, so there is no real code to compare against.
 * Any six-digit numeric code is accepted ON PURPOSE for the presentation flow.
 * "Sending", "verifying" and "processing" are all driven by local timers and
 * component state. Nothing here makes a network request.
 */

export const OTP_LENGTH = 6
export const RESEND_COOLDOWN_SECONDS = 30

export const SEND_OTP_DELAY_MS = 1500
export const VERIFY_OTP_DELAY_MS = 1200
export const RESEND_OTP_DELAY_MS = 1200
export const PAYMENT_DURATION_MS = 5000

export const MOBILE_ERROR = 'Enter a valid Sri Lankan mobile number, e.g. 077 123 4567.'

export const OTP_ERRORS = {
  incomplete: 'Enter all six digits of the verification code.',
  digitsOnly: 'The verification code can only contain numbers.',
  tooLong: 'The verification code must be exactly six digits.',
} as const

/** 0771234567 -> 077 *** 4567 */
export function maskMobile(local: string): string {
  return `${local.slice(0, 3)} *** ${local.slice(-4)}`
}

/** 0771234567 -> 077 123 4567 */
export function formatMobile(local: string): string {
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

/** Returns an error message, or null when the code is exactly six digits. */
export function validateOtpCode(code: string): string | null {
  if (/\D/.test(code)) return OTP_ERRORS.digitsOnly
  if (code.length < OTP_LENGTH) return OTP_ERRORS.incomplete
  if (code.length > OTP_LENGTH) return OTP_ERRORS.tooLong
  return null
}

export type PastedCode = { digits: string } | { error: string } | null

/**
 * Interprets text pasted (or auto-filled) into an OTP box. Spaces and hyphens
 * are ignored so "123 456" works. Returns null when there is nothing to use.
 */
export function parsePastedCode(text: string): PastedCode {
  const compact = text.replace(/[\s-]/g, '')
  if (compact === '') return null
  if (/\D/.test(compact)) return { error: OTP_ERRORS.digitsOnly }
  if (compact.length > OTP_LENGTH) return { error: OTP_ERRORS.tooLong }
  return { digits: compact }
}

export function formatCountdown(seconds: number): string {
  return `0:${String(seconds).padStart(2, '0')}`
}
