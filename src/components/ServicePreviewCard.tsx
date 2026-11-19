import { ArrowRight, Eye, Paintbrush, Footprints, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homepageMedia } from '../data/homepage'
import { serviceCategoryMedia } from '../data/media'
import type { ServicePreviewKey } from '../data/homepage'
import { useI18n } from '../hooks/useI18n'
import { MediaPlaceholder } from './MediaPlaceholder'

const icons = { manicure: Paintbrush, pedicure: Footprints, lashes: Eye, nailArt: Sparkles }

export function ServicePreviewCard({ category }: { category: ServicePreviewKey }) {
  const { t, language } = useI18n()
  const copy = t.homepage.services[category]
  const Icon = icons[category]
  return (
    <Link to={`/services#category-${category}`} className="service-card">
      <MediaPlaceholder src={homepageMedia.services[category]} label={serviceCategoryMedia[category]!.alt[language]}
        note={t.homepage.gallery.placeholder} className="service-card-photo"
        caption={serviceCategoryMedia[category]!.kind === 'portfolio' ? t.catalogue.services.realWork : t.catalogue.services.supportingVisual} />
      <div className="service-card-caption">
        <Icon size={28} strokeWidth={1.3} aria-hidden="true" className="text-rose" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{copy.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted">{copy.description}</p>
        </div>
        <span className="service-card-arrow"><ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  )
}
