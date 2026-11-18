import { useState } from 'react'
import type { BookingConfirmationMode } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { useBookingSettings } from '../hooks/useBookingSettings'
import { usePrototypeAppointments } from '../hooks/usePrototypeAppointments'
import { ConfirmAction } from '../components/manager/ConfirmAction'

export function ManagerSettingsPage() {
  const { t } = useI18n()
  const copy = t.manager
  const { settings, settingsReady } = useBookingSettings()
  const { storageReady } = usePrototypeAppointments()
  const [choice, setChoice] = useState<BookingConfirmationMode | null>(null)
  const [confirm, setConfirm] = useState<BookingConfirmationMode | null>(null)
  const [saved, setSaved] = useState(false)
  const mode = choice ?? settings.confirmationMode
  return <div className="max-w-3xl py-8 sm:py-10">
    <h1 className="font-display text-4xl text-burgundy">{copy.settingsTitle}</h1><p className="mt-4 text-sm leading-7 text-muted">{copy.settingsDescription}</p>
    {(!settingsReady || !storageReady) && <p role="alert" className="prototype-notice mt-5">{t.booking.storageUnavailable}</p>}
    {saved && <p role="status" className="mt-5 text-sm text-rose">{copy.saved}</p>}
    <p className="mt-7 text-sm font-semibold">{copy.modeCurrent}: {settings.confirmationMode === 'manual' ? copy.manual : copy.automatic}</p>
    <fieldset className="mt-5 space-y-4"><legend className="sr-only">{copy.settingsTitle}</legend>{(['manual', 'automatic'] as const).map((value) => <label key={value} className="booking-choice bg-ivory"><input type="radio" name="confirmation-mode" checked={mode === value} onChange={() => { setChoice(value); setSaved(false) }} /><span><span className="block text-sm font-semibold">{copy[value]}</span><span className="mt-1 block text-sm leading-6 text-muted">{value === 'manual' ? copy.manualHint : copy.automaticHint}</span></span></label>)}</fieldset>
    <button type="button" className="button-primary mt-6" disabled={!settingsReady || !storageReady || mode === settings.confirmationMode} onClick={() => setConfirm(mode)}>{copy.save}</button>
    <p className="mt-8 text-xs leading-6 text-muted">{copy.modeNote}</p>
    {confirm && <ConfirmAction title={copy.settingsTitle} message={copy.modeMessage} command={{ kind: 'mode', mode: confirm }} onClose={() => setConfirm(null)} onSaved={() => { setConfirm(null); setChoice(null); setSaved(true) }}><p className="mt-5 font-semibold">{confirm === 'manual' ? copy.manual : copy.automatic}</p></ConfirmAction>}
  </div>
}
