export const PHONE_PATTERN = /^(?:\+94|0)7\d{8}$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const POSTAL_CODE_PATTERN = /^\d{5}$/

export function generateReference(prefix: string): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`
}
