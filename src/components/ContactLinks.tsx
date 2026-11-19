import { ArrowUpRight, MapPin, MessageCircle } from 'lucide-react'
import type { SVGProps } from 'react'
import { contactLinks } from '../data/homepage'
import { useI18n } from '../hooks/useI18n'

// Brand glyph kept local: this Lucide version does not export brand icons.
function InstagramIcon({ size = 21, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
}

export function ContactLinks({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const copy = t.homepage.contact
  const items = [
    { key: 'whatsapp', label: copy.whatsapp, description: copy.whatsappDescription, Icon: MessageCircle },
    { key: 'instagram', label: copy.instagram, description: copy.instagramDescription, Icon: InstagramIcon },
    { key: 'maps', label: copy.maps, description: copy.mapsDescription, Icon: MapPin },
  ] as const
  if (compact) return <ul aria-label={t.catalogue.menu.contact} className="footer-contact-links">
    {items.map(({ key, label, Icon }) => <li key={key}>{contactLinks[key]
      ? <a href={contactLinks[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="footer-contact-icon"><Icon size={21} aria-hidden="true" /></a>
      : <button type="button" disabled aria-label={`${label} · ${copy.pending}`} title={`${label} · ${copy.pending}`} className="footer-contact-icon"><Icon size={21} aria-hidden="true" /></button>
    }</li>)}
  </ul>
  return (
    <ul className="contact-links">
      {items.map(({ key, label, description, Icon }) => {
        const href = contactLinks[key]
        const content = <>
          <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="contact-label">{label}</span>
            <span className="contact-description">{description}</span>
            {!href && <span className="contact-pending">{copy.pending}</span>}
          </span>
          {href && <ArrowUpRight size={16} aria-hidden="true" />}
        </>
        return <li key={key}>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="contact-tile">{content}</a>
          ) : (
            <div className="contact-tile">{content}</div>
          )}
        </li>
      })}
    </ul>
  )
}
