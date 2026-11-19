import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Appointment, AppointmentStatus } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { useBookingClock } from '../hooks/useBookingClock'
import { useBookingSettings } from '../hooks/useBookingSettings'
import { usePrototypeAppointments } from '../hooks/usePrototypeAppointments'
import { affectedAppointments, appointmentTouchesDates, calendarDates, dashboardMetrics, filterAppointments } from '../lib/management'
import { formatBookingDate, formatBookingTime, isCalendarDate, zonedParts } from '../lib/bookingTime'
import { AppointmentList } from '../components/manager/AppointmentList'
import { AppointmentDetails } from '../components/manager/AppointmentDetails'
import { AppointmentEditor } from '../components/manager/AppointmentEditor'
import { ConfirmAction } from '../components/manager/ConfirmAction'
import { ManagerDialog } from '../components/manager/ManagerDialog'
import { PendingAppointments } from '../components/manager/PendingAppointments'

export function ManagerPage() {
  const [params, setParams] = useSearchParams()
  const { language, t } = useI18n()
  const copy = t.manager
  const { now } = useBookingClock()
  const { appointments, storageReady } = usePrototypeAppointments()
  const { settings, settingsReady } = useBookingSettings()
  const today = zonedParts(now, settings.timeZone).date
  const [date, setDate] = useState(today)
  const [view, setView] = useState<'day' | 'week'>('day')
  const [status, setStatus] = useState<AppointmentStatus | 'all'>('all')
  const [specialistId, setSpecialist] = useState('')
  const [selectedId, setSelected] = useState<string | null>(() => params.get('appointment'))
  const [editor, setEditor] = useState<Appointment | 'new' | null>(null)
  const [action, setAction] = useState<{ appointment: Appointment; status: 'confirmed' | 'cancelled' | 'completed' } | null>(null)
  const [saved, setSaved] = useState(false)
  const dates = calendarDates(isCalendarDate(date) ? date : today, view)
  const filtered = filterAppointments(appointments, dates, status, specialistId, settings.timeZone)
  const metrics = dashboardMetrics(appointments, now, settings.timeZone)
  const affected = affectedAppointments(appointments, settings.closures, settings.timeZone)
  const affectedIds = affected.map((entry) => entry.appointment.id)
  const selected = appointments.find((entry) => entry.id === selectedId)
  const ready = storageReady && settingsReady
  function closeDetails() {
    setSelected(null)
    if (params.has('appointment')) {
      const next = new URLSearchParams(params)
      next.delete('appointment')
      setParams(next, { replace: true })
    }
  }
  function done(nextDate?: string) {
    setEditor(null); setAction(null); closeDetails(); setSaved(true)
    if (nextDate) { setDate(nextDate); setView('day'); setStatus('all'); setSpecialist('') }
  }
  const statusKeys = ['pending', 'confirmed', 'cancelled', 'completed'] as const
  return <div className="py-8 sm:py-10">
    <header className="mb-7 flex flex-wrap items-start justify-between gap-5"><div><h1 className="font-display text-4xl text-burgundy">{copy.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.description}</p></div><button type="button" className="button-primary" disabled={!ready} onClick={() => { setSaved(false); setEditor('new') }}>{copy.create}</button></header>
    {!ready && <p role="alert" className="prototype-notice mb-6">{t.booking.storageUnavailable}</p>}
    {saved && <p role="status" className="mb-5 text-sm text-rose">{copy.saved}</p>}
    <p className="mb-4 text-xs leading-6 text-muted">{copy.metricsNote} · {formatBookingDate(today, language, settings.timeZone, true)}</p>
    <div aria-live="polite" aria-atomic="true" className="grid grid-cols-2 gap-3 lg:grid-cols-4">{([
      ['total', copy.today], ['pending', copy.pending], ['confirmed', copy.confirmed], ['completed', copy.completed],
    ] as const).map(([key, label]) => <section key={key} className="rounded-2xl border border-line bg-ivory p-5"><h2 className="text-xs leading-5 text-muted">{label}</h2><p className="mt-3 text-3xl font-semibold text-burgundy">{ready ? metrics[key] : '—'}</p></section>)}</div>
    <PendingAppointments appointments={appointments} settings={settings} now={now} ready={ready} onApprove={(appointment) => stageStatus(appointment, 'confirmed')} onManage={setSelectedFromRecord} />
    {affected.length > 0 && <section className="my-8 rounded-2xl border border-rose bg-blush p-5" aria-labelledby="follow-up-heading"><h2 id="follow-up-heading" className="font-semibold text-burgundy">{copy.followUp} · {affected.length}</h2><p className="mt-3 text-sm leading-6">{copy.followUpNote}</p><div className="mt-5"><AppointmentList appointments={affected.map((entry) => entry.appointment)} settings={settings} affectedIds={affectedIds} onManage={setSelectedFromRecord} /></div></section>}
    <section aria-labelledby="calendar-heading" className="my-8 rounded-2xl border border-line bg-ivory p-5 sm:p-6">
      <h2 id="calendar-heading" className="text-xl font-semibold text-burgundy">{copy.calendar}</h2>
      <div className="my-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <div><label htmlFor="calendar-date" className="form-label">{copy.date}</label><input type="date" id="calendar-date" className="form-input" value={date} onChange={(event) => setDate(event.target.value)} /></div>
        <div><label htmlFor="calendar-view" className="form-label">{copy.calendar}</label><select id="calendar-view" className="form-input" value={view} onChange={(event) => setView(event.target.value as 'day' | 'week')}><option value="day">{copy.day}</option><option value="week">{copy.week}</option></select></div>
        <div><label htmlFor="filter-status" className="form-label">{copy.status}</label><select id="filter-status" className="form-input" value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus | 'all')}><option value="all">{copy.all}</option>{statusKeys.map((key) => <option key={key} value={key}>{copy.statuses[key]}</option>)}</select></div>
        <div><label htmlFor="filter-specialist" className="form-label">{copy.specialist}</label><select id="filter-specialist" className="form-input" value={specialistId} onChange={(event) => setSpecialist(event.target.value)}><option value="">{copy.all}</option>{settings.specialists.map((entry) => <option key={entry.id} value={entry.id}>{entry.name?.[language] ?? entry.displayName}</option>)}</select></div>
      </div>
      <div className={view === 'week' ? 'manager-week' : ''}>{dates.map((day) => {
        const entries = filtered.filter((entry) => appointmentTouchesDates(entry, day, day, settings.timeZone))
        return <section key={day} className="min-w-0 rounded-xl border border-line p-3"><h3 className="border-b border-line pb-3 text-sm font-semibold">{formatBookingDate(day, language, settings.timeZone)}</h3><div className="mt-3 space-y-2">{entries.length ? entries.map((entry) => <button key={entry.id} type="button" className={`calendar-entry status-${entry.status}`} onClick={() => setSelected(entry.id)}><span className="block text-xs">{formatBookingTime(entry.startsAt, language, settings.timeZone)} – {formatBookingTime(entry.endsAt, language, settings.timeZone)}</span><span className="mt-1 block font-medium">{entry.customer.name}</span><span className="mt-1 block text-xs">{copy.statuses[entry.status]}</span></button>) : <p className="py-4 text-xs text-muted">{copy.empty}</p>}</div></section>
      })}</div>
    </section>
    <section aria-labelledby="appointments-heading"><h2 id="appointments-heading" className="mb-5 text-xl font-semibold text-burgundy">{copy.list}</h2><AppointmentList appointments={filtered} settings={settings} affectedIds={affectedIds} onManage={setSelectedFromRecord} /></section>
    {selected && <ManagerDialog title={copy.details} onClose={closeDetails}><AppointmentDetails appointment={selected} settings={settings} />
      {selected.status === 'pending' || selected.status === 'confirmed' ? <div className="mt-6 space-y-4"><div className="flex flex-wrap gap-3">
        <button type="button" className="button-outline" disabled={!ready} onClick={() => { setEditor(selected); closeDetails() }}>{copy.edit}</button>
        {selected.status === 'pending' && <button type="button" className="button-primary" disabled={!ready} onClick={() => stageStatus(selected, 'confirmed')}>{copy.approve}</button>}
        <button type="button" className="button-outline" disabled={!ready} onClick={() => stageStatus(selected, 'cancelled')}>{copy.cancel}</button>
        {selected.status === 'confirmed' && <button type="button" className="button-outline" disabled={!ready || Date.parse(selected.endsAt) > now} onClick={() => stageStatus(selected, 'completed')}>{copy.complete}</button>}
      </div><p className="text-xs leading-6 text-muted">{copy.completeHint}</p></div> : <p className="mt-5 text-xs text-muted">{copy.terminalHint}</p>}
    </ManagerDialog>}
    {editor && <AppointmentEditor appointment={editor === 'new' ? undefined : editor} appointments={appointments} settings={settings} onClose={() => setEditor(null)} onSaved={done} />}
    {action && <ConfirmAction title={action.status === 'confirmed' ? copy.approve : action.status === 'cancelled' ? copy.cancel : copy.complete} message={action.status === 'confirmed' ? copy.approveMessage : action.status === 'cancelled' ? copy.cancelMessage : copy.completeMessage} command={{ kind: 'appointment', command: { type: 'status', expected: action.appointment, status: action.status } }} onClose={() => setAction(null)} onSaved={done}><div className="mt-5"><AppointmentDetails appointment={action.appointment} settings={settings} /></div></ConfirmAction>}
  </div>
  function setSelectedFromRecord(appointment: Appointment) { setSelected(appointment.id); setSaved(false) }
  function stageStatus(appointment: Appointment, nextStatus: 'confirmed' | 'cancelled' | 'completed') { closeDetails(); setSaved(false); setAction({ appointment, status: nextStatus }) }
}
