import type { BookingConfirmationMode, BookingSettings, SalonClosure } from '../types/domain'
import { createStorageEntry } from './storage'
import { isCalendarDate } from './bookingTime'

export interface SalonPreferences { confirmationMode: BookingConfirmationMode; closures: SalonClosure[] }
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
export function isSalonClosure(value: unknown): value is SalonClosure {
  if (!record(value) || !record(value.reason)) return false
  return typeof value.id === 'string' && value.id.length > 0 && typeof value.startDate === 'string' && typeof value.endDate === 'string' &&
    isCalendarDate(value.startDate) && isCalendarDate(value.endDate) && value.startDate <= value.endDate &&
    ['tr', 'en', 'ru'].every((language) => typeof (value.reason as Record<string, unknown>)[language] === 'string' && String((value.reason as Record<string, unknown>)[language]).length <= 500) && typeof value.illustrative === 'boolean'
}
export function isSalonPreferences(value: unknown): value is SalonPreferences {
  return record(value) && (value.confirmationMode === 'manual' || value.confirmationMode === 'automatic') && Array.isArray(value.closures) &&
    value.closures.every(isSalonClosure) && new Set(value.closures.map((entry) => entry.id)).size === value.closures.length
}
export const salonPreferencesStore = createStorageEntry('salon-settings', isSalonPreferences)
export function readBookingSettings(base: BookingSettings): { ok: true; settings: BookingSettings } | { ok: false } {
  const result = salonPreferencesStore.readResult()
  if (!result.ok) return { ok: false }
  return { ok: true, settings: result.value ? { ...base, ...result.value } : base }
}
