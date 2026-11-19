import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const [analytics, management, store, transactions, config, catalogue, time, app, context, dictionaries, queue] = await Promise.all([
  server.ssrLoadModule('/src/lib/analytics.ts'), server.ssrLoadModule('/src/lib/management.ts'),
  server.ssrLoadModule('/src/lib/appointmentStore.ts'), server.ssrLoadModule('/src/lib/managerStore.ts'),
  server.ssrLoadModule('/src/data/booking.ts'), server.ssrLoadModule('/src/data/services.ts'),
  server.ssrLoadModule('/src/lib/bookingTime.ts'),
  server.ssrLoadModule('/src/App.tsx'), server.ssrLoadModule('/src/i18n/context.ts'),
  server.ssrLoadModule('/src/i18n/translations.ts'), server.ssrLoadModule('/src/components/manager/PendingAppointments.tsx'),
])
const now = Date.parse('2026-11-18T06:00:00Z') // Wednesday, 09:00 Istanbul
const zone = 'Europe/Istanbul'
const service = catalogue.catalogueServices[0]
const settings = () => structuredClone(config.bookingSettings)
const at = (date, clock = '10:00') => new Date(time.localInstants(date, clock, zone)[0]).toISOString()
const record = (overrides = {}) => ({
  id: 'appointment', serviceId: service.id, specialistId: 'demo-specialist-a',
  startsAt: at('2026-11-20'), endsAt: at('2026-11-20', '10:45'),
  customer: { name: 'Demo Customer', phone: '+90 555 123 45 67' },
  status: 'pending', confirmationMode: 'manual', createdAt: new Date(now).toISOString(), illustrative: true, ...overrides,
})
const request = (date = '2026-11-20') => ({ serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: at(date), customer: { name: 'Future Customer', phone: '+905551234567' } })
const range = (startDate = '2026-11-16', endDate = '2026-11-22') => ({ startDate, endDate })
const report = (records, period = range(), services = [service]) => analytics.analyticsMetrics(records, services, period, zone)
const metrics = (records, clock = now) => management.dashboardMetrics(records, clock, zone)
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;')
function render(path, language = 'en') {
  return renderToStaticMarkup(createElement(context.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, createElement(MemoryRouter, { initialEntries: [path] }, createElement(app.AppRoutes))))
}
function cardValue(html, label) {
  const index = html.indexOf(`>${escape(label)}</h2>`)
  assert.ok(index >= 0, `Missing card: ${label}`)
  return Number(html.slice(index).match(/<p[^>]*>(\d+)<\/p>/)?.[1])
}
async function withStorage(run) {
  const previousWindow = globalThis.window
  const previousNow = Date.now
  const values = new Map()
  const events = new EventTarget()
  globalThis.window = {
    localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) },
    addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events),
  }
  Date.now = () => now
  try { await run(values, events) } finally { Date.now = previousNow; if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow }
}
const command = (change) => transactions.executeManagerCommand({ kind: 'appointment', command: change }, [service], settings())

test('future customer booking increases global pending while today total and calendar stay empty', async () => withStorage(async () => {
  const result = await store.submitPrototypeBooking(request(), [service], settings())
  assert.ok(result.ok)
  const records = store.appointmentStore.read([])
  assert.deepEqual(metrics(records), { total: 0, pending: 1, confirmed: 0, completed: 0 })
  assert.deepEqual(management.filterAppointments(records, ['2026-11-18'], 'all', '', zone), [])
  const html = render('/admin')
  assert.equal(cardValue(html, dictionaries.translations.en.manager.today), 0)
  assert.equal(cardValue(html, dictionaries.translations.en.manager.pending), 1)
  const pending = html.slice(html.indexOf('<section aria-labelledby="pending-heading"'), html.indexOf('<section aria-labelledby="calendar-heading"'))
  assert.ok(pending.includes('Future Customer'))
  assert.ok(pending.includes('+905551234567'))
  assert.ok(pending.includes(escape(service.name.en)))
  assert.ok(pending.includes('View / Edit'))
  assert.ok(pending.includes('Approve'))
  assert.ok(pending.includes('Copy phone'))
  assert.ok(pending.includes('https://wa.me/905551234567'))
}))

