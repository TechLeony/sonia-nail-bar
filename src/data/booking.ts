import type { BookingSettings, Specialist, WorkingHours } from '../types/domain'
import { salonConfig, workingHours } from './salon'
import { catalogueServices } from './services'

// Fictional demo identities and schedules. Replace only with approved details.
const demoHours = (): WorkingHours => structuredClone(workingHours)
export const bookingSpecialists: Specialist[] = [
  {
    id: 'demo-specialist-a', displayName: 'Demo specialist A',
    name: { tr: 'Örnek uzman A', en: 'Demo specialist A', ru: 'Демо-специалист A' },
    serviceIds: catalogueServices.map((service) => service.id),
    active: true, illustrative: true, workingHours: demoHours(),
  },
  {
    id: 'demo-specialist-b', displayName: 'Demo specialist B',
    name: { tr: 'Örnek uzman B', en: 'Demo specialist B', ru: 'Демо-специалист B' },
    serviceIds: catalogueServices.filter((service) => service.categoryId !== 'lashes').map((service) => service.id),
    active: true, illustrative: true,
    workingHours: {
      timeZone: 'Europe/Istanbul',
      days: {
        monday: [{ opensAt: '12:00', closesAt: '17:00' }],
        tuesday: [{ opensAt: '12:00', closesAt: '17:00' }],
        wednesday: [], thursday: [{ opensAt: '12:00', closesAt: '17:00' }],
        friday: [{ opensAt: '12:00', closesAt: '17:00' }],
        saturday: [{ opensAt: '12:00', closesAt: '16:00' }], sunday: [],
      },
    },
  },
]

export const bookingSettings: BookingSettings = {
  timeZone: 'Europe/Istanbul', bookingWindowDays: 7,
  appointmentIntervalMinutes: 15,
  confirmationMode: salonConfig.bookingConfirmationMode,
  salonHours: workingHours, specialists: bookingSpecialists,
  // Inclusive local calendar date ranges. No invented salon closure dates.
  closures: [], illustrative: true,
}
