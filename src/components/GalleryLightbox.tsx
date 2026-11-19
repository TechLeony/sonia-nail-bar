import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { GalleryItem } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { GalleryPhoto } from './GalleryPhoto'

export function GalleryLightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { language, t } = useI18n()

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog?.showModal() // Native modal handles focus trapping and inert background.
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus()
    }
  }, [item.id])

  return (
    <dialog ref={dialogRef} className="gallery-lightbox" aria-labelledby="lightbox-title"
      onClose={onClose} onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="lightbox-content">
        <header className="flex items-center justify-between gap-5 border-b border-line p-4 sm:px-6">
          <h2 id="lightbox-title" className="min-w-0 text-lg font-medium">{item.title[language]}</h2>
          <button type="button" onClick={onClose} aria-label={t.catalogue.gallery.close} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line"><X size={21} aria-hidden="true" /></button>
        </header>
        {item.src && <GalleryPhoto key={item.src} src={item.src} alt={item.alt[language]} preview />}
        {(item.description || item.illustrative) && <div className="p-5 text-sm leading-6 text-muted">
          {item.description && <p>{item.description[language]}</p>}
          {item.illustrative && <p className="mt-2 text-xs text-rose">{t.catalogue.gallery.demo}</p>}
        </div>}
      </div>
    </dialog>
  )
}
