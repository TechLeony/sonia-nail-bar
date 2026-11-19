import type { Appointment, BookingSettings, Service } from '../types/domain'
import { createStorageEntry } from './storage'
import { customerErrors, prepareAppointment } from './availability'
import { isCalendarDate } from './bookingTime'
import { readBookingSettings } from './salonSettingsStore'
import { notifyPrototypeUpdate, PROTOTYPE_UPDATED, withBookingLock } from './prototypeSync'
import type { BookingRequest, BookingResult } from './availability'

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const timestamp = (value: unknown): value is string => typeof value === 'string' && isCalendarDate(value.slice(0, 10)) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value))
export function isAppointment(value: unknown): value is Appointment {
  if (!record(value) || !record(value.customer)) return false
  const customer = value.customer
  return typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.serviceId === 'string' && value.serviceId.length > 0 &&
    typeof value.specialistId === 'string' && value.specialistId.length > 0 &&
    timestamp(value.startsAt) && timestamp(value.endsAt) && timestamp(value.createdAt) &&
    ['updatedAt', 'completedAt', 'cancelledAt'].every((key) => value[key] === undefined || timestamp(value[key])) &&
    (value.servicePriceSnapshot === undefined || (record(value.servicePriceSnapshot) && value.servicePriceSnapshot.currency === 'TRY' &&
      (value.servicePriceSnapshot.priceMinor === null || (Number.isSafeInteger(value.servicePriceSnapshot.priceMinor) && Number(value.servicePriceSnapshot.priceMinor) >= 0)))) &&
    Date.parse(value.startsAt) < Date.parse(value.endsAt) &&
    typeof customer.name === 'string' && typeof customer.phone === 'string' &&
    Object.keys(customerErrors({ name: customer.name, phone: customer.phone })).length === 0 &&
    (customer.email === undefined || typeof customer.email === 'string') &&
    ['pending', 'confirmed', 'cancelled', 'completed'].includes(String(value.status)) &&
    (value.confirmationMode === 'manual' || value.confirmationMode === 'automatic') && typeof value.illustrative === 'boolean'
}
export function isAppointmentList(value: unknown): value is Appointment[] {
  return Array.isArray(value) && value.every(isAppointment) && new Set(value.map((entry) => entry.id)).size === value.length
}
export const appointmentStore = createStorageEntry('appointments', isAppointmentList)

/** Shared by mounted operational and reporting views; return full cleanup. */
export function subscribeToAppointmentChanges(refresh: () => void): () => void {
  const sync = (event: StorageEvent) => { if (event.key === appointmentStore.key || event.key === null) refresh() }
  window.addEventListener('storage', sync)
  window.addEventListener('focus', refresh)
  window.addEventListener(PROTOTYPE_UPDATED, refresh)
  return () => {
    window.removeEventListener('storage', sync)
    window.removeEventListener('focus', refresh)
    window.removeEventListener(PROTOTYPE_UPDATED, refresh)
  }
}

/** Reads and validates again inside the lock, immediately before writing.
 * Web Locks serialize cooperating same-origin tabs where available. localStorage
 * alone has no atomic cross-tab transaction or cross-device availability.
 */
export async function submitPrototypeBooking(request: BookingRequest, services: Service[], settings: BookingSettings): Promise<BookingResult> {
  const commit = (): BookingResult => {
    const latest = appointmentStore.readResult()
    if (!latest.ok) return { ok: false, error: 'storage' }
    const currentSettings = readBookingSettings(settings)
    if (!currentSettings.ok) return { ok: false, error: 'storage' }
    const appointments = latest.value ?? []
    const result = prepareAppointment(request, services, currentSettings.settings, appointments, Date.now(), crypto.randomUUID())
    if (!result.ok) return result
    if (!appointmentStore.write([...appointments, result.appointment])) return { ok: false, error: 'storage' }
    notifyPrototypeUpdate()
    return result
  }
  try {
    return await withBookingLock(commit)
  } catch { return { ok: false, error: 'storage' } }
}
