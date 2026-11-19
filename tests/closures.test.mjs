import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const [closures, engine, preferences, appointments, transactions, management, config, catalogue, time, context, dictionaries, message, editor, app] = await Promise.all([
  server.ssrLoadModule('/src/lib/closures.ts'), server.ssrLoadModule('/src/lib/availability.ts'),
  server.ssrLoadModule('/src/lib/salonSettingsStore.ts'), server.ssrLoadModule('/src/lib/appointmentStore.ts'),
  server.ssrLoadModule('/src/lib/managerStore.ts'), server.ssrLoadModule('/src/lib/management.ts'),
  server.ssrLoadModule('/src/data/booking.ts'), server.ssrLoadModule('/src/data/services.ts'),
  server.ssrLoadModule('/src/lib/bookingTime.ts'), server.ssrLoadModule('/src/i18n/context.ts'),
  server.ssrLoadModule('/src/i18n/translations.ts'), server.ssrLoadModule('/src/components/BookingAvailabilityMessage.tsx'),
  server.ssrLoadModule('/src/components/manager/ClosureEditor.tsx'), server.ssrLoadModule('/src/App.tsx'),
])
const now = Date.parse('2026-11-18T06:00:00Z') // Wednesday 09:00 Istanbul
const zone = 'Europe/Istanbul'
const service = catalogue.catalogueServices[0]
const settings = () => structuredClone(config.bookingSettings)
const at = (date, clock = '10:00') => new Date(time.localInstants(date, clock, zone)[0]).toISOString()
const closure = (first = '2026-11-20', last = first, tr = '') => ({ id: 'closure', startDate: first, endDate: last, reason: { tr, en: '', ru: '' }, illustrative: true })
const input = (date = '2026-11-20', value = settings(), extra = {}) => ({ date, settings: value, service, specialistId: 'demo-specialist-a', appointments: [], now, ...extra })
const booking = (id = 'customer-one', status = 'pending') => ({
  id, serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: at('2026-11-20'), endsAt: at('2026-11-20', '10:45'),
  customer: { name: `Demo ${id}`, phone: '+905551234567' }, status, confirmationMode: 'manual', createdAt: new Date(now).toISOString(), illustrative: true,
})
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
function localized(language, element, path = '/') {
  return renderToStaticMarkup(createElement(context.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, createElement(MemoryRouter, { initialEntries: [path] }, element)))
}
const display = (availability, language = 'tr') => localized(language, createElement(message.BookingAvailabilityMessage, { availability }))
const renderEditor = (language, saved) => localized(language, createElement(editor.ClosureEditor, { closure: saved, settings: settings(), appointments: [], onClose() {}, onSaved() {} }))
const command = (change) => transactions.executeManagerCommand(change, [service], settings())
async function withStorage(run) {
  const previousWindow = globalThis.window
  const previousNow = Date.now
  const values = new Map()
  const events = []
  globalThis.window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }, dispatchEvent: (event) => { events.push(event.type); return true } }
  Date.now = () => now
  try { await run(values, events) } finally { Date.now = previousNow; if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow }
}

test('single-day closure blocks only November 20 and ignores any stale range end', () => {
  const draft = closures.closureDraft('closure', 'single', '2026-11-20', '2026-11-23', '')
  assert.equal(draft.startDate, '2026-11-20'); assert.equal(draft.endDate, '2026-11-20')
  const value = settings(); value.closures = [draft]
  assert.ok(engine.availableSlots(input('2026-11-19', value)).length)
  assert.equal(engine.availableSlots(input('2026-11-20', value)).length, 0)
  assert.ok(engine.availableSlots(input('2026-11-21', value)).length)
})

