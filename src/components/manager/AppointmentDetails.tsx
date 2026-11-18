import type { Appointment, BookingSettings } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { catalogueServices } from '../../data/services'
import { formatBookingRange } from '../../lib/bookingTime'
import { CustomerContact } from './CustomerContact'

export function AppointmentDetails({ appointment, settings }: { appointment: Appointment; settings: BookingSettings }) {
  const { language, t } = useI18n()
  const service = catalogueServices.find((entry) => entry.id === appointment.serviceId)
  const specialist = settings.specialists.find((entry) => entry.id === appointment.specialistId)
  return <dl className="booking-summary">
    <div><dt>{t.manager.customer}</dt><dd>{appointment.customer.name}</dd></div>
    <div><dt>{t.manager.phone}</dt><dd><CustomerContact phone={appointment.customer.phone} /></dd></div>
    <div><dt>{t.manager.service}</dt><dd>{service?.name[language] ?? `${t.manager.unknown} (${appointment.serviceId})`}</dd></div>
    <div><dt>{t.manager.specialist}</dt><dd>{specialist?.name?.[language] ?? specialist?.displayName ?? `${t.manager.unknown} (${appointment.specialistId})`}</dd></div>
    <div><dt>{t.manager.time}</dt><dd>{formatBookingRange(appointment.startsAt, appointment.endsAt, language, settings.timeZone)}</dd></div>
    <div><dt>{t.manager.status}</dt><dd><span className={`status-badge status-${appointment.status}`}>{t.manager.statuses[appointment.status]}</span></dd></div>
  </dl>
}
