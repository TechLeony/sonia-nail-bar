export type Language = 'tr' | 'en' | 'ru'
export type LocalizedText = Record<Language, string>
export type BookingConfirmationMode = 'automatic' | 'manual'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
/** ISO calendar date: YYYY-MM-DD. Validate at the future input boundary. */
export type CalendarDate = string
/** Local 24-hour time: HH:mm, interpreted in the salon time zone. */
export type LocalTime = string
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type ServiceCategoryId = 'manicure' | 'pedicure' | 'lashes' | 'nailArt' | 'permanentMakeup' | 'skinCare' | 'laser'
export interface ServiceCategory {
  id: ServiceCategoryId
  name: LocalizedText
  description: LocalizedText
}

export type GalleryCategoryId = ServiceCategoryId | 'salon' | 'brows'
export interface GalleryItem {
  id: string
  categoryId: GalleryCategoryId
  title: LocalizedText
  alt: LocalizedText
  description?: LocalizedText
  /** Local approved image path; null renders a labelled placeholder. */
  src: string | null
  illustrative: boolean
}

export interface Service {
  id: string
  categoryId: ServiceCategoryId
  name: LocalizedText
  description: LocalizedText
  durationMinutes: number | null
  /** Integer minor units (kuruş); null means not supplied. */
  priceMinor: number | null
  currency: 'TRY'
  active: boolean
  illustrative: boolean
}

export interface Specialist {
  id: string
  displayName: string
  name?: LocalizedText
  workingHours?: WorkingHours
  serviceIds: string[]
  active: boolean
  illustrative: boolean
}

export interface Appointment {
  id: string
  serviceId: string
  specialistId: string
  /** ISO 8601 timestamps with an explicit offset. */
  startsAt: string
  endsAt: string
  customer: { name: string; phone: string; email?: string }
  status: AppointmentStatus
  confirmationMode: BookingConfirmationMode
  createdAt: string
  /** Optional for legacy v1 records; never backfilled with guessed history. */
  updatedAt?: string
  completedAt?: string
  cancelledAt?: string
  servicePriceSnapshot?: { priceMinor: number | null; currency: 'TRY' }
  illustrative: boolean
}

export interface SalonClosure {
  id: string
  startDate: CalendarDate
  endDate: CalendarDate
  reason: LocalizedText
  illustrative: boolean
}

export interface TimeRange {
  opensAt: LocalTime
  closesAt: LocalTime
}

/** null = unconfirmed; [] = closed; multiple intervals allow breaks. */
export interface WorkingHours {
  timeZone: 'Europe/Istanbul'
  days: Record<Weekday, TimeRange[] | null>
}

export interface BookingSettings {
  timeZone: 'Europe/Istanbul'
  bookingWindowDays: 7
  appointmentIntervalMinutes: number
  confirmationMode: BookingConfirmationMode
  salonHours: WorkingHours
  specialists: Specialist[]
  closures: SalonClosure[]
  illustrative: boolean
}

export interface AppointmentSlot {
  startsAt: string
  endsAt: string
}
