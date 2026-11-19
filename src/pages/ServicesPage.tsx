import { useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { ServiceFacts } from '../components/ServiceFacts'
import { ContactLinks } from '../components/ContactLinks'
import { catalogueServices, serviceCategories, catalogueGroups } from '../data/services'
import { bookingSettings } from '../data/booking'
import { useI18n } from '../hooks/useI18n'
import { isServiceBookable, serviceBookingHref } from '../lib/catalogue'
import { serviceCategoryMedia, salonMedia } from '../data/media'
import { selectedCatalogueGroup, revealCatalogueHeading } from '../lib/catalogueSelection'
import { MediaPlaceholder } from '../components/MediaPlaceholder'

export function ServicesPage() {
  const { language, t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const contentHeading = useRef<HTMLHeadingElement>(null)
  const selected = selectedCatalogueGroup(location.search, location.hash)
  function selectCategory(id: string) {
    const params = new URLSearchParams(location.search)
    params.set('category', id)
    void navigate({ pathname: location.pathname, search: `?${params}`, hash: '' }, { replace: true, preventScrollReset: true })
    if (contentHeading.current) revealCatalogueHeading(contentHeading.current, window.innerHeight)
  }
  const copy = t.catalogue.services
  const menu = t.catalogue.menu
  const services = catalogueServices.filter((service) => service.active)
  return <div className="pb-16">
    <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={menu.intro} />
    <p className="catalogue-demo-notice">{menu.demoNotice}</p>
    <div role="group" aria-label={copy.categories} className="catalogue-filters my-7 flex flex-wrap gap-2">
      {catalogueGroups.map((group) => <button type="button" key={group.id} aria-pressed={selected.id === group.id} aria-controls="services-category-content" onClick={() => selectCategory(group.id)} className="category-chip">{group.name[language]}</button>)}
    </div>
    <section aria-labelledby="catalogue-title" className="space-y-10">
      <h2 ref={contentHeading} id="catalogue-title" className="section-title">{menu.title}</h2>
      {[selected].map((group) => <section key={group.id} id="services-category-content" role="region" aria-labelledby={`menu-title-${group.id}`} className="menu-group">
        <header className="menu-group-heading"><span aria-hidden="true" className="font-display text-3xl text-rose">0{catalogueGroups.findIndex((entry) => entry.id === group.id) + 1}</span><h3 id={`menu-title-${group.id}`} className="font-display text-3xl text-burgundy">{group.name[language]}</h3></header>
        {group.id === 'nailBar' && <p className="mb-6 text-sm leading-7 text-muted">{menu.combination}</p>}
        {group.id === 'skinCare' && <p className="mb-6 text-sm leading-7 text-muted">{menu.sessionNote}</p>}
        {group.id === 'laser' && <p className="mb-6 text-sm leading-7 text-muted">{menu.laserAreas}</p>}
        {group.categoryIds.map((categoryId) => {
          const category = serviceCategories.find((entry) => entry.id === categoryId)!
          const entries = services.filter((service) => service.categoryId === categoryId)
          const configured = entries.filter((service) => isServiceBookable(service, bookingSettings.specialists))
          const pending = entries.filter((service) => !isServiceBookable(service, bookingSettings.specialists))
          const media = serviceCategoryMedia[categoryId]
          return <section key={categoryId} id={`category-${categoryId}`} aria-labelledby={`heading-${categoryId}`} className="catalogue-category">
            <div className="catalogue-category-layout">
              {media ? <div className="space-y-3">
                <MediaPlaceholder src={media.src} label={media.alt[language]} note={copy.missing} className="catalogue-category-photo" caption={media.kind === 'portfolio' ? copy.realWork : copy.supportingVisual} />
                {categoryId === 'lashes' && <MediaPlaceholder src={salonMedia.brows.src} label={salonMedia.brows.alt[language]} note={copy.missing} className="catalogue-brow-photo" caption={copy.realWork} />}
              </div> : <div className="menu-category-art" aria-hidden="true"><Sparkles size={32} strokeWidth={1} /></div>}
              <div className="min-w-0">
                <h4 id={`heading-${categoryId}`} className="text-xl font-semibold text-burgundy">{category.name[language]}</h4><p className="mt-2 text-sm leading-7 text-muted">{category.description[language]}</p>
                {configured.length > 0 && <div className="mt-5"><p className="eyebrow mb-3">{menu.demoOptions}</p><div className="grid gap-4 lg:grid-cols-2">{configured.map((service) => <article key={service.id} className="catalogue-service">
                  <h5 className="mt-3 text-lg font-semibold text-burgundy">{service.name[language]}</h5><p className="mt-3 text-sm leading-7 text-muted">{service.description[language]}</p><ServiceFacts service={service} compact />
                  <Link to={serviceBookingHref(service.id)} className="button-primary mt-5 self-start">{copy.select}<span className="sr-only">: {service.name[language]}</span><ArrowRight size={16} aria-hidden="true" /></Link>
                </article>)}</div></div>}
                {pending.length > 0 && <div className="mt-6"><p className="eyebrow mb-3">{menu.treatments}</p><p className="mb-3 text-xs leading-6 text-muted">{menu.pending}</p><div className="menu-treatment-list">{pending.map((service) => <article key={service.id} className="menu-treatment">
                  <h5 className="font-semibold leading-7 text-burgundy">{service.name[language]}</h5><ServiceFacts service={service} compact />
                </article>)}</div></div>}
                {!entries.length && <p className="empty-state mt-5">{copy.empty}</p>}
              </div>
            </div>
          </section>
        })}
      </section>)}
    </section>
    <section aria-labelledby="services-contact" className="mt-10"><h2 id="services-contact" className="section-title">{menu.contact}</h2><ContactLinks /></section>
  </div>
}
