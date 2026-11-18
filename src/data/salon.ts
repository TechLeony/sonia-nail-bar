import type { BookingConfirmationMode, WorkingHours } from '../types/domain'

/** Replace only with client-approved details. null means unconfirmed. */
export const salonConfig = {
  name: 'Sonia Nail Bar',
  city: 'Ankara',
  country: 'Türkiye',
  address: null,
  phone: null,
  email: null,
  // Illustrative prototype policy; must be confirmed with the salon.
  bookingConfirmationMode: 'manual' as BookingConfirmationMode,
}

/** ILLUSTRATIVE booking hours, not verified Sonia opening hours. */
export const workingHours: WorkingHours = {
  timeZone: 'Europe/Istanbul',
  days: {
    monday: [{ opensAt: '10:00', closesAt: '19:00' }],
    tuesday: [{ opensAt: '10:00', closesAt: '19:00' }],
    wednesday: [{ opensAt: '10:00', closesAt: '19:00' }],
    thursday: [{ opensAt: '10:00', closesAt: '19:00' }],
    friday: [{ opensAt: '10:00', closesAt: '19:00' }],
    saturday: [{ opensAt: '10:00', closesAt: '18:00' }],
    sunday: [],
  },
}