test('November 20–21 range blocks both endpoints but does not independently block November 22', () => {
  const value = settings(); value.closures = [closure('2026-11-20', '2026-11-21')]
  // Isolate the explicit range from the real illustrative Sunday schedule.
  value.salonHours.days.sunday = structuredClone(value.salonHours.days.saturday)
  value.specialists[0].workingHours.days.sunday = structuredClone(value.specialists[0].workingHours.days.saturday)
  for (const date of ['2026-11-20', '2026-11-21']) {
    assert.equal(engine.availableSlots(input(date, value)).length, 0)
    assert.equal(engine.bookingDayAvailability(input(date, value)).state, 'explicitClosure')
  }
  assert.ok(engine.availableSlots(input('2026-11-22', value)).length)
  assert.equal(engine.bookingDayAvailability(input('2026-11-22', value)).state, 'available')
  assert.equal(closures.closureOnDate(value.closures, '2026-11-22'), undefined)
})

test('November 20–22 range explicitly includes November 22 and ends before November 23', () => {
  const value = settings(); value.closures = [closure('2026-11-20', '2026-11-22')]
  for (const date of ['2026-11-20', '2026-11-21', '2026-11-22']) assert.equal(engine.bookingDayAvailability(input(date, value)).state, 'explicitClosure')
  assert.equal(engine.bookingDayAvailability(input('2026-11-23', value)).state, 'available')
})

test('reported November 20, 21, 22 behavior is attributed to explicit closure then weekly Sunday hours', () => {
  const value = settings(); value.closures = [closure('2026-11-20', '2026-11-21')]
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', value)).state, 'explicitClosure')
  assert.equal(engine.bookingDayAvailability(input('2026-11-21', value)).state, 'explicitClosure')
  const sunday = engine.bookingDayAvailability(input('2026-11-22', value))
  assert.equal(sunday.state, 'salonWeeklyClosed')
  assert.ok(!('closure' in sunday))
  assert.equal(engine.bookingDayAvailability(input('2026-11-23', value)).state, 'available')
})

test('specialist weekly off, missing hours and schedule mismatch have distinct explanations', () => {
  assert.equal(engine.bookingDayAvailability(input('2026-11-18', settings(), { specialistId: 'demo-specialist-b' })).state, 'specialistWeeklyOff')
  const missing = settings(); missing.specialists[0].workingHours = undefined
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', missing)).state, 'specialistUnavailable')
  const noOverlap = settings(); noOverlap.specialists[0].workingHours.days.friday = [{ opensAt: '05:00', closesAt: '06:00' }]
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', noOverlap)).state, 'specialistUnavailable')
  const unconfirmed = settings(); unconfirmed.specialists[0].workingHours.days.friday = null
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', unconfirmed)).state, 'specialistUnavailable')
})

test('unconfirmed salon hours are not described as a weekly day off or explicit closure', () => {
  const value = settings(); value.salonHours.days.friday = null
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', value)).state, 'salonUnavailable')
})

test('November 21 specialist day off is not blamed on a closure ending November 20', () => {
  const value = settings(); value.closures = [closure('2026-11-20')]
  value.specialists[0].workingHours.days.saturday = []
  assert.equal(engine.bookingDayAvailability(input('2026-11-21', value)).state, 'specialistWeeklyOff')
  assert.equal(engine.bookingDayAvailability(input('2026-11-21', value, { specialistId: 'demo-specialist-b' })).state, 'available')
})

for (const status of ['pending', 'confirmed']) test(`a fully occupied ${status} day is fully booked rather than a salon closure`, () => {
  const occupied = { ...booking(), status, endsAt: at('2026-11-20', '19:00') }
  const result = engine.bookingDayAvailability(input('2026-11-20', settings(), { appointments: [occupied] }))
  assert.equal(result.state, 'fullyBooked')
  assert.equal(result.slots.length, 0)
  assert.ok(!('closure' in result))
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', settings(), { appointments: [{ ...occupied, status: 'cancelled' }] })).state, 'available')
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', settings(), { appointments: [{ ...occupied, specialistId: 'demo-specialist-b' }] })).state, 'available')
})

test('elapsed starts use a no-times state rather than claiming the day is fully booked', () => {
  const result = engine.bookingDayAvailability(input('2026-11-18', settings(), { now: Date.parse(at('2026-11-18', '20:00')) }))
  assert.equal(result.state, 'noSlots')
})

