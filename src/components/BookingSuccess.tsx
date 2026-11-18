import { useEffect, useRef } from 'react'
import { CircleCheck, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Appointment, Service, Specialist } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { formatBookingRange } from '../lib/bookingTime'
import { bookingSettings } from '../data/booking'

export function BookingSuccess({ appointment, service, specialist, onRestart }: {
  appointment: Appointment; service: Service; specialist: Specialist; onRestart: () => void
}) {
  const { language, t } = useI18n()
  const copy = t.booking
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  const confirmed = appointment.status === 'confirmed'
  const Icon = confirmed ? CircleCheck : Clock3
  const zone = bookingSettings.timeZone
  return (
    <div className="mx-auto max-w-3xl py-12 sm:py-20">
      <Icon size={42} className="text-rose" aria-hidden="true" />
      <p className="eyebrow mt-6">{copy.eyebrow}</p>
      <h1 ref={heading} tabIndex={-1} className="section-title mt-4">{confirmed ? copy.confirmedTitle : copy.pendingTitle}</h1>
      <p className="mt-5 text-sm leading-7 text-muted">{confirmed ? copy.confirmedNote : copy.pendingNote}</p>
      <dl className="booking-summary mt-8 rounded-3xl border border-line bg-blush p-6">
        <div><dt>{copy.service}</dt><dd>{service.name[language]}</dd></div>
        <div><dt>{copy.specialist}</dt><dd>{specialist.name?.[language] ?? specialist.displayName}</dd></div>
        <div><dt>{copy.time}</dt><dd>{formatBookingRange(appointment.startsAt, appointment.endsAt, language, zone)}</dd></div>
        <div><dt>{copy.status}</dt><dd>{confirmed ? copy.confirmed : copy.pending}</dd></div>
        <div><dt>{copy.reference}</dt><dd className="break-all text-xs">{appointment.id}</dd></div>
      </dl>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button type="button" className="button-primary" onClick={onRestart}>{copy.newBooking}</button>
        <Link to="/" className="text-link">{copy.home}</Link>
      </div>
    </div>
  )
}
