import type { Language, SalonClosure } from '../types/domain'
import { isCalendarDate, localInstants } from './bookingTime'

export type ClosurePeriod = 'single' | 'range'

/** Keep Turkish wording intact; normalize only surrounding/duplicate whitespace. */
export function normalizeClosureDescription(description: string): string {
  return description.replace(/\s+/gu, ' ').trim()
}

export function closureDraft(id: string, period: ClosurePeriod, first: string, last: string, description: string, existing?: SalonClosure): SalonClosure {
  return {
    id, startDate: first, endDate: period === 'single' ? first : last,
    // Keep legacy translations for compatibility/future approved support. The
    // customer message currently uses only the original Turkish description.
    reason: { en: '', ru: '', ...existing?.reason, tr: normalizeClosureDescription(description) },
    illustrative: existing?.illustrative ?? true,
  }
}

export function closureOnDate(closures: SalonClosure[], date: string): SalonClosure | undefined {
  if (!isCalendarDate(date)) return undefined
  return closures.filter((closure) => isCalendarDate(closure.startDate) && isCalendarDate(closure.endDate) && closure.startDate <= date && date <= closure.endDate)
    .sort((a, b) => Number(!!normalizeClosureDescription(b.reason.tr)) - Number(!!normalizeClosureDescription(a.reason.tr)) || a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id))[0]
}

export function formatClosureDates(closure: Pick<SalonClosure, 'startDate' | 'endDate'>, language: Language, zone: string): string {
  const formatter = new Intl.DateTimeFormat({ tr: 'tr-TR', en: 'en-GB', ru: 'ru-RU' }[language], { timeZone: zone, day: 'numeric', month: 'long', year: 'numeric' })
  const first = new Date(localInstants(closure.startDate, '12:00', zone)[0])
  const last = new Date(localInstants(closure.endDate, '12:00', zone)[0])
  return closure.startDate === closure.endDate ? formatter.format(first) : formatter.formatRange(first, last)
}
