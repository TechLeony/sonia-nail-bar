import { Image } from 'lucide-react'

/** Renders approved local media, or an explicitly labelled empty photo slot. */
export function MediaPlaceholder({ src, label, note, tone = 'blush', hero = false, className = '' }: {
  src: string | null
  label: string
  note: string
  tone?: 'blush' | 'lilac' | 'pink'
  hero?: boolean
  className?: string
}) {
  const tones = { blush: 'bg-blush', lilac: 'bg-lilac-light', pink: 'bg-pink' }
  return (
    <figure className={`media-frame ${tones[tone]} ${className}`}>
      {src ? (
        <img src={src} alt={label} className="absolute inset-0 size-full object-cover"
          loading={hero ? 'eager' : 'lazy'} decoding="async" />
      ) : (
        <div className="placeholder-content">
          <Image size={26} strokeWidth={1.2} aria-hidden="true" />
          <p className="placeholder-label">{label}</p>
          <p className="placeholder-note">{note}</p>
        </div>
      )}
    </figure>
  )
}
