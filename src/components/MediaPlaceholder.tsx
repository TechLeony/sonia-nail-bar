import { Image } from 'lucide-react'

/** Renders local media with optional provenance captions, or a labelled empty slot. */
export function MediaPlaceholder({ src, label, note, tone = 'blush', hero = false, className = '', caption }: {
  src: string | null
  label: string
  note: string
  tone?: 'blush' | 'lilac' | 'pink'
  hero?: boolean
  className?: string
  caption?: string
}) {
  const tones = { blush: 'bg-blush', lilac: 'bg-lilac-light', pink: 'bg-pink' }
  return (
    <figure className={`media-frame ${tones[tone]} ${className}`}>
      {src ? (
        <img src={src} alt={label} className="absolute inset-0 size-full object-cover"
          loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : undefined} decoding="async" />
      ) : (
        <div className="placeholder-content">
          <Image size={26} strokeWidth={1.2} aria-hidden="true" />
          <p className="placeholder-label">{label}</p>
          <p className="placeholder-note">{note}</p>
        </div>
      )}
      {src && caption && <figcaption className="media-caption">{caption}</figcaption>}
    </figure>
  )
}
