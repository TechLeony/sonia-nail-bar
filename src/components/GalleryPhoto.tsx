import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

/** The parent keys this component by src so changing a path resets failures. */
export function GalleryPhoto({ src, alt, preview = false }: { src: string; alt: string; preview?: boolean }) {
  const [failed, setFailed] = useState(false)
  const { t } = useI18n()
  return failed ? (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 bg-blush p-6 text-center text-sm leading-6 text-muted">
      <ImageOff size={25} aria-hidden="true" />{t.catalogue.gallery.imageUnavailable}
    </div>
  ) : (
    <img src={src} alt={alt} loading={preview ? 'eager' : 'lazy'} decoding="async"
      className={preview ? 'lightbox-image' : 'absolute inset-0 size-full object-cover'} onError={() => setFailed(true)} />
  )
}
