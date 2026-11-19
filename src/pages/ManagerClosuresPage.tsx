import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SalonClosure } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { useBookingSettings } from '../hooks/useBookingSettings'
import { usePrototypeAppointments } from '../hooks/usePrototypeAppointments'
import { affectedAppointments } from '../lib/management'
import { AppointmentList } from '../components/manager/AppointmentList'
import { ClosureEditor } from '../components/manager/ClosureEditor'
import { ConfirmAction } from '../components/manager/ConfirmAction'
import { formatClosureDates, normalizeClosureDescription } from '../lib/closures'

export function ManagerClosuresPage() {
  const { language, t } = useI18n()
  const copy = t.manager
  const navigate = useNavigate()
  const { appointments, storageReady } = usePrototypeAppointments()
  const { settings, settingsReady } = useBookingSettings()
  const [editor, setEditor] = useState<SalonClosure | 'new' | null>(null)
  const [removing, setRemoving] = useState<SalonClosure | null>(null)
  const [saved, setSaved] = useState(false)
  const affected = affectedAppointments(appointments, settings.closures, settings.timeZone)
  const ready = storageReady && settingsReady
  function done() { setEditor(null); setRemoving(null); setSaved(true) }
  return <div className="py-8 sm:py-10">
    <header className="mb-7 flex flex-wrap justify-between gap-5"><div><h1 className="font-display text-4xl text-burgundy">{copy.closureTitle}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.closureDescription}</p></div><button type="button" className="button-primary self-start" disabled={!ready} onClick={() => { setSaved(false); setEditor('new') }}>{copy.addClosure}</button></header>
    {!ready && <p role="alert" className="prototype-notice mb-5">{t.booking.storageUnavailable}</p>}
    {saved && <p role="status" className="mb-5 text-sm text-rose">{copy.saved}</p>}
    <div className="space-y-4">{settings.closures.length ? settings.closures.map((closure) => <article key={closure.id} className="rounded-2xl border border-line bg-ivory p-5">
      <h2 className="font-semibold">{formatClosureDates(closure, language, settings.timeZone)}</h2>{normalizeClosureDescription(closure.reason.tr) && <p lang="tr" className="mt-3 break-words text-sm leading-6">{normalizeClosureDescription(closure.reason.tr)}</p>}
      <p className="mt-3 text-xs text-rose">{copy.affected} · {affected.filter((entry) => entry.closureIds.includes(closure.id)).length}</p>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="button-outline" disabled={!ready} onClick={() => { setEditor(closure); setSaved(false) }}>{copy.editClosure}</button><button type="button" className="button-outline" disabled={!ready} onClick={() => { setRemoving(closure); setSaved(false) }}>{copy.removeClosure}</button></div>
    </article>) : <p className="empty-state">{copy.noClosures}</p>}</div>
    <section aria-labelledby="closure-follow-up" className="mt-9"><h2 id="closure-follow-up" className="mb-3 text-xl font-semibold text-burgundy">{copy.followUp} · {affected.length}</h2><p className="mb-5 max-w-3xl text-sm leading-7">{copy.followUpNote}</p>{affected.length ? <AppointmentList appointments={affected.map((entry) => entry.appointment)} settings={settings} affectedIds={affected.map((entry) => entry.appointment.id)} onManage={(appointment) => navigate(`/admin?appointment=${encodeURIComponent(appointment.id)}`)} /> : <p className="empty-state">{copy.noAffected}</p>}</section>
    {editor && <ClosureEditor closure={editor === 'new' ? undefined : editor} settings={settings} appointments={appointments} onClose={() => setEditor(null)} onSaved={done} />}
    {removing && <ConfirmAction title={copy.removeClosure} message={copy.removeClosureMessage} command={{ kind: 'removeClosure', expected: removing }} onClose={() => setRemoving(null)} onSaved={done}><p className="mt-5 font-medium">{formatClosureDates(removing, language, settings.timeZone)}</p></ConfirmAction>}
  </div>
}
