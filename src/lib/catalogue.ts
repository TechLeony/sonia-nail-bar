import type { Language, Service } from '../types/domain'

const locales: Record<Language, string> = { tr: 'tr-TR', en: 'en-GB', ru: 'ru-RU' }

export function formatServicePrice(service: Service, language: Language, missing: string): string {
  if (service.priceMinor === null) return missing
  return new Intl.NumberFormat(locales[language], { style: 'currency', currency: service.currency, maximumFractionDigits: 2 }).format(service.priceMinor / 100)
}

export function serviceBookingHref(serviceId: string): string {
  return `/booking?${new URLSearchParams({ service: serviceId })}`
}

/** A URL preference is not a reservation. Unknown/inactive IDs are rejected. */
export function findSelectedService(id: string | null, services: Service[]): Service | undefined {
  return id === null ? undefined : services.find((service) => service.id === id && service.active)
}
