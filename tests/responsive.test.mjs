import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

// Structural regressions only. SSR does not calculate viewport layout.
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const [app, context, dictionaries, list, dialog, config] = await Promise.all([
  server.ssrLoadModule('/src/App.tsx'), server.ssrLoadModule('/src/i18n/context.ts'), server.ssrLoadModule('/src/i18n/translations.ts'),
  server.ssrLoadModule('/src/components/manager/AppointmentList.tsx'), server.ssrLoadModule('/src/components/manager/ManagerDialog.tsx'), server.ssrLoadModule('/src/data/booking.ts'),
])
function render(language, content, path = '/') {
  return renderToStaticMarkup(createElement(context.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, createElement(MemoryRouter, { initialEntries: [path] }, content)))
}
for (const language of ['tr', 'en', 'ru']) test(`public and manager navigation keep essential routes accessible in ${language}`, () => {
  const publicHtml = render(language, createElement(app.AppRoutes), '/')
  assert.ok(publicHtml.includes('aria-controls="mobile-navigation"'))
  for (const path of ['/services', '/gallery', '/booking']) assert.ok(publicHtml.includes(`href="${path}"`))
  const manager = render(language, createElement(app.AppRoutes), '/admin')
  assert.ok(manager.includes('class="manager-navigation"'))
  for (const path of ['/admin', '/admin/analytics', '/admin/closures', '/admin/settings']) assert.ok(manager.includes(`href="${path}"`))
  assert.ok(manager.includes('id="calendar-view"')); assert.ok(manager.includes('id="calendar-date"'))
})

test('long customer details remain present in mobile cards and focusable table scrolling region', () => {
  const appointment = { id: 'long-record', serviceId: 'demo-manicure', specialistId: 'demo-specialist-a', startsAt: '2026-11-20T07:00:00Z', endsAt: '2026-11-20T07:45:00Z', status: 'pending', customer: { name: 'Александра'.repeat(8), phone: '+90 (555) 123-45-67' } }
  const html = render('ru', createElement(list.AppointmentList, { appointments: [appointment], settings: config.bookingSettings, onManage() {} }))
  assert.ok(html.includes('role="region"')); assert.ok(html.includes('tabindex="0"'))
  assert.equal(html.split(appointment.customer.name).length - 1, 4) // card/table details and named actions
  assert.ok(html.includes('Copy') || html.includes(dictionaries.translations.ru.manager.copy))
  assert.ok(html.includes('<table')); assert.ok(html.includes('<article'))
})

test('manager dialog retains accessible title, close button and form content for long translated titles', () => {
  const html = render('ru', createElement(dialog.ManagerDialog, { title: 'Длинное название '.repeat(10), onClose() {} }, createElement('input', { type: 'date', 'aria-label': 'Дата' })))
  assert.ok(html.includes('<dialog')); assert.ok(html.includes('aria-labelledby=')); assert.ok(html.includes('type="date"'))
  assert.ok(html.includes(dictionaries.translations.ru.manager.close))
})

test('responsive guardrails scope wide content instead of globally suppressing page overflow', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(css, /fieldset[^}]*min-inline-size:\s*0/s)
  assert.match(css, /\.manager-table-region\s*\{[^}]*max-width:\s*100%/)
  assert.match(css, /\.manager-dialog,\s*\.gallery-lightbox\s*\{[^}]*100dvh/)
  assert.ok(!/body\s*\{[^}]*overflow(?:-x)?:\s*hidden/.test(css))
})

test('booking overview retains four coherent step groups while mobile CSS centers and stacks them', async () => {
  const html = render('ru', createElement(app.AppRoutes), '/')
  const section = html.slice(html.indexOf('<section aria-labelledby="process-heading"'), html.indexOf('<section aria-labelledby="contact-heading"'))
  assert.equal((section.match(/class="booking-step"/g) ?? []).length, 4)
  assert.equal((section.match(/class="step-top"/g) ?? []).length, 4)
  assert.equal((section.match(/class="step-icon"/g) ?? []).length, 4)
  assert.equal((section.match(/class="step-number"/g) ?? []).length, 4)
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  const mobile = css.slice(css.lastIndexOf('@media (max-width: 767px)'))
  assert.match(mobile, /\.booking-steps\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(mobile, /\.step-top\s*\{[^}]*justify-content:\s*center/)
})

test('header wordmark keeps intrinsic unbroken width and retains bow/caption and mobile navigation', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  const brandRules = [...css.matchAll(/\.public-header \.brand\s*\{([^}]+)\}/g)].map((match) => match[1]).join(' ')
  assert.match(brandRules, /inline-size:\s*max-content/)
  assert.match(brandRules, /min-inline-size:\s*max-content/)
  assert.match(brandRules, /flex:\s*0 0 auto/)
  assert.ok(!/max-(?:inline-size|width):\s*[\d.]+(?:rem|px|em)/.test(brandRules), 'A fixed logo cap can split the letter-spaced wordmark')
  assert.match(css, /\.public-header \.brand-name,\s*\.public-header \.brand-caption\s*\{[^}]*white-space:\s*nowrap;[^}]*overflow-wrap:\s*normal/)
  for (const language of ['tr', 'en', 'ru']) {
    const html = render(language, createElement(app.AppRoutes), '/')
    const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'))
    assert.ok(header.includes('class="brand-bow"'))
    assert.ok(header.includes('<span class="brand-name">SONIA</span>'))
    assert.ok(header.includes('<span class="brand-caption">NAIL BAR</span>'))
    assert.ok(header.includes('aria-controls="mobile-navigation"'))
    assert.ok(header.includes('hidden items-center gap-7 xl:flex'))
  }
})
