import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Appointment, BookingSettings, SalonClosure } from '../../types/domain'
import { useI18n } from '../../hooks/useI18n'
import { affectedAppointments } from '../../lib/management'
import type { ManagerError } from '../../lib/management'
import { closureDraft, formatClosureDates } from '../../lib/closures'
import type { ClosurePeriod } from '../../lib/closures'
import { executeManagerCommand } from '../../lib/managerStore'
import { isSalonClosure } from '../../lib/salonSettingsStore'
import { bookingSettings } from '../../data/booking'
import { catalogueServices } from '../../data/services'
import { AppointmentList } from './AppointmentList'
import { ManagerDialog } from './ManagerDialog'

export function ClosureEditor({ closure, settings, appointments, onClose, onSaved }: {
  closure?: SalonClosure; settings: BookingSettings; appointments: Appointment[]; onClose: () => void; onSaved: () => void
}) {
  const { language, t } = useI18n()
  const copy = t.manager
  const [id] = useState(() => closure?.id ?? crypto.randomUUID())
  const [period, setPeriod] = useState<ClosurePeriod>(closure && closure.startDate !== closure.endDate ? 'range' : 'single')
  const [first, setFirst] = useState(closure?.startDate ?? '')
  const [last, setLast] = useState(closure?.endDate ?? '')
  const [description, setDescription] = useState(closure?.reason.tr ?? '')
  const [review, setReview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ManagerError | null>(null)
  const guard = useRef(false)
  const draft = closureDraft(id, period, first, last, description, closure)
  const valid = isSalonClosure(draft)
  const rangeInvalid = !!first && !!draft.endDate && !valid
  const affected = valid ? affectedAppointments(appointments, [draft], settings.timeZone) : []
  const preview = valid ? (period === 'single' ? copy.closurePreviewSingle : copy.closurePreviewRange).replace('{dates}', formatClosureDates(draft, language, settings.timeZone)) : ''
  async function save(event: FormEvent) {
    event.preventDefault()
    if (guard.current) return
    if (!valid) { setError('closure'); return }
    if (!review) { setError(null); setReview(true); return }
    guard.current = true; setBusy(true); setError(null)
    const result = await executeManagerCommand({ kind: 'closure', closure: draft, expected: closure }, catalogueServices, bookingSettings)
    guard.current = false; setBusy(false)
    if (result.ok) onSaved()
    else setError(result.error)
  }
  return <ManagerDialog title={review ? copy.review : closure ? copy.editClosure : copy.addClosure} busy={busy} onClose={onClose}>
    <form noValidate onSubmit={(event) => void save(event)}>
      {(error || rangeInvalid) && <p id="closure-error" role="alert" className="field-error mb-4">{copy.errors[error ?? 'closure']}</p>}
      {review ? <div>
        <p className="text-sm leading-7">{copy.closureMessage}</p><p className="my-5 font-semibold">{preview}</p>
        {draft.reason.tr && <p lang="tr" className="mb-5 break-words text-sm leading-7">{draft.reason.tr}</p>}
        <p className="mb-4 text-sm font-medium">{copy.followUp} · {affected.length}</p>
        {affected.length > 0 ? <><p className="mb-4 text-xs leading-6 text-muted">{copy.followUpNote}</p><AppointmentList compact appointments={affected.map((entry) => entry.appointment)} settings={settings} /></> : <p className="text-sm text-muted">{copy.noAffected}</p>}
      </div> : <div className="grid gap-5 sm:grid-cols-2">
        <fieldset className="sm:col-span-2"><legend className="form-label">{copy.closurePeriod}</legend><div className="mt-3 flex flex-wrap gap-3">
          {(['single', 'range'] as const).map((value) => <label key={value} className="booking-choice"><input type="radio" name="closure-period" value={value} checked={period === value} onChange={() => { setPeriod(value); setError(null) }} /><span>{value === 'single' ? copy.singleDay : copy.dateRange}</span></label>)}
        </div></fieldset>
        <div><label className="form-label" htmlFor="closure-first">{period === 'single' ? copy.closureDate : copy.startDate}</label><input type="date" id="closure-first" className="form-input" value={first} onChange={(event) => { setFirst(event.target.value); setError(null) }} aria-invalid={error === 'closure' || rangeInvalid} aria-describedby={error === 'closure' || rangeInvalid ? 'closure-error' : undefined} /></div>
        {period === 'range' && <div><label className="form-label" htmlFor="closure-last">{copy.endDate}</label><input type="date" id="closure-last" className="form-input" value={last} min={first || undefined} onChange={(event) => { setLast(event.target.value); setError(null) }} aria-invalid={error === 'closure' || rangeInvalid} aria-describedby={error === 'closure' || rangeInvalid ? 'closure-error' : 'closure-inclusive'} /></div>}
        {period === 'range' && <p id="closure-inclusive" className="text-xs leading-6 text-muted sm:col-span-2">{copy.closureInclusive}</p>}
        <div className="sm:col-span-2"><label className="form-label" htmlFor="closure-description">{copy.reason}</label><textarea id="closure-description" lang="tr" className="form-input" value={description} maxLength={500} rows={3} aria-describedby="closure-description-hint" onChange={(event) => { setDescription(event.target.value); setError(null) }} /><p id="closure-description-hint" className="mt-2 text-xs leading-6 text-muted">{copy.closureDescriptionHint}</p></div>
        {valid && <div role="status" className="rounded-xl bg-blush p-4 sm:col-span-2"><p className="text-xs font-semibold text-rose">{copy.closurePreview}</p><p className="mt-2 text-sm leading-7 text-burgundy">{preview}</p></div>}
      </div>}
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className="button-primary" disabled={busy}>{busy ? copy.saving : review ? copy.confirm : copy.review}</button>{review && <button type="button" className="button-outline" disabled={busy} onClick={() => { setReview(false); setError(null) }}>{copy.back}</button>}</div>
    </form>
  </ManagerDialog>
}
