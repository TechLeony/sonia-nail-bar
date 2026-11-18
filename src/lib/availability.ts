import type { Appointment, AppointmentSlot, BookingSettings, Service, WorkingHours, Weekday } from '../types/domain'
import { addCalendarDays, bookingDates, isCalendarDate, localInstants, zonedParts } from './bookingTime'

type Interval = { start: number; end: number }
const weekdays: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const minutes = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN
const timeLabel = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}
function ranges(date: string, hours: WorkingHours) {
  return hours.days[weekdays[new Date(`${date}T12:00:00Z`).getUTCDay()]] ?? []
}
function intervals(dates: string[], hours: WorkingHours): Interval[] {
  const result: Interval[] = []
  for (const date of dates) for (const range of ranges(date, hours)) {
    const open = minutes(range.opensAt), close = minutes(range.closesAt)
    if (!Number.isFinite(open) || !Number.isFinite(close) || open === close) continue
    const starts = localInstants(date, range.opensAt, hours.timeZone)
    const ends = localInstants(close < open ? addCalendarDays(date, 1) : date, range.closesAt, hours.timeZone)
    // Conservative at missing DST boundary times; repeated boundaries encompass
    // both instances. Contiguous ranges merge; gaps/lunch breaks stay separate.
    if (starts.length && ends.length) result.push({ start: starts[0], end: ends[ends.length - 1] })
  }
  const merged: Interval[] = []
  for (const entry of result.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1]
    if (last && last.end >= entry.start) last.end = Math.max(last.end, entry.end)
    else merged.push({ ...entry })
  }
  return merged
}

export interface AvailabilityInput {
  date: string
  service: Service
  specialistId: string
  settings: BookingSettings
  appointments: Appointment[]
  now: number
}

export function availableSlots(input: AvailabilityInput): AppointmentSlot[] {
  const { date, service, specialistId, settings, appointments, now } = input
  const specialist = settings.specialists.find((entry) => entry.id === specialistId && entry.active && entry.serviceIds.includes(service.id))
  const step = settings.appointmentIntervalMinutes
  const duration = service.durationMinutes
  if (!isCalendarDate(date) || !Number.isFinite(now) || !service.active || duration === null ||
    !Number.isInteger(duration) || duration < 1 || duration > 1440 || !Number.isInteger(step) || step < 1 || step > 1440 ||
    !specialist?.workingHours || settings.timeZone !== settings.salonHours.timeZone || settings.timeZone !== specialist.workingHours.timeZone ||
    !bookingDates(now, settings.timeZone, settings.bookingWindowDays).includes(date)) return []
  if (settings.closures.some((entry) => !isCalendarDate(entry.startDate) || !isCalendarDate(entry.endDate) || entry.startDate > entry.endDate)) return []
  const days = [addCalendarDays(date, -1), date, addCalendarDays(date, 1)]
  const salon = intervals(days, settings.salonHours)
  const staff = intervals(days, specialist.workingHours)
  const active = appointments.filter((entry) => entry.specialistId === specialistId && (entry.status === 'pending' || entry.status === 'confirmed'))
  if (active.some((entry) => !Number.isFinite(Date.parse(entry.startsAt)) || !Number.isFinite(Date.parse(entry.endsAt)) || Date.parse(entry.startsAt) >= Date.parse(entry.endsAt))) return []
  const candidates = new Set<number>()
  // Anchor the configurable interval to each salon opening, using wall-clock
  // labels. Checking previous day includes overnight carry-over slots.
  for (const sourceDate of days.slice(0, 2)) for (const range of ranges(sourceDate, settings.salonHours)) {
    const open = minutes(range.opensAt), close = minutes(range.closesAt)
    if (!Number.isFinite(open) || !Number.isFinite(close) || open === close) continue
    const limit = close < open ? close + 1440 : close
    for (let minute = open; minute < limit; minute += step) {
      const candidateDate = minute >= 1440 ? addCalendarDays(sourceDate, 1) : sourceDate
      if (candidateDate !== date) continue
      for (const instant of localInstants(candidateDate, timeLabel(minute % 1440), settings.timeZone)) candidates.add(instant)
    }
  }
  return [...candidates].sort((a, b) => a - b).flatMap((start) => {
    const end = start + duration * 60_000
    if (start <= now || !salon.some((range) => range.start <= start && end <= range.end) ||
      !staff.some((range) => range.start <= start && end <= range.end) ||
      active.some((entry) => overlaps(start, end, Date.parse(entry.startsAt), Date.parse(entry.endsAt)))) return []
    // end is exclusive: a booking ending at midnight does not occupy the next day.
    const firstDate = zonedParts(start, settings.timeZone).date
    const lastDate = zonedParts(end - 1, settings.timeZone).date
    if (settings.closures.some((entry) => entry.startDate <= lastDate && firstDate <= entry.endDate)) return []
    return [{ startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() }]
  })
}

export function customerErrors(customer: { name: string; phone: string }): { name?: true; phone?: true } {
  const digits = customer.phone.replace(/\D/g, '')
  return {
    ...(customer.name.trim().length < 2 || customer.name.trim().length > 80 || [...customer.name].some((character) => character.charCodeAt(0) < 32) ? { name: true as const } : {}),
    ...(!/^\+?[\d\s().-]+$/.test(customer.phone.trim()) || digits.length < 8 || digits.length > 15 || customer.phone.length > 32 ? { phone: true as const } : {}),
  }
}
export interface BookingRequest { serviceId: string; specialistId: string; startsAt: string; customer: { name: string; phone: string } }
export type BookingError = 'selection' | 'unavailable' | 'customer' | 'storage' | 'configuration'
export type BookingResult = { ok: true; appointment: Appointment } | { ok: false; error: BookingError }

/** Pure submission revalidation. The caller supplies the latest store and clock. */
export function prepareAppointment(request: BookingRequest, services: Service[], settings: BookingSettings, appointments: Appointment[], now: number, id: string): BookingResult {
  if (Object.keys(customerErrors(request.customer)).length) return { ok: false, error: 'customer' }
  if (settings.confirmationMode !== 'manual' && settings.confirmationMode !== 'automatic') return { ok: false, error: 'configuration' }
  const service = services.find((entry) => entry.id === request.serviceId && entry.active)
  if (!service || !id || appointments.some((entry) => entry.id === id) || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(request.startsAt) || !Number.isFinite(Date.parse(request.startsAt)) || !isCalendarDate(request.startsAt.slice(0, 10))) return { ok: false, error: 'selection' }
  const date = zonedParts(Date.parse(request.startsAt), settings.timeZone).date
  const slot = availableSlots({ date, service, specialistId: request.specialistId, settings, appointments, now }).find((entry) => Date.parse(entry.startsAt) === Date.parse(request.startsAt))
  if (!slot) return { ok: false, error: 'unavailable' }
  return { ok: true, appointment: {
    id, serviceId: service.id, specialistId: request.specialistId, ...slot,
    customer: { name: request.customer.name.trim(), phone: request.customer.phone.trim() },
    confirmationMode: settings.confirmationMode, status: settings.confirmationMode === 'automatic' ? 'confirmed' : 'pending',
    createdAt: new Date(now).toISOString(), illustrative: settings.illustrative || service.illustrative || settings.specialists.some((entry) => entry.id === request.specialistId && entry.illustrative),
  } }
}