test('overnight weekly carryover remains bookable even when the following weekday has no new openings', () => {
  const value = settings()
  for (const hours of [value.salonHours, value.specialists[0].workingHours]) {
    hours.days.wednesday = [{ opensAt: '22:00', closesAt: '02:00' }]
    hours.days.thursday = []
  }
  assert.equal(engine.bookingDayAvailability(input('2026-11-19', value)).state, 'available')
  value.closures = [closure('2026-11-19')]
  assert.equal(engine.bookingDayAvailability(input('2026-11-19', value)).state, 'explicitClosure')
})

for (const language of ['tr', 'en', 'ru']) {
  test(`empty closure description displays only the exact ${language} default`, () => {
    const result = engine.bookingDayAvailability(input('2026-11-20', { ...settings(), closures: [closure()] }))
    const html = display(result, language)
    assert.ok(html.includes(escape(dictionaries.translations[language].booking.availability.explicitClosure)))
    assert.equal((html.match(/<p\b/g) ?? []).length, 1)
    assert.ok(!html.includes(escape(dictionaries.translations[language].booking.noSlots)))
    assert.ok(!html.includes('lang="tr"'))
  })
  test(`Turkish custom description replaces the default unchanged on the ${language} website`, () => {
    const custom = 'Tadilat nedeniyle kapalıyız.'
    const saved = { ...closure('2026-11-20', '2026-11-20', custom), reason: { tr: custom, en: 'Legacy English description', ru: 'Старое описание' } }
    const html = display(engine.bookingDayAvailability(input('2026-11-20', { ...settings(), closures: [saved] })), language)
    assert.ok(html.includes(custom)); assert.ok(html.includes('lang="tr"'))
    assert.equal((html.match(/<p\b/g) ?? []).length, 1)
    assert.ok(!html.includes(escape(dictionaries.translations[language].booking.availability.explicitClosure)))
    assert.ok(!html.includes('Legacy English description')); assert.ok(!html.includes('Старое описание'))
  })
  test(`fixed availability explanations and closure editor labels render translated in ${language}`, () => {
    const t = dictionaries.translations[language]
    for (const state of ['salonWeeklyClosed', 'salonUnavailable', 'specialistWeeklyOff', 'specialistUnavailable', 'fullyBooked', 'noSlots']) assert.ok(display({ state, slots: [] }, language).includes(escape(t.booking.availability[state])))
    const html = renderEditor(language)
    for (const label of [t.manager.closurePeriod, t.manager.singleDay, t.manager.dateRange, t.manager.reason, t.manager.closureDescriptionHint]) assert.ok(html.includes(escape(label)))
    assert.equal((html.match(/<textarea\b/g) ?? []).length, 1)
    assert.match(html, /<textarea[^>]*id="closure-description"[^>]*lang="tr"/)
    assert.ok(!html.includes('reason-en')); assert.ok(!html.includes('reason-ru'))
    assert.ok(!html.includes('id="closure-last"'))
    const saved = closure('2026-11-20', '2026-11-21', 'Tadilat nedeniyle kapalıyız.')
    const range = renderEditor(language, saved)
    assert.ok(range.includes('id="closure-last"'))
    assert.ok(range.includes(escape(t.manager.closureInclusive)))
    const dates = closures.formatClosureDates(saved, language, zone)
    assert.ok(range.includes(escape(t.manager.closurePreviewRange.replace('{dates}', dates))))
    assert.ok(range.includes('Tadilat nedeniyle kapalıyız.'))
    const single = renderEditor(language, closure())
    assert.ok(single.includes(escape(t.manager.closurePreviewSingle.replace('{dates}', closures.formatClosureDates(closure(), language, zone)))))
  })
}

test('whitespace-only descriptions use the default and custom text is safely escaped without translation', () => {
  assert.equal(closures.normalizeClosureDescription('  Tadilat\n nedeniyle  kapalıyız.  '), 'Tadilat nedeniyle kapalıyız.')
  const whitespace = display({ state: 'explicitClosure', closure: closure('2026-11-20', '2026-11-20', ' \n\t '), slots: [] }, 'en')
  assert.ok(whitespace.includes('The salon is closed on this date.'))
  const html = display({ state: 'explicitClosure', closure: closure('2026-11-20', '2026-11-20', '<script>alert(1)</script>'), slots: [] })
  assert.ok(!html.includes('<script>')); assert.ok(html.includes('&lt;script&gt;'))
  assert.equal(display({ state: 'available', slots: [] }), '')
})

