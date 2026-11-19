import type { Appointment, AppointmentStatus, BookingSettings, SalonClosure, Service } from '../types/domain'
import type { BookingError, BookingRequest } from './availability'
import { prepareAppointment } from './availability'
import { addCalendarDays, isCalendarDate, zonedParts } from './bookingTime'

export type ManagerError = BookingError | 'notFound' | 'stale' | 'transition' | 'tooEarly' | 'closure'
export type ManagerResult<T> = { ok: true; value: T } | { ok: false; error: ManagerError }
export type AppointmentCommand =
  | { type: 'create'; request: BookingRequest; status: 'confirmed' | 'pending' }
  | { type: 'edit'; expected: Appointment; request: BookingRequest }
  | { type: 'status'; expected: Appointment; status: 'confirmed' | 'cancelled' | 'completed' }

export function applyAppointmentCommand(command: AppointmentCommand, appointments: Appointment[], services: Service[], settings: BookingSettings, now: number, newId: string): ManagerResult<Appointment[]> {
  if (command.type === 'create') {
    const prepared = prepareAppointment(command.request, services, settings, appointments, now, newId)
    if (!prepared.ok) return prepared
    if (command.status !== 'confirmed' && command.status !== 'pending') return { ok: false, error: 'transition' }
    return { ok: true, value: [...appointments, { ...prepared.appointment, status: command.status }] }
  }
  const current = appointments.find((entry) => entry.id === command.expected.id)
  if (!current) return { ok: false, error: 'notFound' }
  if (JSON.stringify(current) !== JSON.stringify(command.expected)) return { ok: false, error: 'stale' }
  if (current.status !== 'pending' && current.status !== 'confirmed') return { ok: false, error: 'transition' }
  let updated: Appointment
  const updatedAt = new Date(now).toISOString()
  if (command.type === 'status' && command.status === 'cancelled') updated = { ...current, status: 'cancelled', cancelledAt: updatedAt, updatedAt }
  else if (command.type === 'status' && command.status === 'completed') {
    if (current.status !== 'confirmed') return { ok: false, error: 'transition' }
    if (Date.parse(current.endsAt) > now) return { ok: false, error: 'tooEarly' }
    updated = { ...current, status: 'completed', completedAt: updatedAt, updatedAt }
  } else {
    if (command.type === 'status' && (command.status !== 'confirmed' || current.status !== 'pending')) return { ok: false, error: 'transition' }
    // Existing customer identity always comes from the stored record, never
    // from edit input (including invalid or tampered customer values).
    const request = command.type === 'edit' ? { ...command.request, customer: current.customer } : {
      serviceId: current.serviceId, specialistId: current.specialistId, startsAt: current.startsAt, customer: current.customer,
    }
    // Approval preserves the booked duration even if catalogue durations change.
    const validationServices = command.type === 'status' ? services.map((entry) => entry.id === current.serviceId ? { ...entry, durationMinutes: (Date.parse(current.endsAt) - Date.parse(current.startsAt)) / 60_000 } : entry) : services
    const prepared = prepareAppointment(request, validationServices, settings, appointments.filter((entry) => entry.id !== current.id), now, current.id)
    if (!prepared.ok) return prepared
    const { servicePriceSnapshot, ...preparedFields } = prepared.appointment
    updated = { ...current, ...preparedFields, id: current.id, createdAt: current.createdAt, updatedAt, confirmationMode: current.confirmationMode,
      status: command.type === 'edit' ? current.status : 'confirmed',
      customer: { ...current.customer },
      // Keep the booked price on approval/reschedule; a different service gets
      // its own current price. Legacy same-service records stay unsnapshotted.
      ...(current.serviceId !== prepared.appointment.serviceId ? { servicePriceSnapshot } : {}),
    }
  }
  return { ok: true, value: appointments.map((entry) => entry.id === current.id ? updated : entry) }
}

export function appointmentTouchesDates(appointment: Appointment, first: string, last: string, zone: string): boolean {
  const start = zonedParts(Date.parse(appointment.startsAt), zone).date
  const end = zonedParts(Date.parse(appointment.endsAt) - 1, zone).date
  return start <= last && first <= end
}
export function affectedAppointments(appointments: Appointment[], closures: SalonClosure[], zone: string) {
  return appointments.filter((entry) => entry.status === 'pending' || entry.status === 'confirmed').flatMap((appointment) => {
    const closureIds = closures.filter((closure) => appointmentTouchesDates(appointment, closure.startDate, closure.endDate, zone)).map((closure) => closure.id)
    return closureIds.length ? [{ appointment, closureIds }] : []
  })
}
export function dashboardMetrics(appointments: Appointment[], now: number, zone: string) {
  const date = zonedParts(now, zone).date
  const today = appointments.filter((entry) => zonedParts(Date.parse(entry.startsAt), zone).date === date)
  return { total: today.filter((entry) => entry.status !== 'cancelled').length,
    pending: appointments.filter((entry) => entry.status === 'pending').length,
    confirmed: appointments.filter((entry) => entry.status === 'confirmed').length,
    completed: appointments.filter((entry) => entry.status === 'completed').length }
}
export function pendingAppointments(appointments: Appointment[], now: number) {
  const pending = appointments.filter((entry) => entry.status === 'pending').sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id.localeCompare(b.id))
  return { upcoming: pending.filter((entry) => Date.parse(entry.startsAt) > now), past: pending.filter((entry) => Date.parse(entry.startsAt) <= now) }
}
export function calendarDates(date: string, view: 'day' | 'week'): string[] {
  if (!isCalendarDate(date)) return []
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  const start = view === 'day' ? date : addCalendarDays(date, -((weekday + 6) % 7))
  return Array.from({ length: view === 'day' ? 1 : 7 }, (_, index) => addCalendarDays(start, index))
}
export function filterAppointments(appointments: Appointment[], dates: string[], status: AppointmentStatus | 'all', specialistId: string, zone: string): Appointment[] {
  if (!dates.length) return []
  return appointments.filter((entry) => (status === 'all' || entry.status === status) && (!specialistId || entry.specialistId === specialistId) && appointmentTouchesDates(entry, dates[0], dates[dates.length - 1], zone)).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id.localeCompare(b.id))
}
/** Do not guess a country code for local numbers. Only explicit international
 * numbers yield a WhatsApp URL. This is a link, never automated messaging. */
export function customerWhatsAppHref(phone: string): string | null {
  const trimmed = phone.trim()
  if (!/^(?:\+|00)[\d\s().-]+$/.test(trimmed)) return null
  const rawDigits = trimmed.replace(/\D/g, '')
  const digits = trimmed.startsWith('00') ? rawDigits.slice(2) : rawDigits
  return /^[1-9]\d{7,14}$/.test(digits) ? `https://wa.me/${digits}` : null
}