test('manager creation and approval update global statuses without depending on selected dates', async () => withStorage(async () => {
  assert.ok((await command({ type: 'create', request: request(), status: 'pending' })).ok)
  const before = store.appointmentStore.read([])[0]
  assert.equal(metrics([before]).pending, 1)
  assert.ok((await command({ type: 'status', expected: before, status: 'confirmed' })).ok)
  assert.deepEqual(metrics(store.appointmentStore.read([])), { total: 0, pending: 0, confirmed: 1, completed: 0 })
}))

test('all three status cards span all dates and remain independent of calendar, status and specialist filters', () => {
  const records = [record(), record({ id: 'future', startsAt: at('2026-11-25'), status: 'confirmed' }), record({ id: 'history', startsAt: at('2026-10-01'), status: 'completed' }), record({ id: 'cancelled', startsAt: at('2026-11-18'), status: 'cancelled' })]
  for (const date of ['2026-10-01', '2026-11-18', '2026-11-25']) for (const status of ['all', 'pending', 'completed']) for (const specialist of ['', 'unknown']) {
    management.filterAppointments(records, [date], status, specialist, zone)
    assert.deepEqual(metrics(records), { total: 0, pending: 1, confirmed: 1, completed: 1 })
  }
  assert.equal(metrics([record({ startsAt: at('2026-11-18'), status: 'pending' }), record({ startsAt: at('2026-11-18'), status: 'confirmed' }), record({ startsAt: at('2026-11-18'), status: 'completed' })]).total, 3)
})

test('today uses Istanbul midnight rather than UTC or a selected calendar date', () => {
  const localThursday = Date.parse('2026-11-18T21:00:00Z')
  assert.equal(metrics([record({ startsAt: '2026-11-18T21:00:00Z' })], localThursday).total, 1)
  assert.equal(metrics([record({ startsAt: '2026-11-18T20:59:59Z' })], localThursday).total, 0)
})

test('cancellation updates summary and records its event date while releasing the reserved slot', async () => withStorage(async () => {
  const first = await store.submitPrototypeBooking(request(), [service], settings())
  assert.ok(first.ok)
  assert.ok(!(await store.submitPrototypeBooking(request(), [service], settings())).ok)
  assert.ok((await command({ type: 'status', expected: first.appointment, status: 'cancelled' })).ok)
  const cancelled = store.appointmentStore.read([])[0]
  assert.deepEqual(metrics([cancelled]), { total: 0, pending: 0, confirmed: 0, completed: 0 })
  assert.equal(cancelled.cancelledAt, new Date(now).toISOString())
  assert.equal(cancelled.updatedAt, cancelled.cancelledAt)
  assert.equal(report([cancelled]).cancelledEvents, 1)
  assert.ok((await store.submitPrototypeBooking(request(), [service], settings())).ok)
}))

test('completion updates all-history totals and records actual completion time', () => {
  const original = record({ status: 'confirmed', startsAt: at('2026-11-17'), endsAt: at('2026-11-17', '10:45'), createdAt: at('2026-11-16') })
  const result = management.applyAppointmentCommand({ type: 'status', expected: original, status: 'completed' }, [original], [service], settings(), now, 'unused')
  assert.ok(result.ok)
  assert.deepEqual(metrics(result.value), { total: 0, pending: 0, confirmed: 0, completed: 1 })
  assert.equal(result.value[0].completedAt, new Date(now).toISOString())
  assert.equal(result.value[0].updatedAt, new Date(now).toISOString())
  assert.equal(report(result.value, range('2026-11-18', '2026-11-18')).completedEvents, 1)
})

test('rescheduling changes today total without changing global statuses, identity, creation or saved price', async () => withStorage(async () => {
  assert.ok((await command({ type: 'create', request: request('2026-11-18'), status: 'pending' })).ok)
  const before = store.appointmentStore.read([])[0]
  assert.deepEqual(metrics([before]), { total: 1, pending: 1, confirmed: 0, completed: 0 })
  assert.ok((await command({ type: 'edit', expected: before, request: request() })).ok)
  const after = store.appointmentStore.read([])[0]
  assert.deepEqual(metrics([after]), { total: 0, pending: 1, confirmed: 0, completed: 0 })
  assert.deepEqual(after.customer, before.customer)
  assert.equal(after.createdAt, before.createdAt)
  assert.deepEqual(after.servicePriceSnapshot, before.servicePriceSnapshot)
}))

