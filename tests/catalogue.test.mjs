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

const { bookingSettings: sharedSettings } = await server.ssrLoadModule('/src/data/booking.ts')

const escape = (text) => text.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
function withLanguage(language, content) {
  return createElement(i18n.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, content)
}
function render(path, language = 'tr') {
  return renderToStaticMarkup(withLanguage(language, createElement(MemoryRouter, { initialEntries: [path] }, createElement(app.AppRoutes))))
}

for (const language of ['tr', 'en', 'ru']) {
  test(`catalogue displays translated category/service details and carries selection in ${language}`, () => {
    const copy = dictionaries.translations[language].catalogue
    for (const group of data.catalogueGroups) {
      const html = render(`/services?category=${group.id}`, language)
      assert.ok(html.includes(escape(copy.services.title)))
      assert.ok(html.includes(escape(copy.menu.demoNotice)))
      for (const category of data.serviceCategories.filter((entry) => group.categoryIds.includes(entry.id))) {
        assert.ok(html.includes(`id="category-${category.id}"`))
        assert.ok(html.includes(escape(category.name[language])))
      }
      for (const service of data.catalogueServices.filter((entry) => group.categoryIds.includes(entry.categoryId) && entry.active)) {
        assert.ok(html.includes(escape(service.name[language])))
        assert.ok(html.includes(`${service.durationMinutes} ${copy.services.minutes}`))
        assert.ok(html.includes(escape(helpers.formatServicePrice(service, language, 'missing'))))
        const href = helpers.serviceBookingHref(service.id)
        if (helpers.isServiceBookable(service, sharedSettings.specialists)) {
          assert.ok(html.includes(`href="${href}"`))
          const selection = render(href, language)
          assert.ok(selection.includes('id="selected-service"'))
          assert.ok(selection.includes(escape(service.name[language])))
          assert.ok(selection.includes(escape(copy.booking.demo)))
          assert.ok(selection.includes('<form'))
        } else {
          assert.ok(!html.includes(`href="${href}"`))
          assert.ok(html.includes(escape(copy.menu.pending)))
          assert.ok(render(href, language).includes(escape(copy.booking.invalid)))
        }
      }
    }
  })

  test(`gallery filters real portfolio photos and exposes accessible previews in ${language}`, () => {
    const copy = dictionaries.translations[language].catalogue.gallery
    const html = render('/gallery', language)
    assert.ok(!html.includes(escape(copy.notice)))
    for (const item of gallery.galleryItems) assert.ok(html.includes(escape(item.title[language])))
    assert.equal((html.match(/<img\b/g) ?? []).length, 5)
    assert.equal((html.match(/aria-haspopup="dialog"/g) ?? []).length, 5)
    for (const item of gallery.galleryItems) {
      assert.ok(item.src); assert.equal(item.illustrative, false)
      assert.ok(html.includes(`alt="${escape(item.alt[language])}"`))
    }
    const filtered = render('/gallery?category=brows', language)
    const visible = gallery.galleryItems.find((item) => item.categoryId === 'brows')
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

test('portfolio contains only the five supplied real photos, never generated supporting images or sidecars', async () => {
  const { salonMedia, serviceCategoryMedia } = await server.ssrLoadModule('/src/data/media.ts')
  const real = Object.values(salonMedia).filter((item) => item.kind === 'portfolio')
  assert.deepEqual(gallery.galleryItems.map((item) => item.src).sort(), real.map((item) => item.src).sort())
  for (const item of gallery.galleryItems) {
    assert.ok(!item.src.includes(':Zone.Identifier'))
    assert.ok(!Object.values(salonMedia).some((asset) => asset.kind === 'support' && asset.src === item.src))
  }
  assert.equal(serviceCategoryMedia.pedicure.kind, 'support')
  assert.equal(serviceCategoryMedia.pedicure.src, salonMedia.editorialPedicure.src)
  const html = data.catalogueGroups.map((group) => render(`/services?category=${group.id}`, 'en')).join('')
  assert.ok(html.includes('Generated decorative image'))
  assert.ok(html.includes('Sonia Nail Bar work'))
  for (const asset of Object.values(serviceCategoryMedia)) assert.ok(html.includes(`src="${asset.src}"`))
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

for (const language of ['tr', 'en', 'ru']) test(`supplied menu groups, combinations and pending booking states are translated in ${language}`, () => {
  const t = dictionaries.translations[language]
  const html = data.catalogueGroups.map((group) => render(`/services?category=${group.id}`, language)).join('')
  assert.equal(data.catalogueGroups.length, 5)
  for (const group of data.catalogueGroups) {
    assert.ok(html.includes(`id="menu-title-${group.id}"`))
    assert.ok(html.includes(escape(group.name[language])))
  }
  for (const text of [t.catalogue.menu.demoNotice, t.catalogue.menu.pending, t.catalogue.menu.combination, t.catalogue.menu.laserAreas, t.catalogue.services.actualPrice, t.catalogue.services.actualDuration]) assert.ok(html.includes(escape(text)))
  const combinations = data.catalogueServices.filter((entry) => entry.id.endsWith('combination'))
  assert.equal(combinations.length, 2)
  for (const service of combinations) {
    assert.ok(service.priceMinor > 0); assert.ok(service.durationMinutes > 0)
    assert.ok(html.includes(escape(service.name[language])))
    assert.ok(!html.includes(`href="${helpers.serviceBookingHref(service.id)}"`))
  }
})

test('every supplied Turkish treatment name is retained without invented area/package records', () => {
  const names = data.catalogueServices.map((entry) => entry.name.tr)
  for (const name of ['Kalıcı Oje', 'Medikal Manikür', 'Protez Tırnak', 'Protez Tırnak Bakım', 'Nail Art', '3D & Yoğun Nail Art Tırnaklar', 'Pedikür + Kalıcı Oje + Bakım', 'Ayak Tek Parmak Protez', 'El Tek Parmak Protez', 'Manikür (Islak ve Medikal)', 'Pedikür (Islak ve Medikal)', 'Sadece İşlem Çıkartma', 'Manikür + Çıkartma', 'Japon Manikür', 'İpek Kirpik Doğal', 'İpek Kirpik Orta', 'İpek Kirpik Yoğun', 'İpek Kirpik Mega Volüm', 'Kahverengi Tüm Volümlere Ek', 'İpek Kirpik Bakım', 'İpek Kirpik Çıkartma', 'Kirpik Lifting', 'Kaş Laminasyon', 'Microblading', 'Dudak Renklendirme', 'Eyeliner', 'Dipliner', 'Hydrafacial (1 seans)', 'Hydrafacial (3 seans)', 'IPL (Soğuk hava)', 'Diode (Buz başlık)']) assert.ok(names.includes(name), name)
  assert.deepEqual(data.catalogueServices.filter((entry) => entry.categoryId === 'laser').map((entry) => entry.name.tr), ['IPL (Soğuk hava)', 'Diode (Buz başlık)'])
})

test('existing demo IDs, prices, durations and specialist eligibility remain compatible', async () => {
  const { bookingSettings } = await server.ssrLoadModule('/src/data/booking.ts')
  const expected = [['demo-manicure', 45, 50000], ['demo-gel-manicure', 75, 75000], ['demo-pedicure', 60, 65000], ['demo-lash-lift', 60, 90000], ['demo-minimal-art', 30, 25000], ['demo-floral-art', 45, 40000]]
  for (const [id, durationMinutes, priceMinor] of expected) {
    const service = data.catalogueServices.find((entry) => entry.id === id)
    assert.equal(service.durationMinutes, durationMinutes); assert.equal(service.priceMinor, priceMinor)
    assert.ok(helpers.isServiceBookable(service, bookingSettings.specialists))
  }
  assert.deepEqual(data.demoBookingServiceIds, expected.map(([id]) => id))
  for (const service of data.catalogueServices.filter((entry) => entry.id.startsWith('menu-'))) {
    assert.ok(service.priceMinor > 0); assert.ok(service.durationMinutes > 0)
    assert.equal(helpers.findSelectedService(service.id, data.catalogueServices, bookingSettings.specialists), undefined)
    assert.ok(bookingSettings.specialists.every((specialist) => !specialist.serviceIds.includes(service.id)))
  }
})

test('incomplete price, duration or eligibility blocks selection, slots and crafted submissions', async () => {
  const { bookingSettings } = await server.ssrLoadModule('/src/data/booking.ts')
  const engine = await server.ssrLoadModule('/src/lib/availability.ts')
  const original = data.catalogueServices[0]
  const request = { serviceId: original.id, specialistId: bookingSettings.specialists[0].id, startsAt: '2026-11-20T07:00:00Z', customer: { name: 'Demo Customer', phone: '+905551234567' } }
  for (const service of [{ ...original, priceMinor: null }, { ...original, durationMinutes: null }, { ...original, priceMinor: -1 }]) {
    assert.equal(helpers.hasBookingDetails(service), false)
    assert.equal(helpers.findSelectedService(service.id, [service], bookingSettings.specialists), undefined)
    assert.equal(engine.prepareAppointment(request, [service], bookingSettings, [], Date.parse('2026-11-19T06:00:00Z'), 'new-id').ok, false)
  }
  const unassigned = { ...original, id: 'unassigned-treatment' }
  assert.equal(helpers.isServiceBookable(unassigned, bookingSettings.specialists), false)
  assert.equal(engine.prepareAppointment({ ...request, serviceId: unassigned.id }, [unassigned], bookingSettings, [], Date.parse('2026-11-19T06:00:00Z'), 'new-id').ok, false)
  assert.ok(helpers.isServiceBookable({ ...original, priceMinor: 0 }, bookingSettings.specialists))
})

test('customer and manager service pickers omit unconfigured menu treatments', async () => {
  const { AppointmentEditor } = await server.ssrLoadModule('/src/components/manager/AppointmentEditor.tsx')
  const { bookingSettings } = await server.ssrLoadModule('/src/data/booking.ts')
  for (const language of ['tr', 'en', 'ru']) {
    const customer = render('/booking', language)
    const manager = renderToStaticMarkup(withLanguage(language, createElement(MemoryRouter, null, createElement(AppointmentEditor, { appointments: [], settings: bookingSettings, onClose() {}, onSaved() {} }))))
    for (const service of data.catalogueServices.filter((entry) => entry.id.startsWith('menu-'))) {
      assert.ok(!customer.includes(`value="${service.id}"`)); assert.ok(!manager.includes(`value="${service.id}"`))
    }
    for (const id of data.demoBookingServiceIds) { assert.ok(customer.includes(`value="${id}"`)); assert.ok(manager.includes(`value="${id}"`)) }
  }
})

test('official public contact links are exact, safe and shared while WhatsApp stays unset', async () => {
  const { contactLinks } = await server.ssrLoadModule('/src/data/homepage.ts')
  assert.deepEqual(contactLinks, { instagram: 'https://www.instagram.com/sonianailbar/', maps: 'https://maps.app.goo.gl/8shwzBbxc6r11YgHA', whatsapp: null })
  for (const path of ['/', '/services', '/gallery', '/booking']) {
    const html = render(path, 'en')
    for (const url of [contactLinks.instagram, contactLinks.maps]) assert.ok(html.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`))
    assert.ok(!html.includes('https://wa.me/')); assert.ok(!html.includes('href="#"'))
    assert.ok(html.includes('Link awaiting verification'))
  }
})

for (const language of ['tr', 'en', 'ru']) test(`exactly one selected service group renders with pressed buttons in ${language}`, () => {
  const defaultHtml = render('/services', language)
  assert.ok(defaultHtml.includes('id="menu-title-nailBar"'))
  assert.ok(render('/services?category=unknown', language).includes('id="menu-title-nailBar"'))
  for (const group of data.catalogueGroups) {
    const html = render(`/services?category=${group.id}`, language)
    assert.equal((html.match(/class="menu-group"/g) ?? []).length, 1)
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1)
    assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 4)
    assert.ok(html.includes('aria-controls="services-category-content"'))
    assert.ok(html.includes(`id="menu-title-${group.id}"`))
    for (const hidden of data.catalogueGroups.filter((entry) => entry.id !== group.id)) assert.ok(!html.includes(`id="menu-title-${hidden.id}"`))
    for (const service of data.catalogueServices.filter((entry) => !group.categoryIds.includes(entry.categoryId))) assert.ok(!html.includes(`<h5 class="font-semibold leading-7 text-burgundy">${escape(service.name[language])}</h5>`))
    assert.ok(!html.includes(escape(dictionaries.translations[language].catalogue.services.pricePending)))
    assert.ok(!html.includes(escape(dictionaries.translations[language].catalogue.services.durationPending)))
  }
})

test('legacy category anchors choose the correct group and category changes reveal only an offscreen heading', async () => {
  const { selectedCatalogueGroup, revealCatalogueHeading } = await server.ssrLoadModule('/src/lib/catalogueSelection.ts')
  assert.equal(selectedCatalogueGroup('').id, 'nailBar')
  assert.equal(selectedCatalogueGroup('', '#category-lashes').id, 'lashBrow')
  assert.equal(selectedCatalogueGroup('', '#category-pedicure').id, 'nailBar')
  assert.equal(selectedCatalogueGroup('?category=skinCare', '#category-lashes').id, 'skinCare')
  assert.equal(selectedCatalogueGroup('', '#menu-laser').id, 'laser')
  assert.ok(render('/services#category-lashes').includes('id="category-lashes"'))
  let reveals = 0
  for (const [top, bottom] of [[20, 60], [-10, 40], [720, 770]]) {
    revealCatalogueHeading({ getBoundingClientRect: () => ({ top, bottom }), scrollIntoView() { reveals++ } }, 768)
  }
  assert.equal(reveals, 2)
})

test('all 38 service prices and durations come from centralized fictional configuration without granting eligibility', async () => {
  const { demoServiceValues } = await server.ssrLoadModule('/src/data/demoServiceValues.ts')
  const engine = await server.ssrLoadModule('/src/lib/availability.ts')
  assert.equal(data.catalogueServices.length, 38)
  assert.deepEqual(Object.keys(demoServiceValues).sort(), data.catalogueServices.map((entry) => entry.id).sort())
  for (const service of data.catalogueServices) {
    assert.ok(Number.isSafeInteger(service.priceMinor) && service.priceMinor > 0)
    assert.ok(Number.isInteger(service.durationMinutes) && service.durationMinutes > 0 && service.durationMinutes <= 1440)
    assert.equal(service.priceMinor, demoServiceValues[service.id].priceMinor)
    assert.equal(service.durationMinutes, demoServiceValues[service.id].durationMinutes)
    assert.ok(service.illustrative)
    if (!service.id.startsWith('menu-')) continue
    assert.equal(helpers.hasBookingDetails(service), true)
    assert.equal(helpers.isServiceBookable(service, sharedSettings.specialists), false)
    assert.equal(engine.prepareAppointment({ serviceId: service.id, specialistId: sharedSettings.specialists[0].id, startsAt: '2026-11-20T07:00:00Z', customer: { name: 'Demo Customer', phone: '+905551234567' } }, data.catalogueServices, sharedSettings, [], Date.parse('2026-11-19T06:00:00Z'), 'new-id').ok, false)
  }
})

test('new PNG category visuals are explicitly generated and remain outside the authentic gallery', async () => {
  const { serviceCategoryMedia } = await server.ssrLoadModule('/src/data/media.ts')
  for (const [category, filename] of [['permanentMakeup', 'kaliciMakyaj-img.png'], ['laser', 'lazerEpilyasyon-img.png'], ['skinCare', 'ciltBakim-img.png']]) {
    const media = serviceCategoryMedia[category]
    assert.equal(media.kind, 'support')
    assert.ok(media.src.includes(filename))
    assert.ok(!gallery.galleryItems.some((item) => item.src === media.src))
    for (const language of ['tr', 'en', 'ru']) {
      const html = render(`/services?category=${category}`, language)
      assert.ok(html.includes(`src="${media.src}"`))
      assert.ok(html.includes(`alt="${escape(media.alt[language])}"`))
      assert.ok(html.includes(escape(dictionaries.translations[language].catalogue.services.supportingVisual)))
    }
  }
})

for (const language of ['tr', 'en', 'ru']) test(`footer is icon-only, WhatsApp is disabled and no public admin links remain in ${language}`, () => {
  const t = dictionaries.translations[language]
  for (const path of ['/', '/services', '/gallery', '/booking', '/not-a-page']) {
    const html = render(path, language)
    assert.ok(!/href="\/admin(?:[/?#"])/.test(html))
    const footer = html.slice(html.indexOf('<footer'))
    assert.ok(footer.includes('class="footer-contact-links"'))
    assert.ok(footer.includes(`aria-label="${escape(t.homepage.contact.instagram)}"`))
    assert.ok(footer.includes(`aria-label="${escape(t.homepage.contact.maps)}"`))
    assert.match(footer, /<button[^>]*disabled=""[^>]*aria-label="WhatsApp/)
    assert.ok(!footer.includes('class="contact-tile"'))
    assert.ok(!footer.includes('class="contact-description"'))
    assert.ok(!footer.includes('https://wa.me/'))
  }
  const directAdmin = render('/admin', language)
  assert.ok(directAdmin.includes(escape(t.manager.demo)))
  assert.ok(directAdmin.includes('id="calendar-view"'))
})
