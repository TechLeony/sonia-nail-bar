import { ArrowUpRight, Camera, MapPin, MessageCircle } from 'lucide-react'
import { contactLinks } from '../data/homepage'
import { useI18n } from '../hooks/useI18n'

export function ContactLinks() {
  const { t } = useI18n()
  const copy = t.homepage.contact
  const items = [
    { key: 'whatsapp', label: copy.whatsapp, description: copy.whatsappDescription, Icon: MessageCircle },
    { key: 'instagram', label: copy.instagram, description: copy.instagramDescription, Icon: Camera },
    { key: 'maps', label: copy.maps, description: copy.mapsDescription, Icon: MapPin },
  ] as const
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