test('same-tab customer/manager mutations notify the shared dashboard and report subscription immediately', async () => withStorage(async () => {
  const snapshots = []
  const unsubscribe = store.subscribeToAppointmentChanges(() => snapshots.push({ operational: metrics(store.appointmentStore.read([])), report: report(store.appointmentStore.read([])) }))
  try {
    const customer = await store.submitPrototypeBooking(request(), [service], settings())
    assert.ok(customer.ok)
    assert.equal(snapshots.length, 1); assert.equal(snapshots[0].operational.pending, 1)
    assert.ok((await command({ type: 'status', expected: customer.appointment, status: 'confirmed' })).ok)
    assert.equal(snapshots.length, 2); assert.equal(snapshots[1].operational.pending, 0); assert.equal(snapshots[1].operational.confirmed, 1)
    const confirmed = store.appointmentStore.read([])[0]
    assert.ok((await command({ type: 'status', expected: confirmed, status: 'cancelled' })).ok)
    assert.equal(snapshots.length, 3); assert.equal(snapshots[2].operational.confirmed, 0); assert.equal(snapshots[2].report.cancelledEvents, 1)
  } finally { unsubscribe() }
}))

test('pending queue sorts upcoming requests nearest first across all dates and retains past requests separately', () => {
  const records = [record({ id: 'later', startsAt: at('2026-11-25') }), record({ id: 'past', startsAt: at('2026-11-17') }), record({ id: 'nearest', startsAt: at('2026-11-19') }), record({ id: 'confirmed', status: 'confirmed' })]
  const groups = management.pendingAppointments(records, now)
  assert.deepEqual(groups.upcoming.map((entry) => entry.id), ['nearest', 'later'])
  assert.deepEqual(groups.past.map((entry) => entry.id), ['past'])
  assert.equal(records[0].id, 'later')
})

for (const [period, first, last] of [
  ['thisWeek', '2026-11-16', '2026-11-22'], ['lastWeek', '2026-11-09', '2026-11-15'],
  ['thisMonth', '2026-11-01', '2026-11-30'], ['lastMonth', '2026-10-01', '2026-10-31'],
]) test(`reporting period ${period} uses inclusive Istanbul calendar boundaries`, () => {
  assert.deepEqual(analytics.reportingRange(period, now, zone, range()), { ok: true, range: range(first, last) })
})

test('reporting boundaries handle Istanbul month/year rollover, Sunday/Monday and leap February', () => {
  assert.deepEqual(analytics.reportingRange('thisMonth', Date.parse('2026-12-31T21:00:00Z'), zone, range()).range, range('2027-01-01', '2027-01-31'))
  assert.deepEqual(analytics.reportingRange('lastMonth', Date.parse('2026-12-31T21:00:00Z'), zone, range()).range, range('2026-12-01', '2026-12-31'))
  assert.deepEqual(analytics.reportingRange('thisWeek', Date.parse('2026-11-22T20:59:59Z'), zone, range()).range, range('2026-11-16', '2026-11-22'))
  assert.deepEqual(analytics.reportingRange('thisWeek', Date.parse('2026-11-22T21:00:00Z'), zone, range()).range, range('2026-11-23', '2026-11-29'))
  assert.deepEqual(analytics.reportingRange('lastMonth', Date.parse('2028-03-01T06:00:00Z'), zone, range()).range, range('2028-02-01', '2028-02-29'))
})

test('custom ranges accept one or multiple inclusive days and reject invalid or reversed dates', () => {
  for (const custom of [range('2026-11-18', '2026-11-18'), range('2026-10-01', '2026-11-30')]) assert.deepEqual(analytics.reportingRange('custom', now, zone, custom), { ok: true, range: custom })
  for (const custom of [range('', '2026-11-18'), range('2026-02-30', '2026-11-18')]) assert.deepEqual(analytics.reportingRange('custom', now, zone, custom), { ok: false, error: 'invalidDate' })
  assert.deepEqual(analytics.reportingRange('custom', now, zone, range('2026-11-19', '2026-11-18')), { ok: false, error: 'dateOrder' })
})

