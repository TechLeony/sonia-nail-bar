import type { Appointment, AppointmentStatus, Service } from '../types/domain'
import { addCalendarDays, isCalendarDate, zonedParts } from './bookingTime'

export const reportingPeriods = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom'] as const
export type ReportingPeriod = typeof reportingPeriods[number]
export interface ReportingRange { startDate: string; endDate: string }
export type RangeResult = { ok: true; range: ReportingRange } | { ok: false; error: 'invalidDate' | 'dateOrder' }

/** Inclusive local dates, independent of the browser's timezone. */
export function reportingRange(period: ReportingPeriod, now: number, zone: string, custom: ReportingRange): RangeResult {
  if (period === 'custom') {
    if (!isCalendarDate(custom.startDate) || !isCalendarDate(custom.endDate)) return { ok: false, error: 'invalidDate' }
    if (custom.endDate < custom.startDate) return { ok: false, error: 'dateOrder' }
    return { ok: true, range: { ...custom } }
  }
  const today = zonedParts(now, zone).date
  if (period === 'thisWeek' || period === 'lastWeek') {
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
    const startDate = addCalendarDays(today, -((weekday + 6) % 7) - (period === 'lastWeek' ? 7 : 0))
    return { ok: true, range: { startDate, endDate: addCalendarDays(startDate, 6) } }
  }
  const first = new Date(`${today.slice(0, 7)}-01T12:00:00Z`)
  if (period === 'lastMonth') first.setUTCMonth(first.getUTCMonth() - 1)
  const startDate = first.toISOString().slice(0, 10)
  first.setUTCMonth(first.getUTCMonth() + 1)
  return { ok: true, range: { startDate, endDate: addCalendarDays(first.toISOString().slice(0, 10), -1) } }
}

export function analyticsMetrics(appointments: Appointment[], services: Service[], range: ReportingRange, zone: string) {
  const inPeriod = (timestamp: string | undefined) => {
    if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return false
    const date = zonedParts(Date.parse(timestamp), zone).date
    return range.startDate <= date && date <= range.endDate
  }
  const scheduled = appointments.filter((entry) => inPeriod(entry.startsAt))
  const statuses: Record<AppointmentStatus, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  for (const entry of scheduled) statuses[entry.status]++
  let estimatedValueMinor = 0, valuedCount = 0, missingPriceCount = 0, currentPriceCount = 0, scheduledFallbackCount = 0
  for (const entry of appointments) {
    if (entry.status !== 'completed' || !inPeriod(entry.completedAt ?? entry.startsAt)) continue
    if (!entry.completedAt) scheduledFallbackCount++
    const price = entry.servicePriceSnapshot === undefined
      ? services.find((service) => service.id === entry.serviceId)?.priceMinor
      : entry.servicePriceSnapshot.priceMinor
    if (price === null || price === undefined || !Number.isSafeInteger(price) || price < 0) { missingPriceCount++; continue }
    if (entry.servicePriceSnapshot === undefined) currentPriceCount++
    estimatedValueMinor += price
    valuedCount++
  }
  return {
    created: appointments.filter((entry) => inPeriod(entry.createdAt)).length,
    scheduled: scheduled.length, statuses,
    completedEvents: appointments.filter((entry) => entry.status === 'completed' && inPeriod(entry.completedAt)).length,
    cancelledEvents: appointments.filter((entry) => entry.status === 'cancelled' && inPeriod(entry.cancelledAt)).length,
    // These counts span ALL stored history: their event dates cannot be placed
    // in any reporting period. They must not be presented as period totals.
    unknownCompletionDates: appointments.filter((entry) => entry.status === 'completed' && !entry.completedAt).length,
    unknownCancellationDates: appointments.filter((entry) => entry.status === 'cancelled' && !entry.cancelledAt).length,
    estimatedValueMinor, valuedCount, missingPriceCount, currentPriceCount, scheduledFallbackCount,
  }
}
