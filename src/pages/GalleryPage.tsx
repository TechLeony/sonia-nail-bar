import { useState } from 'react'
import { Expand } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { GalleryLightbox } from '../components/GalleryLightbox'
import { GalleryPhoto } from '../components/GalleryPhoto'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { PageIntro } from '../components/PageIntro'
import { galleryCategories, galleryItems } from '../data/gallery'
import { useI18n } from '../hooks/useI18n'
import type { GalleryItem } from '../types/domain'

export function GalleryPage() {
  const { language, t } = useI18n()
  const copy = t.catalogue.gallery
  const [params, setParams] = useSearchParams()
  const requestedCategory = params.get('category')
  const category = galleryCategories.some((entry) => entry.id === requestedCategory) ? requestedCategory : 'all'
  const items = category === 'all' ? galleryItems : galleryItems.filter((item) => item.categoryId === category)
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const filters = [{ id: 'all', label: copy.all }, ...galleryCategories.map((entry) => ({ id: entry.id, label: entry.name[language] }))]
  return (
    <div className="pb-16">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {galleryItems.some((item) => !item.src || item.illustrative) && <p className="prototype-notice">{copy.notice}</p>}
      <div role="group" aria-label={copy.filters} className="my-8 flex flex-wrap gap-2">
        {filters.map((entry) => (
          <button key={entry.id} type="button" aria-pressed={category === entry.id}
            className="category-chip" onClick={() => {
              setSelected(null)
              setParams(entry.id === 'all' ? {} : { category: entry.id }, { preventScrollReset: true })
            }}>{entry.label}</button>
        ))}
      </div>
      {items.length === 0 ? <p className="empty-state" role="status">{copy.empty}</p> : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.id} className="min-w-0">
              {item.src ? (
                <button type="button" className="gallery-thumbnail" onClick={() => setSelected(item)}
                  aria-label={`${copy.preview}: ${item.title[language]}`} aria-haspopup="dialog">
                  <GalleryPhoto key={item.src} src={item.src} alt={item.alt[language]} />
                  <span className="gallery-expand"><Expand size={18} aria-hidden="true" /></span>
                </button>
              ) : <MediaPlaceholder src={null} label={item.title[language]} note={copy.placeholder}
                tone={index % 3 === 1 ? 'lilac' : 'blush'} className="rounded-2xl" />}
              <p className="mt-4 text-xs text-rose">{galleryCategories.find((entry) => entry.id === item.categoryId)?.name[language]}</p>
              <h2 className="mt-2 text-lg font-medium">{item.title[language]}</h2>
              {item.description && <p className="mt-2 text-sm leading-6 text-muted">{item.description[language]}</p>}
              {(!item.src || item.illustrative) && <p className="mt-2 text-xs leading-5 text-muted">{copy.demo}</p>}
            </article>
          ))}
        </div>
      )}
      {selected?.src && <GalleryLightbox item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
