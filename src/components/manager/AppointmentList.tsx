import type { Appointment, BookingSettings } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { catalogueServices } from '../../data/services'
import { formatBookingRange } from '../../lib/bookingTime'
import { CustomerContact } from './CustomerContact'
import { AppointmentDetails } from './AppointmentDetails'

export function AppointmentList({ appointments, settings, affectedIds = [], onManage, compact = false }: {
  appointments: Appointment[]; settings: BookingSettings; affectedIds?: string[]; compact?: boolean; onManage?: (appointment: Appointment) => void
}) {
  const { language, t } = useI18n()
  const copy = t.manager
  if (!appointments.length) return <p className="empty-state">{copy.empty}</p>
  return <>
    <div className={compact ? 'space-y-4' : 'space-y-4 xl:hidden'}>
      {appointments.map((entry) => <article key={entry.id} className="rounded-2xl border border-line bg-ivory p-5">
        {affectedIds.includes(entry.id) && <p className="mb-4 text-xs font-semibold text-rose">{copy.affected}</p>}
        <AppointmentDetails appointment={entry} settings={settings} />
        {onManage && <button type="button" className="manager-text-button mt-4" onClick={() => onManage(entry)}>{copy.details}<span className="sr-only"> · {entry.customer.name}</span></button>}
      </article>)}
    </div>
    {!compact && <div role="region" aria-label={copy.list} tabIndex={0} className="manager-table-region hidden overflow-x-auto rounded-2xl border border-line xl:block">
      <table className="manager-table"><caption className="sr-only">{copy.list}</caption><thead><tr>{[copy.customer, copy.phone, copy.service, copy.specialist, copy.time, copy.status, ...(onManage ? [copy.details] : [])].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{appointments.map((entry) => {
          const service = catalogueServices.find((item) => item.id === entry.serviceId)
          const specialist = settings.specialists.find((item) => item.id === entry.specialistId)
          return <tr key={entry.id}>
            <td>{entry.customer.name}{affectedIds.includes(entry.id) && <p className="mt-2 text-xs text-rose">{copy.affected}</p>}</td>
            <td><CustomerContact phone={entry.customer.phone} /></td><td>{service?.name[language] ?? entry.serviceId}</td><td>{specialist?.name?.[language] ?? specialist?.displayName ?? entry.specialistId}</td>
            <td>{formatBookingRange(entry.startsAt, entry.endsAt, language, settings.timeZone)}</td><td><span className={`status-badge status-${entry.status}`}>{copy.statuses[entry.status]}</span></td>
            {onManage && <td><button type="button" className="manager-text-button" onClick={() => onManage(entry)}>{copy.details}<span className="sr-only"> · {entry.customer.name}</span></button></td>}
          </tr>
        })}</tbody>
      </table>
    </div>}
  </>
}