test('creation, service start and lifecycle events use separate dates, including both period boundaries', () => {
  const records = [
    record({ id: 'created-start', createdAt: '2026-11-17T21:00:00Z', startsAt: at('2026-11-25') }),
    record({ id: 'created-end', createdAt: '2026-11-18T20:59:59Z', startsAt: at('2026-11-25') }),
    record({ id: 'scheduled', createdAt: at('2026-11-10'), startsAt: at('2026-11-18'), status: 'confirmed' }),
    record({ id: 'completed', createdAt: at('2026-11-10'), startsAt: at('2026-11-17'), status: 'completed', completedAt: at('2026-11-18') }),
    record({ id: 'cancelled', createdAt: at('2026-11-10'), startsAt: at('2026-11-25'), status: 'cancelled', cancelledAt: '2026-11-18T20:59:59Z' }),
    record({ id: 'outside', createdAt: '2026-11-18T21:00:00Z', startsAt: at('2026-11-25') }),
  ]
  const result = report(records, range('2026-11-18', '2026-11-18'))
  assert.equal(result.created, 2); assert.equal(result.scheduled, 1)
  assert.deepEqual(result.statuses, { pending: 0, confirmed: 1, completed: 0, cancelled: 0 })
  assert.equal(result.completedEvents, 1); assert.equal(result.cancelledEvents, 1)
})

test('scheduled status breakdown includes all statuses but uses only service start dates', () => {
  const records = ['pending', 'confirmed', 'completed', 'cancelled'].map((status) => record({ id: status, status }))
  const result = report(records)
  assert.equal(result.scheduled, 4)
  assert.deepEqual(result.statuses, { pending: 1, confirmed: 1, completed: 1, cancelled: 1 })
  assert.equal(result.completedEvents, 0); assert.equal(result.cancelledEvents, 0)
})

test('new customer and manager appointments capture immutable original creation time and booked service price', async () => withStorage(async () => {
  const result = await store.submitPrototypeBooking(request(), [service], settings())
  assert.ok(result.ok)
  assert.equal(result.appointment.createdAt, new Date(now).toISOString())
  assert.equal(result.appointment.updatedAt, result.appointment.createdAt)
  assert.deepEqual(result.appointment.servicePriceSnapshot, { priceMinor: service.priceMinor, currency: 'TRY' })
  const created = await command({ type: 'create', request: request('2026-11-21'), status: 'confirmed' })
  assert.ok(created.ok)
  assert.deepEqual(store.appointmentStore.read([])[1].servicePriceSnapshot, result.appointment.servicePriceSnapshot)
}))

test('approval and same-service rescheduling preserve booked price and creation time after catalogue prices change', () => {
  const original = record({ servicePriceSnapshot: { priceMinor: 12345, currency: 'TRY' } })
  const changedService = { ...service, priceMinor: 99999 }
  for (const change of [{ type: 'status', expected: original, status: 'confirmed' }, { type: 'edit', expected: original, request: request('2026-11-21') }]) {
    const result = management.applyAppointmentCommand(change, [original], [changedService], settings(), now + 1000, 'unused')
    assert.ok(result.ok)
    assert.equal(result.value[0].createdAt, original.createdAt)
    assert.equal(result.value[0].updatedAt, new Date(now + 1000).toISOString())
    assert.deepEqual(result.value[0].servicePriceSnapshot, original.servicePriceSnapshot)
    assert.equal(report([{ ...result.value[0], status: 'completed', completedAt: at('2026-11-21') }], range(), [changedService]).estimatedValueMinor, 12345)
  }
})

test('changing service captures the replacement service price while preserving customer identity', () => {
  const original = record({ servicePriceSnapshot: { priceMinor: 12345, currency: 'TRY' } })
  const replacement = catalogue.catalogueServices[1]
  const result = management.applyAppointmentCommand({ type: 'edit', expected: original, request: { ...request(), serviceId: replacement.id, customer: { name: 'Tampered', phone: '+447700900123' } } }, [original], [service, replacement], settings(), now, 'unused')
  assert.ok(result.ok)
  assert.deepEqual(result.value[0].servicePriceSnapshot, { priceMinor: replacement.priceMinor, currency: 'TRY' })
  assert.deepEqual(result.value[0].customer, original.customer)
  assert.equal(result.value[0].createdAt, original.createdAt)
})

