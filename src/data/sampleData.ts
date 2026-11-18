import type { Appointment, SalonClosure, Service, Specialist } from '../types/domain'

/** ILLUSTRATIVE ONLY: not Sonia Nail Bar's actual catalogue or personnel.
 * Never automatically seed these fixtures into browser storage.
 */
export const illustrativeServices: Service[] = [{
  id: 'demo-service-1',
  categoryId: 'manicure',
  name: { tr: 'Örnek hizmet', en: 'Sample service', ru: 'Пример услуги' },
  description: {
    tr: 'Yalnızca veri yapısını göstermek için.',
    en: 'For illustrating the data structure only.',
    ru: 'Только для демонстрации структуры данных.',
  },
  durationMinutes: null,
  priceMinor: null,
  currency: 'TRY',
  active: false,
  illustrative: true,
}]

export const illustrativeSpecialists: Specialist[] = [{
  id: 'demo-specialist-1',
  displayName: 'Demo specialist — illustrative only',
  serviceIds: ['demo-service-1'],
  active: false,
  illustrative: true,
}]

// No fabricated appointments or closure dates.
export const illustrativeAppointments: Appointment[] = []
export const illustrativeClosures: SalonClosure[] = []
