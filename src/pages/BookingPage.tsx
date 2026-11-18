import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookingSuccess } from '../components/BookingSuccess'
import { PageIntro } from '../components/PageIntro'
import { ServiceFacts } from '../components/ServiceFacts'
import { catalogueServices } from '../data/services'
import { useI18n } from '../hooks/useI18n'
import { usePrototypeAppointments } from '../hooks/usePrototypeAppointments'
import { useBookingClock } from '../hooks/useBookingClock'
import { useBookingSettings } from '../hooks/useBookingSettings'
import { availableSlots, customerErrors } from '../lib/availability'
import type { BookingError } from '../lib/availability'
import { submitPrototypeBooking } from '../lib/appointmentStore'
import { bookingDates, formatBookingDate, formatBookingTime, formatBookingRange } from '../lib/bookingTime'
import { findSelectedService } from '../lib/catalogue'
import type { Appointment } from '../types/domain'

export function BookingPage() {
  const [params, setParams] = useSearchParams()
  const serviceId = params.get('service')
  return <BookingFlow key={serviceId ?? ''} serviceId={serviceId} onServiceChange={(id) => setParams(id ? { service: id } : {})} />
}

function BookingFlow({ serviceId, onServiceChange }: { serviceId: string | null; onServiceChange: (id: string) => void }) {
  const { language, t } = useI18n()
  const copy = t.booking
  const { settings: bookingSettings, settingsReady } = useBookingSettings()
  const service = findSelectedService(serviceId, catalogueServices)
  const [step, setStep] = useState(0)
  const [specialistId, setSpecialistId] = useState('')
  const [date, setDate] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [fields, setFields] = useState<{ name?: true; phone?: true }>({})
  const [error, setError] = useState<BookingError | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<Appointment | null>(null)
  const { now, updateNow } = useBookingClock()
  const busy = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const errorSummary = useRef<HTMLParagraphElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const phoneInput = useRef<HTMLInputElement>(null)
  const { appointments, storageReady, refresh } = usePrototypeAppointments()
  useEffect(() => { if (step > 0) heading.current?.focus() }, [step])
  useEffect(() => { if (error) errorSummary.current?.focus() }, [error])
  const specialists = bookingSettings.specialists.filter((entry) => entry.active && !!service && entry.serviceIds.includes(service.id))
  const specialist = specialists.find((entry) => entry.id === specialistId)
  const dates = bookingDates(now, bookingSettings.timeZone, bookingSettings.bookingWindowDays)
  const slots = service && storageReady && settingsReady ? availableSlots({ date, service, specialistId, settings: bookingSettings, appointments, now }) : []
  const slot = slots.find((entry) => entry.startsAt === startsAt)
  const steps = [copy.service, copy.specialist, copy.time, copy.customer]
  const canContinue = step === 0 ? !!service && service.durationMinutes !== null : step === 1 ? !!specialist : !!slot

  function move(next: number) { setError(null); setStep(next) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    if (step < 3) { if (canContinue) move(step + 1); return }
    const invalid = customerErrors(customer)
    setFields(invalid)
    if (invalid.name || invalid.phone) { (invalid.name ? nameInput : phoneInput).current?.focus(); return }
    if (!service || !specialist || !startsAt) { setError('selection'); return }
    busy.current = true
    setSaving(true)
    setError(null)
    try {
      const result = await submitPrototypeBooking({ serviceId: service.id, specialistId, startsAt, customer }, catalogueServices, bookingSettings)
      refresh()
      updateNow()
      if (result.ok) { setSuccess(result.appointment); setCustomer({ name: '', phone: '' }) }
      else {
        setError(result.error)
        if (result.error === 'unavailable') { setStartsAt(''); setStep(2) }
      }
    } finally { busy.current = false; setSaving(false) }
  }
  function restart() {
    setSuccess(null); setStep(0); setSpecialistId(''); setDate(''); setStartsAt(''); setCustomer({ name: '', phone: '' }); setError(null); setFields({}); refresh(); updateNow()
  }
  if (success && service && specialist) return <BookingSuccess appointment={success} service={service} specialist={specialist} onRestart={restart} />

  return (
    <div className="pb-16">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <p className="prototype-notice">{copy.notice}</p>
      <nav aria-label={copy.progress} className="my-8">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((label, index) => <li key={index}>
            <button type="button" className="booking-progress" disabled={index > step || saving} aria-current={index === step ? 'step' : undefined} onClick={() => move(index)}>
              <span aria-hidden="true">{index + 1}</span>{label}
            </button>
          </li>)}
        </ol>
      </nav>
      <div className="grid items-start gap-7 lg:grid-cols-[1.5fr_1fr]">
        <form noValidate onSubmit={submit} aria-busy={saving} className="booking-panel">
          <h2 ref={heading} tabIndex={-1} className="font-display text-3xl text-burgundy">{steps[step]}</h2>
          {(!storageReady || !settingsReady) && <p role="alert" className="mt-5 text-sm leading-6 text-rose">{copy.storageUnavailable}</p>}
          {error && <p ref={errorSummary} tabIndex={-1} role="alert" className="mt-5 text-sm leading-6 text-rose">{copy.errors[error]}</p>}
          {step === 0 && <div className="mt-6">
            <label className="form-label" htmlFor="booking-service">{copy.chooseService}</label>
            <select id="booking-service" value={service?.id ?? ''} className="form-input" onChange={(event) => onServiceChange(event.target.value)}>
              <option value="">{copy.chooseService}</option>
              {catalogueServices.filter((entry) => entry.active).map((entry) => <option key={entry.id} value={entry.id}>{entry.name[language]}</option>)}
            </select>
            {!service && <p className="mt-4 text-sm leading-6 text-muted">{serviceId === null ? t.catalogue.booking.noSelection : t.catalogue.booking.invalid}</p>}
            <Link to="/services" className="text-link mt-4">{t.catalogue.booking.choose}</Link>
          </div>}
          {step === 1 && <fieldset className="mt-6"><legend className="form-label">{copy.chooseSpecialist}</legend>
            <div className="mt-3 grid gap-3">
              {specialists.map((entry) => <label key={entry.id} className="booking-choice">
                <input type="radio" name="specialist" value={entry.id} checked={specialistId === entry.id} onChange={() => { setSpecialistId(entry.id); setDate(''); setStartsAt('') }} />
                <span><span className="block text-sm font-medium">{entry.name?.[language] ?? entry.displayName}</span>{entry.illustrative && <span className="mt-1 block text-xs text-muted">{copy.demoSpecialist}</span>}</span>
              </label>)}
              {specialists.length === 0 && <p className="empty-state">{copy.noSpecialists}</p>}
            </div>
          </fieldset>}
          {step === 2 && <div className="mt-6">
            <fieldset><legend className="form-label">{copy.date}</legend><p className="mt-2 text-xs leading-5 text-muted">{copy.dateHint}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dates.map((day) => <label key={day} className="booking-choice">
                  <input type="radio" name="date" value={day} checked={date === day} onChange={() => { setDate(day); setStartsAt(''); setError(null) }} />
                  <span className="text-sm">{formatBookingDate(day, language, bookingSettings.timeZone)}</span>
                </label>)}
              </div>
            </fieldset>
            <fieldset className="mt-7"><legend className="form-label">{copy.slot}</legend>
              {!date ? <p className="mt-3 text-sm text-muted">{copy.chooseDate}</p> : slots.length === 0 ? <p role="status" className="empty-state mt-3">{copy.noSlots}</p> : (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((entry) => <label key={entry.startsAt} className="booking-choice">
                    <input type="radio" name="time" value={entry.startsAt} checked={startsAt === entry.startsAt} onChange={() => { setStartsAt(entry.startsAt); setError(null) }} />
                    <span className="text-xs">{formatBookingTime(entry.startsAt, language, bookingSettings.timeZone)}</span>
                  </label>)}
                </div>
              )}
            </fieldset>
          </div>}
          {step === 3 && <div className="mt-6 space-y-6">
            {!slot && <div role="alert"><p className="text-sm text-rose">{copy.errors.unavailable}</p><button type="button" className="text-link mt-3" onClick={() => move(2)}>{copy.slot}</button></div>}
            <div><label htmlFor="customer-name" className="form-label">{copy.name}</label>
              <input ref={nameInput} id="customer-name" autoComplete="off" disabled={saving} maxLength={80} required value={customer.name} className="form-input" aria-invalid={!!fields.name} aria-describedby={fields.name ? 'name-error' : undefined} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
              {fields.name && <p id="name-error" role="alert" className="field-error">{copy.errors.name}</p>}
            </div>
            <div><label htmlFor="customer-phone" className="form-label">{copy.phone}</label>
              <input ref={phoneInput} id="customer-phone" type="tel" inputMode="tel" autoComplete="off" disabled={saving} maxLength={32} required value={customer.phone} className="form-input" aria-invalid={!!fields.phone} aria-describedby={`phone-hint${fields.phone ? ' phone-error' : ''}`} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
              <p id="phone-hint" className="mt-2 text-xs leading-5 text-muted">{copy.phoneHint}</p>
              {fields.phone && <p id="phone-error" role="alert" className="field-error">{copy.errors.phone}</p>}
            </div>
            <p className="rounded-2xl bg-blush p-4 text-sm leading-6">{bookingSettings.confirmationMode === 'automatic' ? copy.automatic : copy.manual}</p>
          </div>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {step > 0 && <button type="button" className="button-outline" disabled={saving} onClick={() => move(step - 1)}>{copy.back}</button>}
            {step < 3 ? <button type="submit" disabled={!canContinue} className="button-primary">{copy.next}<ArrowRight size={17} aria-hidden="true" /></button> : <button type="submit" disabled={saving || !storageReady || !settingsReady || !slot} className="button-primary">{saving ? copy.saving : copy.submit}</button>}
          </div>
          <p className="sr-only" role="status">{saving ? copy.saving : ''}</p>
        </form>
        <aside className="booking-panel bg-blush/50" aria-label={copy.summary}>
          <p className="eyebrow">{copy.summary}</p>
          {service ? <>
            <h2 id="selected-service" className="mt-4 font-display text-2xl text-burgundy">{service.name[language]}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{service.description[language]}</p>
            {service.illustrative && <p className="mt-4 text-xs leading-5 text-rose">{t.catalogue.booking.demo}</p>}
            <ServiceFacts service={service} />
            <dl className="booking-summary mt-5">
              {specialist && <div><dt>{copy.specialist}</dt><dd>{specialist.name?.[language] ?? specialist.displayName}</dd></div>}
              {date && <div><dt>{copy.date}</dt><dd>{formatBookingDate(date, language, bookingSettings.timeZone)}</dd></div>}
              {slot && <div><dt>{copy.time}</dt><dd>{formatBookingRange(slot.startsAt, slot.endsAt, language, bookingSettings.timeZone)}</dd></div>}
            </dl>
          </> : <p className="mt-4 text-sm text-muted">{copy.chooseService}</p>}
        </aside>
      </div>
    </div>
  )
}
