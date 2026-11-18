import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { ServiceFacts } from '../components/ServiceFacts'
import { catalogueServices, serviceCategories } from '../data/services'
import { useI18n } from '../hooks/useI18n'
import { serviceBookingHref } from '../lib/catalogue'

export function ServicesPage() {
  const { language, t } = useI18n()
  const copy = t.catalogue.services
  const services = catalogueServices.filter((service) => service.active)
  return (
    <div className="pb-16">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {services.some((service) => service.illustrative) && <p className="prototype-notice">{copy.notice}</p>}
      <nav aria-label={copy.categories} className="my-8 flex flex-wrap gap-2">
        {serviceCategories.map((category) => <a key={category.id} href={`#category-${category.id}`} className="category-chip">{category.name[language]}</a>)}
      </nav>
      {services.length === 0 ? <p className="empty-state">{copy.emptyAll}</p> : (
        <div className="space-y-12">
          {serviceCategories.map((category, index) => {
            const entries = services.filter((service) => service.categoryId === category.id)
            return <section key={category.id} id={`category-${category.id}`} aria-labelledby={`heading-${category.id}`} className="catalogue-category">
              <div className="mb-6 flex items-start gap-4 border-t border-line pt-6">
                <span className="mt-2 font-display text-xl text-rose" aria-hidden="true">0{index + 1}</span>
                <div><h2 id={`heading-${category.id}`} className="section-title mt-0">{category.name[language]}</h2><p className="mt-3 text-sm leading-6 text-muted">{category.description[language]}</p></div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {entries.length === 0 ? <p className="empty-state">{copy.empty}</p> : entries.map((service) => (
                  <article key={service.id} className="catalogue-service">
                    {service.illustrative && <p className="demo-label">{copy.demo}</p>}
                    <h3 className="mt-3 text-xl font-medium text-burgundy">{service.name[language]}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted">{service.description[language]}</p>
                    <ServiceFacts service={service} />
                    <Link to={serviceBookingHref(service.id)} className="button-primary mt-5 self-start">
                      {copy.select}<span className="sr-only">: {service.name[language]}</span><ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          })}
        </div>
      )}
    </div>
  )
}