test('estimated value includes only completed services and prefers completion date and saved price', () => {
  const records = ['pending', 'confirmed', 'cancelled', 'completed'].map((status) => record({ id: status, status, completedAt: at('2026-11-19'), servicePriceSnapshot: { priceMinor: 12500, currency: 'TRY' } }))
  const result = report(records, range('2026-11-19', '2026-11-19'), [{ ...service, priceMinor: 99999 }])
  assert.equal(result.estimatedValueMinor, 12500); assert.equal(result.valuedCount, 1)
  assert.equal(result.scheduledFallbackCount, 0); assert.equal(result.currentPriceCount, 0)
  assert.equal(report(records, range('2026-11-20', '2026-11-20')).estimatedValueMinor, 0)
})

test('legacy history stays unchanged, has no invented event counts, and transparently falls back for estimated value', async () => withStorage(async (values) => {
  const old = [record({ id: 'old-completed', status: 'completed' }), record({ id: 'old-cancelled', status: 'cancelled' })]
  const raw = JSON.stringify({ version: 1, data: old })
  values.set(store.appointmentStore.key, raw)
  const loaded = store.appointmentStore.readResult()
  assert.ok(loaded.ok); assert.deepEqual(loaded.value, old)
  const result = report(loaded.value)
  assert.equal(result.completedEvents, 0); assert.equal(result.cancelledEvents, 0)
  assert.equal(result.unknownCompletionDates, 1); assert.equal(result.unknownCancellationDates, 1)
  assert.equal(result.scheduledFallbackCount, 1); assert.equal(result.currentPriceCount, 1)
  assert.equal(result.estimatedValueMinor, service.priceMinor)
  render('/admin/analytics')
  assert.equal(values.get(store.appointmentStore.key), raw)
  assert.equal(report(old, range('2026-10-01', '2026-10-31')).unknownCompletionDates, 1)
  assert.equal(report(old, range('2026-10-01', '2026-10-31')).estimatedValueMinor, 0)
}))

test('legacy approval/reschedule never fabricates a booked price or historical lifecycle events', () => {
  const original = record()
  for (const change of [{ type: 'status', expected: original, status: 'confirmed' }, { type: 'edit', expected: original, request: request('2026-11-21') }]) {
    const result = management.applyAppointmentCommand(change, [original], [service], settings(), now, 'unused')
    assert.ok(result.ok)
    assert.ok(!('servicePriceSnapshot' in result.value[0]))
    assert.ok(!('completedAt' in result.value[0]))
    assert.ok(!('cancelledAt' in result.value[0]))
    assert.equal(result.value[0].createdAt, original.createdAt)
  }
})

test('unknown prices are excluded without guessing; zero is a valid saved value', () => {
  const records = [
    record({ id: 'null', status: 'completed', servicePriceSnapshot: { priceMinor: null, currency: 'TRY' } }),
    record({ id: 'unknown-service', status: 'completed', serviceId: 'deleted-service' }),
    record({ id: 'zero', status: 'completed', servicePriceSnapshot: { priceMinor: 0, currency: 'TRY' } }),
  ]
  const result = report(records)
  assert.equal(result.estimatedValueMinor, 0); assert.equal(result.missingPriceCount, 2); assert.equal(result.valuedCount, 1)
  assert.equal(result.currentPriceCount, 0)
})

test('optional lifecycle and price fields validate safely while version 1 legacy records still load', () => {
  assert.ok(store.isAppointment(record()))
  assert.ok(store.isAppointment(record({ updatedAt: at('2026-11-18'), completedAt: at('2026-11-20'), servicePriceSnapshot: { priceMinor: 50000, currency: 'TRY' } })))
  for (const metadata of [{ completedAt: 'yesterday' }, { cancelledAt: null }, { updatedAt: '2026-11-18' }, { servicePriceSnapshot: null }, { servicePriceSnapshot: { priceMinor: -1, currency: 'TRY' } }, { servicePriceSnapshot: { priceMinor: 1.5, currency: 'TRY' } }, { servicePriceSnapshot: { priceMinor: 100, currency: 'EUR' } }]) assert.equal(store.isAppointment(record(metadata)), false)
})

