import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom',
})
after(() => server.close())
const [app, i18n, dictionaries, data, gallery, helpers, lightbox] = await Promise.all([
  server.ssrLoadModule('/src/App.tsx'),
  server.ssrLoadModule('/src/i18n/context.ts'),
  server.ssrLoadModule('/src/i18n/translations.ts'),
  server.ssrLoadModule('/src/data/services.ts'),
  server.ssrLoadModule('/src/data/gallery.ts'),
  server.ssrLoadModule('/src/lib/catalogue.ts'),
  server.ssrLoadModule('/src/components/GalleryLightbox.tsx'),
])

const escape = (text) => text.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
function withLanguage(language, content) {
  return createElement(i18n.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, content)
}
function render(path, language = 'tr') {
  return renderToStaticMarkup(withLanguage(language, createElement(MemoryRouter, { initialEntries: [path] }, createElement(app.AppRoutes))))
}

for (const language of ['tr', 'en', 'ru']) {
  test(`catalogue displays translated category/service details and carries selection in ${language}`, () => {
    const html = render('/services', language)
    const copy = dictionaries.translations[language].catalogue
    assert.ok(html.includes(escape(copy.services.title)))
    assert.ok(html.includes(escape(copy.services.notice)))
    for (const category of data.serviceCategories) {
      assert.ok(html.includes(`id="category-${category.id}"`))
      assert.ok(html.includes(escape(category.name[language])))
    }
    for (const service of data.catalogueServices) {
      if (!service.active) continue
      assert.ok(html.includes(escape(service.name[language])))
      assert.ok(html.includes(escape(service.description[language])))
      assert.ok(html.includes(`${service.durationMinutes} ${copy.services.minutes}`))
      assert.ok(html.includes(escape(helpers.formatServicePrice(service, language, 'missing'))))
      const href = helpers.serviceBookingHref(service.id)
      assert.ok(html.includes(`href="${href}"`))
      const selection = render(href, language)
      assert.ok(selection.includes('id="selected-service"'))
      assert.ok(selection.includes(escape(service.name[language])))
      assert.ok(selection.includes(escape(copy.booking.demo)))
      assert.ok(selection.includes('<form'))
      assert.ok(selection.includes(escape(dictionaries.translations[language].booking.notice)))
    }
  })

  test(`gallery filters categories and keeps missing photos noninteractive in ${language}`, () => {
    const copy = dictionaries.translations[language].catalogue.gallery
    const html = render('/gallery', language)
    assert.ok(html.includes(escape(copy.notice)))
    for (const item of gallery.galleryItems) assert.ok(html.includes(escape(item.title[language])))
    assert.ok(!html.includes('<img'))
    assert.ok(!html.includes('aria-haspopup="dialog"'))
    const filtered = render('/gallery?category=pedicure', language)
    const visible = gallery.galleryItems.find((item) => item.categoryId === 'pedicure')
    const hidden = gallery.galleryItems.find((item) => item.categoryId === 'lashes')
    assert.ok(filtered.includes(escape(visible.title[language])))
    assert.ok(!filtered.includes(escape(hidden.title[language])))
    assert.ok(render('/gallery?category=unknown', language).includes(escape(hidden.title[language])))
  })
}

test('unknown, missing, and inactive selections have an honest fallback', () => {
  const copy = dictionaries.translations.en.catalogue.booking
  assert.ok(render('/booking', 'en').includes(escape(copy.noSelection)))
  assert.ok(render('/booking?service=not-a-service', 'en').includes(escape(copy.invalid)))
  const first = data.catalogueServices[0]
  const previous = first.active
  try {
    first.active = false
    assert.ok(render(helpers.serviceBookingHref(first.id), 'en').includes(escape(copy.invalid)))
    assert.ok(!render('/services', 'en').includes(`href="${helpers.serviceBookingHref(first.id)}"`))
  } finally { first.active = previous }
  const arbitraryId = 'example ? & / < >'
  const encoded = helpers.serviceBookingHref(arbitraryId)
  assert.equal(new URL(encoded, 'https://example.com').searchParams.get('service'), arbitraryId)
  assert.equal(helpers.findSelectedService(arbitraryId, data.catalogueServices), undefined)
})

test('prices distinguish missing amounts from free amounts', () => {
  const service = data.catalogueServices[0]
  assert.equal(helpers.formatServicePrice({ ...service, priceMinor: null }, 'en', 'Pending'), 'Pending')
  assert.match(helpers.formatServicePrice({ ...service, priceMinor: 0 }, 'en', 'Pending'), /0/)
  assert.match(helpers.formatServicePrice({ ...service, priceMinor: 12345 }, 'en', 'Pending'), /123.45/)
})

test('service/gallery fixtures have unique IDs, valid categories, and complete translations', () => {
  for (const entries of [data.catalogueServices, gallery.galleryItems]) {
    assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length)
    for (const entry of entries) {
      for (const field of entries === data.catalogueServices ? ['name', 'description'] : ['title', 'alt']) {
        for (const language of ['tr', 'en', 'ru']) assert.ok(entry[field][language].trim())
      }
    }
  }
  for (const service of data.catalogueServices) {
    assert.ok(data.serviceCategories.some((category) => category.id === service.categoryId))
    assert.ok(service.illustrative)
    assert.ok(service.priceMinor === null || (Number.isInteger(service.priceMinor) && service.priceMinor >= 0))
    assert.ok(service.durationMinutes === null || (Number.isInteger(service.durationMinutes) && service.durationMinutes > 0))
  }
  for (const item of gallery.galleryItems) assert.ok(gallery.galleryCategories.some((category) => category.id === item.categoryId))
})

test('gallery category empty state is translated', () => {
  const previous = gallery.galleryItems.splice(0)
  try {
    for (const language of ['tr', 'en', 'ru']) {
      assert.ok(render('/gallery?category=pedicure', language).includes(escape(dictionaries.translations[language].catalogue.gallery.empty)))
    }
  } finally { gallery.galleryItems.push(...previous) }
})

test('approved images expose a named dialog trigger and translated preview markup', () => {
  const item = gallery.galleryItems[0]
  const previous = item.src
  try {
    item.src = '/approved-test/manicure.webp'
    const html = render('/gallery', 'en')
    assert.ok(html.includes('src="/approved-test/manicure.webp"'))
    assert.ok(html.includes('aria-haspopup="dialog"'))
    const preview = renderToStaticMarkup(withLanguage('en', createElement(lightbox.GalleryLightbox, { item, onClose() {} })))
    assert.ok(preview.includes('<dialog'))
    assert.ok(preview.includes('aria-labelledby="lightbox-title"'))
    assert.ok(preview.includes('aria-label="Close preview"'))
    assert.ok(preview.includes(`alt="${escape(item.alt.en)}"`))
  } finally { item.src = previous }
})
