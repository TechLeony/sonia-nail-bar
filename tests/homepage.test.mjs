import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

// Render the actual TSX through the existing Vite pipeline, without adding a
// browser/test framework dependency. This checks content and route integration;
// viewport layout and interactive behavior still require browser verification.
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
after(() => server.close())
const [home, layout, i18n, dictionaries, data] = await Promise.all([
  server.ssrLoadModule('/src/pages/HomePage.tsx'),
  server.ssrLoadModule('/src/layouts/PublicLayout.tsx'),
  server.ssrLoadModule('/src/i18n/context.ts'),
  server.ssrLoadModule('/src/i18n/translations.ts'),
  server.ssrLoadModule('/src/data/homepage.ts'),
])

function render(language) {
  return renderToStaticMarkup(createElement(i18n.I18nContext.Provider, {
    value: { language, t: dictionaries.translations[language], setLanguage() {} },
  }, createElement(MemoryRouter, { initialEntries: ['/'] },
    createElement(Routes, null,
      createElement(Route, { element: createElement(layout.PublicLayout) },
        createElement(Route, { index: true, element: createElement(home.HomePage) })),
    )),
  ))
}

for (const language of ['tr', 'en', 'ru']) {
  test(`homepage renders translated sections, navigation and local imagery in ${language}`, () => {
    const html = render(language)
    const copy = dictionaries.translations[language].homepage
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    for (const id of ['hero', 'services', 'gallery', 'process', 'contact']) {
      assert.ok(html.includes(`aria-labelledby="${id}-heading"`))
      assert.ok(html.includes(`id="${id}-heading"`))
    }
    for (const text of [copy.hero.title, copy.hero.accent, copy.gallery.note,
      copy.services.note, copy.process.note, copy.contact.pending]) {
      assert.ok(html.includes(text), `Missing translated content: ${text}`)
    }
    for (const route of ['/booking', '/services', '/gallery']) {
      assert.ok(html.includes(`href="${route}"`))
    }
    assert.ok(html.includes('aria-expanded="false"'))
    assert.ok(html.includes('aria-controls="mobile-navigation"'))
    assert.ok(html.includes('href="#main-content"'))
    assert.equal((html.match(/<option\b/g) ?? []).length, 3)
    assert.equal((html.match(/<li\b/g) ?? []).length, 10) // 4 steps and 3 contact actions in both main content and footer
    assert.ok(!html.includes('href="#"'))
    assert.ok(html.includes('<img'))
    assert.ok(html.includes(copy.hero.imageNote))
    const contact = html.slice(html.indexOf('<section aria-labelledby="contact-heading"'))
    assert.ok(contact.includes('class="contact-photo-background"'))
    assert.ok(contact.includes('class="contact-logo"'))
    assert.ok(!contact.includes('<figcaption'))
    assert.ok(!contact.includes(copy.contact.imageNote))
    for (const item of data.homepageMedia.gallery) assert.ok(html.includes(`src="${item.src}"`))
    assert.ok(html.includes('href="https://www.instagram.com/sonianailbar/"'))
    assert.ok(html.includes('href="https://maps.app.goo.gl/8shwzBbxc6r11YgHA"'))
    assert.ok(!html.includes('https://wa.me/'))
  })
}

test('every language has the same nonempty translation keys', () => {
  function paths(value, prefix = '') {
    return Object.entries(value).flatMap(([key, entry]) => {
      const path = `${prefix}.${key}`
      if (typeof entry === 'string') {
        assert.ok(entry.trim(), `Empty translation at ${path}`)
        return path
      }
      return paths(entry, path)
    }).sort()
  }
  assert.deepEqual(paths(dictionaries.translations.tr), paths(dictionaries.translations.en))
  assert.deepEqual(paths(dictionaries.translations.tr), paths(dictionaries.translations.ru))
})

test('configured verified contact URLs render as external links', () => {
  const previous = data.contactLinks.instagram
  // A reserved example domain tests the future configured-link branch only;
  // it never becomes application content or a claimed salon account.
  try {
    data.contactLinks.instagram = 'https://example.com/verified-link-test'
    const html = render('en')
    assert.ok(html.includes('href="https://example.com/verified-link-test"'))
    assert.ok(html.includes('rel="noopener noreferrer"'))
    assert.ok(html.includes('Link awaiting verification'))
  } finally {
    data.contactLinks.instagram = previous
  }
})

test('media configuration renders real image elements with loading priorities', () => {
  const previous = { hero: data.homepageMedia.hero, lashes: data.homepageMedia.services.lashes, contact: data.homepageMedia.contact }
  try {
    data.homepageMedia.hero = '/approved-test/hero.webp'
    data.homepageMedia.services.lashes = '/approved-test/lashes.webp'
    data.homepageMedia.contact = '/approved-test/interior.webp'
    const html = render('en')
    assert.ok(html.includes('salon-hero has-photo'))
    assert.match(html, /<img[^>]+src="\/approved-test\/hero.webp"[^>]+loading="eager"/)
    assert.match(html, /<img[^>]+src="\/approved-test\/lashes.webp"[^>]+loading="lazy"/)
    assert.match(html, /<img[^>]+src="\/approved-test\/interior.webp"[^>]+loading="lazy"/)
    assert.ok(!html.includes('homepage-reference.png'))
    assert.ok(!html.includes('Photo coming soon')) // All configured slots now have local images
  } finally {
    data.homepageMedia.hero = previous.hero
    data.homepageMedia.services.lashes = previous.lashes
    data.homepageMedia.contact = previous.contact
  }
})