test('cross-tab storage events refresh operational and analytics rendering, ignore other keys, and unsubscribe cleanly', async () => withStorage(async (values, events) => {
  let dashboard = render('/admin'), historical = render('/admin/analytics'), refreshes = 0
  const unsubscribe = store.subscribeToAppointmentChanges(() => { dashboard = render('/admin'); historical = render('/admin/analytics'); refreshes++ })
  function change(records, key = store.appointmentStore.key) {
    values.set(store.appointmentStore.key, JSON.stringify({ version: 1, data: records }))
    const event = new Event('storage'); Object.defineProperty(event, 'key', { value: key }); events.dispatchEvent(event)
  }
  assert.ok(dashboard.includes('No pending appointments.'))
  change([record({ customer: { name: 'Other Tab Customer', phone: '+905551234567' } })])
  assert.ok(dashboard.includes('Other Tab Customer')); assert.ok(!historical.includes('No reportable appointments'))
  assert.equal(cardValue(dashboard, dictionaries.translations.en.manager.pending), 1)
  assert.equal(cardValue(historical, dictionaries.translations.en.analytics.created), 1)
  change([record({ status: 'confirmed' })])
  assert.ok(dashboard.includes('No pending appointments.'))
  assert.equal(cardValue(dashboard, dictionaries.translations.en.manager.pending), 0)
  assert.equal(cardValue(dashboard, dictionaries.translations.en.manager.confirmed), 1)
  const count = refreshes
  change([], 'unrelated-key'); assert.equal(refreshes, count)
  change([], null); assert.equal(refreshes, count + 1)
  assert.ok(historical.includes('No reportable appointments'))
  events.dispatchEvent(new Event('focus')); assert.equal(refreshes, count + 2)
  events.dispatchEvent(new Event('sonia-nail-bar:prototype-updated')); assert.equal(refreshes, count + 3)
  unsubscribe(); change([record()]); events.dispatchEvent(new Event('focus')); events.dispatchEvent(new Event('sonia-nail-bar:prototype-updated'))
  assert.equal(refreshes, count + 3)
}))

for (const language of ['tr', 'en', 'ru']) test(`analytics route, sidebar, reporting controls, caveats and global pending queue support ${language}`, async () => withStorage(async () => {
  store.appointmentStore.write([record({ customer: { name: 'Future Queue Customer', phone: '+905551234567' } })])
  const t = dictionaries.translations[language]
  const html = render('/admin/analytics', language)
  for (const text of [t.analytics.title, t.analytics.period, t.analytics.created, t.analytics.scheduled, t.analytics.completedEvents, t.analytics.cancelledEvents, t.analytics.revenue, t.analytics.revenueNote, t.analytics.revenueBasis, t.analytics.priceBasis, t.analytics.historyNote, ...Object.values(t.analytics.periods)]) assert.ok(html.includes(escape(text)), text)
  for (const path of ['/admin', '/admin/analytics', '/admin/closures', '/admin/settings']) assert.ok(html.includes(`href="${path}"`))
  assert.match(html, /aria-current="page"[^>]*href="\/admin\/analytics"/)
  const dashboard = render('/admin', language)
  assert.ok(dashboard.includes(escape(t.manager.pendingTitle)))
  assert.ok(dashboard.includes('Future Queue Customer'))
  assert.ok(!dashboard.includes(escape(t.analytics.revenue)))
  const empty = renderToStaticMarkup(createElement(context.I18nContext.Provider, { value: { language, t, setLanguage() {} } }, createElement(queue.PendingAppointments, { appointments: [], settings: settings(), now, ready: true, onApprove() {}, onManage() {} })))
  assert.ok(empty.includes(escape(t.manager.pendingEmpty)))
}))

test('analytics hides computed totals on invalid storage instead of displaying false zeroes', async () => withStorage(async (values) => {
  values.set(store.appointmentStore.key, '{')
  const html = render('/admin/analytics')
  assert.ok(html.includes(escape(dictionaries.translations.en.analytics.unavailable)))
  assert.ok(!html.includes('analytics-value'))
}))
