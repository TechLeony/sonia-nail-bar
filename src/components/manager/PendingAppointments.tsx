import type { Appointment, BookingSettings } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { pendingAppointments } from '../../lib/management'
import { AppointmentDetails } from './AppointmentDetails'

export function PendingAppointments({ appointments, settings, now, ready, onApprove, onManage }: {
  appointments: Appointment[]; settings: BookingSettings; now: number; ready: boolean
  onApprove: (appointment: Appointment) => void; onManage: (appointment: Appointment) => void
}) {
  const { t } = useI18n()
  const copy = t.manager
  const { upcoming, past } = pendingAppointments(appointments, now)
  return <section aria-labelledby="pending-heading" className="my-8 rounded-2xl border border-rose bg-blush p-5 sm:p-6">
    <h2 id="pending-heading" className="text-xl font-semibold text-burgundy">{copy.pendingTitle} · {ready ? upcoming.length + past.length : '—'}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{copy.pendingNote}</p>
    {!ready ? <p role="alert" className="mt-5 text-sm text-rose">{t.booking.storageUnavailable}</p> : <>
      {!upcoming.length && !past.length && <p role="status" className="empty-state mt-5">{copy.pendingEmpty}</p>}
      {([{ label: copy.upcoming, entries: upcoming, isPast: false }, { label: copy.pastPending, entries: past, isPast: true }]).map(({ label, entries, isPast }) => entries.length > 0 && <div key={label} className="mt-6">
        <h3 className="font-semibold text-burgundy">{label}</h3>
        {isPast && <p className="mt-2 text-sm leading-6 text-muted">{copy.pastPendingNote}</p>}
        <div className="mt-4 grid gap-4 xl:grid-cols-2">{entries.map((entry) => <article key={entry.id} className="min-w-0 rounded-xl border border-line bg-ivory p-4 sm:p-5">
          <AppointmentDetails appointment={entry} settings={settings} />
          <div className="mt-5 flex flex-wrap gap-3">
            {!isPast && <button type="button" className="button-primary" onClick={() => onApprove(entry)}>{copy.approve}<span className="sr-only"> · {entry.customer.name}</span></button>}
            <button type="button" className="button-outline" onClick={() => onManage(entry)}>{copy.viewEdit}<span className="sr-only"> · {entry.customer.name}</span></button>
          </div>
        </article>)}</div>
      </div>)}
    </>}
  </section>
}
