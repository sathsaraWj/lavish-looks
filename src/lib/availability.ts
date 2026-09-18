import { hashString } from './storage'

/**
 * Deterministic mock "already booked" slots so the demo shows a realistic,
 * partially-full schedule without any backend. Same date+time always
 * produces the same result.
 */
export function isMockPreBooked(date: string, time: string): boolean {
  if (!date) return false
  return hashString(`${date}|${time}`) % 4 === 0
}

export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}
