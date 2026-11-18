import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'

export function ManagerDialog({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: ReactNode; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { t } = useI18n()
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    ref.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); else document.getElementById('main-content')?.focus() }
  }, [])
  return <dialog ref={ref} className="manager-dialog" aria-labelledby={titleId} aria-busy={busy}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}
    onClick={(event) => { if (!busy && event.target === event.currentTarget) onClose() }}>
    <div className="p-5 sm:p-7">
      <header className="mb-6 flex items-center justify-between gap-5"><h2 id={titleId} className="text-xl font-semibold text-burgundy">{title}</h2><button type="button" className="manager-icon-button" disabled={busy} onClick={onClose} aria-label={t.manager.close}><X size={20} aria-hidden="true" /></button></header>
      {children}
    </div>
  </dialog>
}
