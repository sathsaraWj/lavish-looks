export const PHONE_PATTERN = /^(?:\+94|94|0)7\d{8}$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const POSTAL_CODE_PATTERN = /^\d{5}$/

/**
 * Accepts Sri Lankan mobile numbers written as 077 123 4567, 077-123-4567,
 * 0771234567, +94771234567 or 94771234567 and returns the local ten-digit
 * form (0771234567). Returns null when the input is not a valid mobile number.
 */
export function normalizeSriLankanMobile(input: string): string | null {
  const compact = input.replace(/[\s-]/g, '')
  if (!PHONE_PATTERN.test(compact)) return null
  return compact.replace(/^(?:\+94|94)/, '0')
}

export function generateReference(prefix: string): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`
}
