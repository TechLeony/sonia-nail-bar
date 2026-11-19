import type { Language, Service, Specialist } from '../types/domain'

export function hasBookingDetails(service: Service): boolean {
  return service.active && Number.isInteger(service.durationMinutes) && Number(service.durationMinutes) > 0 && Number(service.durationMinutes) <= 1440 &&
    service.priceMinor !== null && Number.isSafeInteger(service.priceMinor) && service.priceMinor >= 0
}
export function isServiceBookable(service: Service, specialists: Specialist[]): boolean {
  return hasBookingDetails(service) && specialists.some((specialist) => specialist.active && !!specialist.workingHours && specialist.serviceIds.includes(service.id))
}

const locales: Record<Language, string> = { tr: 'tr-TR', en: 'en-GB', ru: 'ru-RU' }

export function formatServicePrice(service: Service, language: Language, missing: string): string {
  if (service.priceMinor === null) return missing
  return new Intl.NumberFormat(locales[language], { style: 'currency', currency: service.currency, maximumFractionDigits: 2 }).format(service.priceMinor / 100)
}

export function serviceBookingHref(serviceId: string): string {
  return `/booking?${new URLSearchParams({ service: serviceId })}`
}

/** A URL preference is not a reservation. Unknown/inactive IDs are rejected. */
export function findSelectedService(id: string | null, services: Service[], specialists?: Specialist[]): Service | undefined {
  return id === null ? undefined : services.find((service) => service.id === id && (specialists ? isServiceBookable(service, specialists) : hasBookingDetails(service)))
}
