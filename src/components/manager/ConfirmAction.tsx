import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../../hooks/useI18n'
import { executeManagerCommand } from '../../lib/managerStore'
import type { ManagerCommand } from '../../lib/managerStore'
import type { ManagerError } from '../../lib/management'
import { catalogueServices } from '../../data/services'
import { bookingSettings } from '../../data/booking'
import { ManagerDialog } from './ManagerDialog'

export function ConfirmAction({ title, message, command, onClose, onSaved, children }: {
  title: string; message: string; command: ManagerCommand; onClose: () => void; onSaved: () => void; children?: ReactNode
}) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ManagerError | null>(null)
  const guard = useRef(false)
  async function save() {
    if (guard.current) return
    guard.current = true; setBusy(true); setError(null)
    const result = await executeManagerCommand(command, catalogueServices, bookingSettings)
    guard.current = false; setBusy(false)
    if (result.ok) onSaved()
    else setError(result.error)
  }
  return <ManagerDialog title={title} onClose={onClose} busy={busy}>
    <p className="text-sm leading-7">{message}</p>{children}
    {error && <p role="alert" className="field-error">{t.manager.errors[error]}</p>}
    <div className="mt-6 flex flex-wrap gap-3"><button type="button" className="button-primary" disabled={busy} onClick={() => void save()}>{busy ? t.manager.saving : t.manager.confirm}</button><button type="button" className="button-outline" disabled={busy} onClick={onClose}>{t.manager.back}</button></div>
  </ManagerDialog>
}