test('overlapping closures choose one deterministic custom message without combining defaults or descriptions', () => {
  const blank = closure('2026-11-20', '2026-11-21')
  const custom = { ...closure('2026-11-20', '2026-11-21', 'Tadilat nedeniyle kapalıyız.'), id: 'custom' }
  for (const list of [[blank, custom], [custom, blank]]) {
    const result = engine.bookingDayAvailability(input('2026-11-20', { ...settings(), closures: list }))
    assert.equal(result.closure.id, custom.id)
    assert.equal((display(result).match(/<p\b/g) ?? []).length, 1)
  }
})

test('single/range drafts reject missing, impossible and reversed dates, and never shift calendar labels', async () => withStorage(async () => {
  for (const [period, first, last] of [['single', '', ''], ['range', '2026-11-21', '2026-11-20'], ['range', '2026-11-20', ''], ['single', '2026-02-30', '']]) {
    const invalid = closures.closureDraft('invalid', period, first, last, '')
    assert.equal(preferences.isSalonClosure(invalid), false)
    assert.deepEqual(await command({ kind: 'closure', closure: invalid }), { ok: false, error: 'closure' })
  }
  assert.equal(closures.closureDraft('valid', 'range', '2026-11-20', '2026-11-21', '').endDate, '2026-11-21')
}))

test('Istanbul date matching and previews retain the exact closure dates around UTC midnight', () => {
  const saved = closure('2026-11-20', '2026-11-21')
  assert.equal(closures.closureOnDate([saved], time.zonedParts(Date.parse('2026-11-19T21:00:00Z'), zone).date)?.id, saved.id)
  assert.equal(closures.closureOnDate([saved], time.zonedParts(Date.parse('2026-11-21T20:59:59Z'), zone).date)?.id, saved.id)
  assert.equal(closures.closureOnDate([saved], time.zonedParts(Date.parse('2026-11-21T21:00:00Z'), zone).date), undefined)
  assert.equal(closures.closureOnDate([saved], 'invalid'), undefined)
  const preview = closures.formatClosureDates(saved, 'tr', zone)
  assert.ok(preview.includes('20')); assert.ok(preview.includes('21')); assert.ok(preview.includes('Kasım')); assert.ok(preview.includes('2026')); assert.ok(!preview.includes('22'))
})

test('legacy version 1 closure descriptions survive reads and edits without demanding new language fields', async () => withStorage(async (values) => {
  const saved = { ...closure('2026-11-20', '2026-11-21', 'Eski Türkçe açıklama.'), reason: { tr: 'Eski Türkçe açıklama.', en: 'Old English text', ru: 'Старый русский текст' } }
  const raw = JSON.stringify({ version: 1, data: { confirmationMode: 'manual', closures: [saved] } })
  values.set(preferences.salonPreferencesStore.key, raw)
  assert.deepEqual(preferences.readBookingSettings(settings()).settings.closures, [saved])
  renderEditor('ru', saved)
  assert.equal(values.get(preferences.salonPreferencesStore.key), raw)
  const edited = closures.closureDraft(saved.id, 'single', '2026-11-21', '', '  Yeni Türkçe açıklama.  ', saved)
  assert.ok((await command({ kind: 'closure', closure: edited, expected: saved })).ok)
  const result = preferences.readBookingSettings(settings()).settings.closures[0]
  assert.deepEqual(result.reason, { tr: 'Yeni Türkçe açıklama.', en: saved.reason.en, ru: saved.reason.ru })
  assert.equal(result.startDate, result.endDate)
}))

test('existing non-Turkish legacy descriptions are retained in storage while empty Turkish uses a localized default', () => {
  const saved = { ...closure(), reason: { tr: '', en: 'Existing English only', ru: 'Существующее описание' } }
  const edited = closures.closureDraft(saved.id, 'single', saved.startDate, '', '', saved)
  assert.deepEqual(edited.reason, saved.reason)
  assert.ok(display({ state: 'explicitClosure', closure: saved, slots: [] }, 'en').includes('The salon is closed on this date.'))
})

