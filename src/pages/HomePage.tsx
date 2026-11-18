import { ArrowRight, CalendarDays, CircleCheck, LayoutGrid, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMotif } from '../components/BrandMotif'
import { ContactLinks } from '../components/ContactLinks'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { ServicePreviewCard } from '../components/ServicePreviewCard'
import { bookingStepKeys, homepageMedia, servicePreviewKeys } from '../data/homepage'
import { useI18n } from '../hooks/useI18n'

const stepIcons = { service: LayoutGrid, specialist: Users, time: CalendarDays, confirm: CircleCheck }

export function HomePage() {
  const { t } = useI18n()
  const copy = t.homepage
  return (
    <div className="homepage">
      <section aria-labelledby="hero-heading" className={`salon-hero ${homepageMedia.hero ? 'has-photo' : ''}`}>
        <MediaPlaceholder src={homepageMedia.hero} label={copy.hero.image} note={copy.hero.imageNote}
          tone="pink" hero className="hero-media" />
        <div className="page-container hero-content">
          <div className="hero-copy">
            <p className="eyebrow flex items-center gap-3"><MapPin size={25} strokeWidth={1.5} aria-hidden="true" />{copy.hero.eyebrow}</p>
            <h1 id="hero-heading" className="hero-title">
              {copy.hero.title}<br /><span>{copy.hero.accent}</span>
            </h1>
            <p className="hero-description">{copy.hero.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/booking" className="button-primary"><CalendarDays size={17} aria-hidden="true" />{copy.book}<ArrowRight size={17} aria-hidden="true" /></Link>
              <Link to="/services" className="button-outline">{copy.viewServices}</Link>
            </div>
            <p className="mt-5 max-w-md text-xs leading-5 text-muted">{t.common.note}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="services-heading" className="page-container services-section section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.services.eyebrow}</p>
            <div className="flex items-center gap-3"><h2 id="services-heading" className="section-title">{copy.services.title}</h2><BrandMotif kind="heart" className="heading-motif" /></div>
          </div>
          <Link to="/services" className="text-link">{copy.services.all}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-5 min-[360px]:grid-cols-2 lg:grid-cols-4">
          {servicePreviewKeys.map((category) => <ServicePreviewCard key={category} category={category} />)}
        </div>
        <p className="mt-5 text-xs leading-5 text-muted">{copy.services.note}</p>
      </section>

      <section aria-labelledby="gallery-heading" className="page-container gallery-section">
        <div className="gallery-prints">
          {homepageMedia.gallery.map(({ id, src, tone }, index) => (
            <div key={id} className={`gallery-print gallery-print-${index + 1}`}>
              <MediaPlaceholder src={src} label={copy.gallery[id]} note={copy.gallery.placeholder} tone={tone} />
            </div>
          ))}
          <BrandMotif className="gallery-bow" />
        </div>
        <div className="gallery-copy">
          <BrandMotif kind="sparkle" className="gallery-sparkle" />
          <p className="eyebrow">{copy.gallery.eyebrow}</p>
          <h2 id="gallery-heading" className="section-title">{copy.gallery.title}</h2>
          <p className="mt-5 text-sm leading-6 text-muted">{copy.gallery.note}</p>
          <Link to="/gallery" className="button-primary mt-6">{copy.gallery.all}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>

      <section aria-labelledby="process-heading" className="booking-band">
        <div className="page-container relative">
          <p className="eyebrow">{copy.process.eyebrow}</p>
          <h2 id="process-heading" className="section-title">{copy.process.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{copy.process.description}</p>
          <ol className="booking-steps">
            {bookingStepKeys.map((key, index) => {
              const Icon = stepIcons[key]
              return (
                <li key={key} className="booking-step">
                  <div className="step-top"><span className="step-number" aria-hidden="true">{index + 1}</span><span className="step-icon"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /></span></div>
                  <h3 className="mt-4 text-base font-semibold">{copy.process[key].title}</h3>
                  <p className="mt-2 max-w-52 text-sm leading-6">{copy.process[key].description}</p>
                  {index < bookingStepKeys.length - 1 && <ArrowRight size={21} strokeWidth={1.4} aria-hidden="true" className="step-arrow" />}
                </li>
              )
            })}
          </ol>
          <p className="mt-8 max-w-2xl text-xs leading-5 text-muted">{copy.process.note}</p>
        </div>
      </section>

      <section aria-labelledby="contact-heading" className="contact-section">
        <div className="page-container contact-composition">
          <MediaPlaceholder src={homepageMedia.contact} label={copy.contact.image} note={copy.hero.imageNote}
            tone="pink" className="contact-photo" />
          <div className="contact-copy">
            <p className="eyebrow flex items-center gap-2"><MapPin size={18} aria-hidden="true" />{t.common.location}</p>
            <div className="flex items-center gap-4"><h2 id="contact-heading" className="section-title">{copy.contact.title}</h2><BrandMotif kind="heart" className="heading-motif" /></div>
            <p className="mt-4 max-w-lg text-base leading-7">{copy.contact.description}</p>
            <ContactLinks />
            <p className="mt-5 max-w-xl text-xs leading-5 text-muted">{copy.contact.note}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
