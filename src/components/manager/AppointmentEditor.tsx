import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Appointment, BookingSettings } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { useBookingClock } from '../../hooks/useBookingClock'
import { catalogueServices } from '../../data/services'
import { bookingSettings } from '../../data/booking'
import { availableSlots, customerErrors } from '../../lib/availability'
import { bookingDates, formatBookingRange, formatBookingTime, zonedParts } from '../../lib/bookingTime'
import { executeManagerCommand } from '../../lib/managerStore'
import type { ManagerError } from '../../lib/management'
import { findSelectedService, isServiceBookable } from '../../lib/catalogue'
import { ManagerDialog } from './ManagerDialog'
import { CustomerContact } from './CustomerContact'

export function AppointmentEditor({ appointment, appointments, settings, onClose, onSaved }: {
  appointment?: Appointment; appointments: Appointment[]; settings: BookingSettings; onClose: () => void; onSaved: (date: string) => void
}) {
  const { language, t } = useI18n()
  const copy = t.manager
  const { now } = useBookingClock()
  const dates = bookingDates(now, settings.timeZone, settings.bookingWindowDays)
  const originalDate = appointment ? zonedParts(Date.parse(appointment.startsAt), settings.timeZone).date : ''
  const [serviceId, setService] = useState(appointment?.serviceId ?? '')
  const [specialistId, setSpecialist] = useState(appointment?.specialistId ?? '')
  const [date, setDate] = useState(dates.includes(originalDate) ? originalDate : dates[0])
  const [startsAt, setStart] = useState(appointment?.startsAt ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const customer = appointment?.customer ?? { name, phone }
  const [status, setStatus] = useState<'pending' | 'confirmed'>('confirmed')
  const [review, setReview] = useState(false)
  const [busy, setBusy] = useState(false)
  const guard = useRef(false)
  const [error, setError] = useState<ManagerError | null>(null)
  const [fields, setFields] = useState<{ name?: true; phone?: true }>({})
  const service = findSelectedService(serviceId, catalogueServices, settings.specialists)
  const specialists = settings.specialists.filter((entry) => entry.active && entry.serviceIds.includes(serviceId))
  const slots = service ? availableSlots({ date, service, specialistId, settings, appointments: appointments.filter((entry) => entry.id !== appointment?.id), now }) : []
  const slot = slots.find((entry) => entry.startsAt === startsAt)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (guard.current) return
    const invalid = customerErrors(customer); setFields(invalid)
    if (Object.keys(invalid).length) { setError('customer'); return }
    if (!slot || !service) { setError('selection'); return }
    if (!review) { setError(null); setReview(true); return }
    guard.current = true; setBusy(true); setError(null)
    const request = { serviceId, specialistId, startsAt, customer }
    const result = await executeManagerCommand({ kind: 'appointment', command: appointment ? { type: 'edit', expected: appointment, request } : { type: 'create', request, status } }, catalogueServices, bookingSettings)
    guard.current = false; setBusy(false)
    if (result.ok) onSaved(date)
    else { setError(result.error); if (result.error === 'unavailable') { setReview(false); setStart('') } }
  }
  return <ManagerDialog title={review ? copy.review : appointment ? copy.edit : copy.create} busy={busy} onClose={onClose}>
    <form noValidate onSubmit={(event) => void submit(event)}>
      <p className="mb-5 text-xs leading-6 text-muted">{copy.windowHint}</p>
      {error && <p role="alert" className="field-error mb-5">{copy.errors[error]}</p>}
      {review ? <div className="space-y-4 text-sm leading-7">
        <p>{appointment ? copy.editMessage : copy.createMessage}</p>
        <p className="font-medium">{service?.name[language]} · {specialists.find((entry) => entry.id === specialistId)?.name?.[language] ?? specialists.find((entry) => entry.id === specialistId)?.displayName}</p>
        {slot && <p>{formatBookingRange(slot.startsAt, slot.endsAt, language, settings.timeZone)}</p>}
        <p>{customer.name} · {customer.phone}</p>
        <p>{copy.status}: {copy.statuses[appointment?.status ?? status]}</p>
      </div> : <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="manager-service" className="form-label">{t.booking.service}</label><select id="manager-service" className="form-input" value={service?.id ?? ''} onChange={(event) => { setService(event.target.value); setSpecialist(''); setStart('') }}><option value="">{t.booking.chooseService}</option>{catalogueServices.filter((entry) => isServiceBookable(entry, settings.specialists)).map((entry) => <option key={entry.id} value={entry.id}>{entry.name[language]}</option>)}</select></div>
        <div><label htmlFor="manager-specialist" className="form-label">{t.booking.specialist}</label><select id="manager-specialist" className="form-input" value={specialistId} onChange={(event) => { setSpecialist(event.target.value); setStart('') }}><option value="">{t.booking.chooseSpecialist}</option>{specialists.map((entry) => <option key={entry.id} value={entry.id}>{entry.name?.[language] ?? entry.displayName}</option>)}</select></div>
        <div><label htmlFor="manager-date" className="form-label">{copy.date}</label><input type="date" id="manager-date" className="form-input" value={date} min={dates[0]} max={dates[dates.length - 1]} onChange={(event) => { setDate(event.target.value); setStart('') }} /></div>
        <div className="sm:col-span-2"><label htmlFor="manager-time" className="form-label">{t.booking.slot}</label><select id="manager-time" className="form-input" value={slot?.startsAt ?? ''} onChange={(event) => setStart(event.target.value)}><option value="">{t.booking.slot}</option>{slots.map((entry) => <option key={entry.startsAt} value={entry.startsAt}>{formatBookingTime(entry.startsAt, language, settings.timeZone)}</option>)}</select>{service && specialistId && !slots.length && <p role="status" className="mt-2 text-xs leading-6 text-rose">{t.booking.noSlots}</p>}</div>
        {appointment ? <section className="sm:col-span-2 rounded-xl border border-line bg-blush p-4" aria-labelledby="existing-customer-heading">
          <h3 id="existing-customer-heading" className="form-label">{copy.customer}</h3>
          <p className="mt-2 text-xs leading-6 text-muted">{copy.identityReadOnly}</p>
          <dl className="booking-summary mt-4">
            <div><dt>{t.booking.name}</dt><dd className="select-text break-words">{customer.name}</dd></div>
            <div><dt>{copy.phone}</dt><dd><CustomerContact phone={customer.phone} /></dd></div>
          </dl>
        </section> : <>
        <div><label htmlFor="manager-name" className="form-label">{t.booking.name}</label><input id="manager-name" className="form-input" value={name} maxLength={80} aria-invalid={!!fields.name} aria-describedby={fields.name ? 'manager-name-error' : undefined} onChange={(event) => setName(event.target.value)} />{fields.name && <p id="manager-name-error" className="field-error">{t.booking.errors.name}</p>}</div>
        <div><label htmlFor="manager-phone" className="form-label">{t.booking.phone}</label><input id="manager-phone" type="tel" className="form-input" value={phone} maxLength={32} aria-invalid={!!fields.phone} aria-describedby={fields.phone ? 'manager-phone-error' : undefined} onChange={(event) => setPhone(event.target.value)} />{fields.phone && <p id="manager-phone-error" className="field-error">{t.booking.errors.phone}</p>}</div>
        </>}
        {!appointment && <div className="sm:col-span-2"><label htmlFor="manager-status" className="form-label">{copy.status}</label><select id="manager-status" className="form-input" value={status} onChange={(event) => setStatus(event.target.value as 'pending' | 'confirmed')}><option value="confirmed">{copy.statuses.confirmed}</option><option value="pending">{copy.statuses.pending}</option></select></div>}
        <p className="text-xs leading-6 text-muted sm:col-span-2">{copy.windowHint}</p>
      </div>}
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className="button-primary" disabled={busy}>{busy ? copy.saving : review ? copy.confirm : copy.review}</button>{review && <button type="button" className="button-outline" disabled={busy} onClick={() => { setReview(false); setError(null) }}>{copy.back}</button>}</div>
    </form>
  </ManagerDialog>
}
