import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Appointment, BookingSettings, SalonClosure } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { languageOptions } from '../../i18n/config'
import { affectedAppointments } from '../../lib/management'
import type { ManagerError } from '../../lib/management'
import { executeManagerCommand } from '../../lib/managerStore'
import { isSalonClosure } from '../../lib/salonSettingsStore'
import { bookingSettings } from '../../data/booking'
import { catalogueServices } from '../../data/services'
import { AppointmentList } from './AppointmentList'
import { ManagerDialog } from './ManagerDialog'

export function ClosureEditor({ closure, settings, appointments, onClose, onSaved }: {
  closure?: SalonClosure; settings: BookingSettings; appointments: Appointment[]; onClose: () => void; onSaved: () => void
}) {
  const { t } = useI18n()
  const copy = t.manager
  const [id] = useState(() => closure?.id ?? crypto.randomUUID())
  const [first, setFirst] = useState(closure?.startDate ?? '')
  const [last, setLast] = useState(closure?.endDate ?? '')
  const [reason, setReason] = useState(closure?.reason ?? { tr: '', en: '', ru: '' })
  const [review, setReview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ManagerError | null>(null)
  const guard = useRef(false)
  const draft: SalonClosure = { id, startDate: first, endDate: last, reason, illustrative: true }
  const valid = isSalonClosure(draft)
  const affected = valid ? affectedAppointments(appointments, [draft], settings.timeZone) : []
  async function save(event: FormEvent) {
    event.preventDefault()
    if (guard.current) return
    if (!valid) { setError('closure'); return }
    if (!review) { setError(null); setReview(true); return }
    guard.current = true; setBusy(true)
    const result = await executeManagerCommand({ kind: 'closure', closure: draft, expected: closure }, catalogueServices, bookingSettings)
    guard.current = false; setBusy(false)
    if (result.ok) onSaved()
    else setError(result.error)
  }
  return <ManagerDialog title={review ? copy.review : closure ? copy.editClosure : copy.addClosure} busy={busy} onClose={onClose}>
    <form noValidate onSubmit={(event) => void save(event)}>
      {error && <p role="alert" className="field-error mb-4">{copy.errors[error]}</p>}
      {review ? <div><p className="text-sm leading-7">{copy.closureMessage}</p><p className="my-5 font-semibold">{first} – {last}</p><p className="mb-4 text-sm font-medium">{copy.followUp} · {affected.length}</p>{affected.length > 0 ? <><p className="mb-4 text-xs leading-6 text-muted">{copy.followUpNote}</p><AppointmentList compact appointments={affected.map((entry) => entry.appointment)} settings={settings} /></> : <p className="text-sm text-muted">{copy.noAffected}</p>}</div> : <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="form-label" htmlFor="closure-first">{copy.startDate}</label><input type="date" id="closure-first" className="form-input" value={first} onChange={(event) => setFirst(event.target.value)} aria-invalid={error === 'closure'} /></div>
        <div><label className="form-label" htmlFor="closure-last">{copy.endDate}</label><input type="date" id="closure-last" className="form-input" value={last} min={first || undefined} onChange={(event) => setLast(event.target.value)} aria-invalid={error === 'closure'} /></div>
        {languageOptions.map((option) => <div key={option.code} className="sm:col-span-2"><label className="form-label" htmlFor={`reason-${option.code}`}>{copy.reason} · {option.label}</label><textarea id={`reason-${option.code}`} lang={option.code} className="form-input" value={reason[option.code]} maxLength={500} rows={2} onChange={(event) => setReason({ ...reason, [option.code]: event.target.value })} /></div>)}
      </div>}
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className="button-primary" disabled={busy}>{busy ? copy.saving : review ? copy.confirm : copy.review}</button>{review && <button type="button" className="button-outline" disabled={busy} onClick={() => setReview(false)}>{copy.back}</button>}</div>
    </form>
  </ManagerDialog>
}
