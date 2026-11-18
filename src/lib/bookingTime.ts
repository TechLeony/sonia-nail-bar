import type { Language } from '../types/domain'

const formatters = new Map<string, Intl.DateTimeFormat>()
function formatter(zone: string) {
  if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat('en-CA', {
    timeZone: zone, calendar: 'iso8601', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }))
  return formatters.get(zone)!
}

export function isCalendarDate(date: string): boolean {
  const value = Date.parse(`${date}T00:00:00Z`)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date
}
export function addCalendarDays(date: string, days: number): string {
  if (!isCalendarDate(date) || !Number.isInteger(days)) throw new Error('Invalid calendar date')
  // UTC arithmetic is used only on a calendar label, never to choose salon today.
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
export function zonedParts(instant: number, zone: string) {
  const parts = Object.fromEntries(formatter(zone).formatToParts(instant).map((part) => [part.type, part.value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`, second: parts.second }
}

/** All matching instants: [] for a DST gap, two for a repeated wall-clock time.
 * Offsets are discovered from the runtime's IANA rules, never hard-coded +03.
 */
const instantCache = new Map<string, number[]>()
export function localInstants(date: string, time: string, zone: string): number[] {
  if (!isCalendarDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return []
  const key = `${zone}|${date}|${time}`
  const cached = instantCache.get(key)
  if (cached) return [...cached]
  const nominal = Date.parse(`${date}T${time}:00Z`)
  const offsets = new Set<number>()
  for (let hours = -36; hours <= 36; hours += 6) {
    const sample = nominal + hours * 3_600_000
    const parts = zonedParts(sample, zone)
    offsets.add(Date.parse(`${parts.date}T${parts.time}:${parts.second}Z`) - sample)
  }
  const matches = [...offsets].map((offset) => nominal - offset).filter((instant) => {
    const parts = zonedParts(instant, zone)
    return parts.date === date && parts.time === time && parts.second === '00'
  }).sort((a, b) => a - b)
  if (instantCache.size >= 2048) instantCache.clear()
  instantCache.set(key, matches)
  return [...matches]
}

export function bookingDates(now: number, zone: string, count = 7): string[] {
  if (!Number.isFinite(now) || !Number.isInteger(count) || count < 1 || count > 7) return []
  const today = zonedParts(now, zone).date
  return Array.from({ length: count }, (_, index) => addCalendarDays(today, index))
}
const locales: Record<Language, string> = { tr: 'tr-TR', en: 'en-GB', ru: 'ru-RU' }
export function formatBookingDate(date: string, language: Language, zone: string, includeYear = false): string {
  const instant = localInstants(date, '12:00', zone)[0]
  return new Intl.DateTimeFormat(locales[language], { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric', ...(includeYear ? { year: 'numeric' as const } : {}) }).format(instant)
}
export function formatBookingTime(instant: string, language: Language, zone: string): string {
  // Includes the offset so repeated DST wall times remain distinguishable.
  return new Intl.DateTimeFormat(locales[language], { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'shortOffset' }).format(new Date(instant))
}

export function formatBookingRange(startsAt: string, endsAt: string, language: Language, zone: string): string {
  const firstDate = zonedParts(Date.parse(startsAt), zone).date
  const lastDate = zonedParts(Date.parse(endsAt), zone).date
  const endLabel = lastDate !== firstDate ? `${formatBookingDate(lastDate, language, zone, true)}, ` : ''
  return `${formatBookingDate(firstDate, language, zone, true)}, ${formatBookingTime(startsAt, language, zone)} – ${endLabel}${formatBookingTime(endsAt, language, zone)}`
}