test('closure CRUD recalculates customer availability and submit revalidation without changing reservations', async () => withStorage(async (values, events) => {
  const value = settings()
  assert.ok(engine.availableSlots(input('2026-11-20', value)).length)
  const saved = closure('2026-11-20', '2026-11-21')
  assert.ok((await command({ kind: 'closure', closure: saved })).ok)
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', preferences.readBookingSettings(value).settings)).state, 'explicitClosure')
  const request = { serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: at('2026-11-20'), customer: { name: 'Demo Customer', phone: '+905551234567' } }
  assert.deepEqual(await appointments.submitPrototypeBooking(request, [service], value), { ok: false, error: 'unavailable' })
  const edited = closures.closureDraft(saved.id, 'single', '2026-11-21', '', '', saved)
  assert.ok((await command({ kind: 'closure', closure: edited, expected: saved })).ok)
  assert.equal(engine.bookingDayAvailability(input('2026-11-20', preferences.readBookingSettings(value).settings)).state, 'available')
  assert.equal(engine.bookingDayAvailability(input('2026-11-21', preferences.readBookingSettings(value).settings)).state, 'explicitClosure')
  assert.ok((await command({ kind: 'removeClosure', expected: edited })).ok)
  assert.equal(engine.bookingDayAvailability(input('2026-11-21', preferences.readBookingSettings(value).settings)).state, 'available')
  assert.equal(engine.bookingDayAvailability(input('2026-11-22', preferences.readBookingSettings(value).settings)).state, 'salonWeeklyClosed')
  assert.ok((await appointments.submitPrototypeBooking(request, [service], value)).ok)
  assert.ok(values.has(appointments.appointmentStore.key))
  assert.ok(events.every((name) => name === 'sonia-nail-bar:prototype-updated'))
}))

test('affected appointments remain intact and visible with contacts, services, dates and management access', async () => withStorage(async () => {
  const records = [booking('first'), { ...booking('second', 'confirmed'), startsAt: at('2026-11-20', '11:00'), endsAt: at('2026-11-20', '11:45') }]
  assert.ok(appointments.appointmentStore.write(records))
  assert.ok((await command({ kind: 'closure', closure: closure() })).ok)
  assert.deepEqual(appointments.appointmentStore.read([]), records)
  const loaded = preferences.readBookingSettings(settings()).settings
  assert.equal(management.affectedAppointments(records, loaded.closures, zone).length, 2)
  for (const language of ['tr', 'en', 'ru']) {
    const html = localized(language, createElement(app.AppRoutes), '/admin/closures')
    for (const record of records) { assert.ok(html.includes(record.customer.name)); assert.ok(html.includes(record.customer.phone)) }
    assert.ok(html.includes(escape(service.name[language])))
    assert.ok(html.includes(escape(loaded.specialists[0].name[language])))
    assert.ok(html.includes(escape(time.formatBookingRange(records[0].startsAt, records[0].endsAt, language, zone))))
    assert.ok(html.includes(escape(dictionaries.translations[language].manager.details)))
    assert.ok(html.includes('https://wa.me/905551234567'))
    const details = localized(language, createElement(app.AppRoutes), '/admin?appointment=first')
    assert.ok(details.includes('<dialog'))
    assert.ok(details.includes(escape(dictionaries.translations[language].manager.edit)))
    assert.ok(details.includes(escape(dictionaries.translations[language].manager.cancel)))
  }
  const moved = await command({ kind: 'appointment', command: { type: 'edit', expected: records[0], request: { serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: at('2026-11-23'), customer: { name: 'Tampered Customer', phone: '+447700900123' } } } })
  assert.ok(moved.ok)
  assert.deepEqual(appointments.appointmentStore.read([])[0].customer, records[0].customer)
  assert.equal(appointments.appointmentStore.read([])[0].createdAt, records[0].createdAt)
}))
