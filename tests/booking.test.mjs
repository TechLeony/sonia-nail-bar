import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const [engine, time, store, demo, catalogue] = await Promise.all([
  server.ssrLoadModule('/src/lib/availability.ts'), server.ssrLoadModule('/src/lib/bookingTime.ts'),
  server.ssrLoadModule('/src/lib/appointmentStore.ts'), server.ssrLoadModule('/src/data/booking.ts'), server.ssrLoadModule('/src/data/services.ts'),
])
const now = Date.parse('2026-11-16T06:00:00Z') // 09:00 Istanbul, Monday
const service = { ...catalogue.catalogueServices[0], durationMinutes: 60 }
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const hours = (ranges = [{ opensAt: '10:00', closesAt: '18:00' }]) => ({ timeZone: 'Europe/Istanbul', days: Object.fromEntries(days.map((day) => [day, structuredClone(ranges)])) })
function settings() {
  const value = structuredClone(demo.bookingSettings)
  value.salonHours = hours()
  value.specialists[0].workingHours = hours()
  value.appointmentIntervalMinutes = 15
  return value
}
const instant = (date, clock) => new Date(time.localInstants(date, clock, 'Europe/Istanbul')[0]).toISOString()
const starts = (slots) => slots.map((slot) => time.zonedParts(Date.parse(slot.startsAt), 'Europe/Istanbul').time)
const appointment = (clock = '11:00', end = '12:00', status = 'confirmed', specialistId = 'demo-specialist-a') => ({
  id: 'existing-booking', serviceId: service.id, specialistId, startsAt: instant('2026-11-16', clock), endsAt: instant('2026-11-16', end),
  customer: { name: 'Demo Customer', phone: '+905551234567' }, status, confirmationMode: 'automatic', createdAt: new Date(now).toISOString(), illustrative: true,
})
function slots(options = {}) {
  return engine.availableSlots({ date: '2026-11-16', service, specialistId: 'demo-specialist-a', settings: settings(), appointments: [], now, ...options })
}
const request = (clock = '10:00') => ({ serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: instant('2026-11-16', clock), customer: { name: ' Demo Customer ', phone: '+90 555 123 45 67' } })

for (const status of ['pending', 'confirmed']) {
  test(`${status} bookings block equal, partial, enveloping and contained overlaps, but allow adjacency`, () => {
    const times = starts(slots({ appointments: [appointment('11:00', '12:00', status)] }))
    assert.ok(times.includes('10:00')) // ends at occupied start
    assert.ok(times.includes('12:00')) // begins at occupied end
    for (const blocked of ['10:15', '10:30', '10:45', '11:00', '11:15', '11:45']) assert.ok(!times.includes(blocked))
    assert.ok(!starts(slots({ service: { ...service, durationMinutes: 120 }, appointments: [appointment('10:30', '11:00', status)] })).includes('10:00'))
    assert.ok(!starts(slots({ service: { ...service, durationMinutes: 15 }, appointments: [appointment('10:00', '12:00', status)] })).includes('11:00'))
  })
}
test('cancelled/completed reservations release slots; other specialists do not block', () => {
  for (const existing of [appointment('11:00', '12:00', 'cancelled'), appointment('11:00', '12:00', 'completed'), appointment('11:00', '12:00', 'confirmed', 'demo-specialist-b')]) {
    assert.ok(starts(slots({ appointments: [existing] })).includes('11:00'))
  }
})
test('intersects salon and specialist hours, respects breaks and fits full duration', () => {
  const value = settings()
  value.specialists[0].workingHours = hours([{ opensAt: '11:00', closesAt: '13:00' }, { opensAt: '14:00', closesAt: '16:00' }])
  const times = starts(slots({ settings: value }))
  assert.equal(times[0], '11:00')
  assert.equal(times.at(-1), '15:00')
  assert.ok(times.includes('12:00'))
  assert.ok(!times.includes('12:15'))
  assert.ok(!times.includes('13:00'))
})
test('closed and unconfirmed hours, missing schedules and ineligible staff fail closed', () => {
  for (const mutation of [
    (value) => { value.salonHours.days.monday = [] },
    (value) => { value.salonHours.days.monday = null },
    (value) => { value.specialists[0].workingHours = undefined },
    (value) => { value.specialists[0].serviceIds = [] },
    (value) => { value.specialists[0].active = false },
    (value) => { value.salonHours.days.monday = [{ opensAt: '25:00', closesAt: '19:00' }] },
  ]) {
    const value = settings(); mutation(value); assert.deepEqual(slots({ settings: value }), [])
  }
})
test('closure date ranges are inclusive and malformed ranges fail closed', () => {
  const value = settings()
  value.closures = [{ id: 'demo-closure', startDate: '2026-11-15', endDate: '2026-11-16', reason: { tr: 'Örnek', en: 'Demo', ru: 'Демо' }, illustrative: true }]
  assert.deepEqual(slots({ settings: value }), [])
  assert.ok(slots({ settings: value, date: '2026-11-17' }).length)
  value.closures[0].startDate = 'invalid'
  assert.deepEqual(slots({ settings: value }), [])
})
test('overnight schedules include previous-day carryover; closures block spillover, with exclusive ends', () => {
  const value = settings()
  value.salonHours = hours([{ opensAt: '22:00', closesAt: '02:00' }])
  value.specialists[0].workingHours = structuredClone(value.salonHours)
  const results = slots({ settings: value, service: { ...service, durationMinutes: 90 } })
  assert.ok(starts(results).includes('23:30'))
  assert.ok(starts(slots({ settings: value, date: '2026-11-17', service: { ...service, durationMinutes: 90 } })).includes('00:30')) // previous day's overnight range
  value.closures = [{ id: 'closure', startDate: '2026-11-17', endDate: '2026-11-17', reason: { tr: '', en: '', ru: '' }, illustrative: true }]
  const times = starts(slots({ settings: value, service: { ...service, durationMinutes: 90 } }))
  assert.ok(times.includes('22:30')) // ends exactly at midnight, before closed day
  assert.ok(!times.includes('22:45'))
  assert.ok(!times.includes('23:30'))
})
test('today is calculated in Istanbul, and exactly seven local start dates are allowed', () => {
  const edgeNow = Date.parse('2026-11-15T22:30:00Z') // already Nov 16 in Istanbul
  assert.deepEqual(time.bookingDates(edgeNow, 'Europe/Istanbul'), ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
  assert.deepEqual(slots({ now: edgeNow, date: '2026-11-15' }), [])
  assert.ok(slots({ now: edgeNow, date: '2026-11-22' }).length)
  assert.deepEqual(slots({ now: edgeNow, date: '2026-11-23' }), [])
  assert.deepEqual(slots({ date: '2026-02-30' }), [])
  assert.deepEqual(slots({ date: 'not-a-date' }), [])
})
test('past/current starts are excluded and intervals are configurable', () => {
  assert.equal(starts(slots({ now: Date.parse(instant('2026-11-16', '10:00')) }))[0], '10:15')
  const value = settings(); value.appointmentIntervalMinutes = 30
  assert.deepEqual(starts(slots({ settings: value })).slice(0, 3), ['10:00', '10:30', '11:00'])
  value.appointmentIntervalMinutes = 0
  assert.deepEqual(slots({ settings: value }), [])
})
test('Istanbul historical DST gaps/folds use timezone rules and elapsed service duration', () => {
  assert.equal(time.localInstants('2015-03-29', '03:30', 'Europe/Istanbul').length, 0)
  assert.equal(time.localInstants('2015-11-08', '03:30', 'Europe/Istanbul').length, 2)
  const value = settings()
  value.salonHours = hours([{ opensAt: '00:00', closesAt: '06:00' }])
  value.specialists[0].workingHours = structuredClone(value.salonHours)
  const spring = slots({ settings: value, date: '2015-03-29', now: Date.parse('2015-03-28T00:00:00Z') })
  assert.ok(!starts(spring).includes('03:30'))
  const crossing = spring.find((slot) => time.zonedParts(Date.parse(slot.startsAt), value.timeZone).time === '02:30')
  assert.equal(time.zonedParts(Date.parse(crossing.endsAt), value.timeZone).time, '04:30')
  assert.equal(Date.parse(crossing.endsAt) - Date.parse(crossing.startsAt), 60 * 60_000)
  const fall = slots({ settings: value, date: '2015-11-08', now: Date.parse('2015-11-07T00:00:00Z') })
  const repeated = fall.filter((slot) => time.zonedParts(Date.parse(slot.startsAt), value.timeZone).time === '03:30')
  assert.equal(repeated.length, 2)
  assert.notEqual(time.formatBookingTime(repeated[0].startsAt, 'en', value.timeZone), time.formatBookingTime(repeated[1].startsAt, 'en', value.timeZone))
})
test('submission revalidates overlaps, past starts, closures, duration, and window', () => {
  assert.equal(engine.prepareAppointment(request(), [service], settings(), [appointment('10:00', '11:00', 'pending')], now, 'new-id').ok, false)
  assert.equal(engine.prepareAppointment(request(), [service], settings(), [], Date.parse(instant('2026-11-16', '10:01')), 'new-id').ok, false)
  assert.equal(engine.prepareAppointment(request(), [{ ...service, durationMinutes: null }], settings(), [], now, 'new-id').ok, false)
  assert.equal(engine.prepareAppointment({ ...request(), startsAt: '2026-11-16T10:00:00' }, [service], settings(), [], now, 'new-id').ok, false)
  const value = settings(); value.closures = [{ id: 'x', startDate: '2026-11-16', endDate: '2026-11-16', reason: { tr: '', en: '', ru: '' }, illustrative: true }]
  assert.equal(engine.prepareAppointment(request(), [service], value, [], now, 'new-id').ok, false)
  assert.equal(engine.prepareAppointment({ ...request(), startsAt: instant('2026-11-23', '10:00') }, [service], settings(), [], now, 'new-id').ok, false)
})
test('confirmation modes produce stable explicit timestamps and pending/confirmed statuses', () => {
  for (const mode of ['manual', 'automatic']) {
    const value = settings(); value.confirmationMode = mode
    const result = engine.prepareAppointment(request(), [service], value, [], now, 'stable-demo-id')
    assert.ok(result.ok)
    assert.equal(result.appointment.id, 'stable-demo-id')
    assert.equal(result.appointment.status, mode === 'manual' ? 'pending' : 'confirmed')
    assert.equal(result.appointment.customer.name, 'Demo Customer')
    assert.ok(result.appointment.startsAt.endsWith('Z'))
    assert.equal(Date.parse(result.appointment.endsAt) - Date.parse(result.appointment.startsAt), 3_600_000)
    assert.ok(store.isAppointment(result.appointment))
  }
})
test('invalid customer input, durations, and duplicate IDs are rejected', () => {
  for (const customer of [{ name: ' ', phone: '+905551234567' }, { name: 'Demo', phone: 'abc12345' }, { name: 'Demo', phone: '123' }, { name: 'x'.repeat(81), phone: '+905551234567' }]) {
    assert.equal(engine.prepareAppointment({ ...request(), customer }, [service], settings(), [], now, 'id').ok, false)
  }
  for (const durationMinutes of [null, 0, -5, 1.5, NaN, Infinity]) assert.deepEqual(slots({ service: { ...service, durationMinutes } }), [])
  assert.equal(engine.prepareAppointment(request(), [service], settings(), [appointment()], now, 'existing-booking').ok, false)
  assert.ok(!store.isAppointmentList([appointment(), appointment()]))
  assert.ok(!store.isAppointment({ ...appointment(), endsAt: 'garbage' }))
})

function mockStorage() {
  const values = new Map()
  globalThis.window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) } }
  return values
}
test('versioned booking persistence rereads latest reservations and fails closed on corrupt/blocked stores', async () => {
  const originalNow = Date.now
  Date.now = () => now
  try {
    const values = mockStorage()
    const result = await store.submitPrototypeBooking(request(), [service], settings())
    assert.ok(result.ok)
    assert.ok(result.appointment.id)
    assert.equal(store.appointmentStore.read([]).length, 1)
    assert.equal(JSON.parse(values.get(store.appointmentStore.key)).version, 1)
    assert.equal((await store.submitPrototypeBooking(request(), [service], settings())).ok, false)
    const records = store.appointmentStore.read([])
    records[0].status = 'cancelled'
    assert.ok(store.appointmentStore.write(records))
    assert.ok((await store.submitPrototypeBooking(request(), [service], settings())).ok)
    for (const raw of ['{', '{"version":99,"data":[]}', '{"version":1,"data":[{}]}']) {
      values.set(store.appointmentStore.key, raw)
      const rejected = await store.submitPrototypeBooking(request(), [service], settings())
      assert.deepEqual(rejected, { ok: false, error: 'storage' })
      assert.equal(values.get(store.appointmentStore.key), raw) // never overwrite corrupt data
    }
    globalThis.window.localStorage.setItem = () => { throw new Error('quota') }
    globalThis.window.localStorage.getItem = () => null
    assert.deepEqual(await store.submitPrototypeBooking(request(), [service], settings()), { ok: false, error: 'storage' })
  } finally { Date.now = originalNow; delete globalThis.window }
})


test('cooperating tabs submit under the same Web Lock and only one overlapping request succeeds', async () => {
  const originalNow = Date.now
  const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks')
  Date.now = () => now
  mockStorage()
  let queue = Promise.resolve()
  const lockNames = []
  Object.defineProperty(navigator, 'locks', { configurable: true, value: {
    request(name, commit) {
      lockNames.push(name)
      const result = queue.then(commit)
      queue = result.then(() => {})
      return result
    },
  } })
  try {
    const results = await Promise.all([
      store.submitPrototypeBooking(request(), [service], settings()),
      store.submitPrototypeBooking(request(), [service], settings()),
    ])
    assert.equal(results.filter((result) => result.ok).length, 1)
    assert.equal(results.filter((result) => !result.ok && result.error === 'unavailable').length, 1)
    assert.deepEqual(lockNames, ['sonia-nail-bar:prototype:appointments', 'sonia-nail-bar:prototype:appointments'])
    assert.equal(store.appointmentStore.read([]).length, 1)
  } finally {
    Date.now = originalNow
    delete globalThis.window
    if (originalLocks) Object.defineProperty(navigator, 'locks', originalLocks)
    else delete navigator.locks
  }
})

test('success summaries distinguish pending from confirmed in TR/EN/RU', async () => {
  const [view, i18n, translations] = await Promise.all([
    server.ssrLoadModule('/src/components/BookingSuccess.tsx'),
    server.ssrLoadModule('/src/i18n/context.ts'),
    server.ssrLoadModule('/src/i18n/translations.ts'),
  ])
  const escapeText = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;')
  for (const language of ['tr', 'en', 'ru']) for (const mode of ['manual', 'automatic']) {
    const value = settings(); value.confirmationMode = mode
    const result = engine.prepareAppointment(request(), [service], value, [], now, 'success-demo-id')
    assert.ok(result.ok)
    const t = translations.translations[language]
    const html = renderToStaticMarkup(createElement(i18n.I18nContext.Provider, {
      value: { language, t, setLanguage() {} },
    }, createElement(MemoryRouter, null, createElement(view.BookingSuccess, { appointment: result.appointment, service, specialist: value.specialists[0], onRestart() {} }))))
    const confirmed = mode === 'automatic'
    assert.ok(html.includes(escapeText(confirmed ? t.booking.confirmedTitle : t.booking.pendingTitle)))
    assert.ok(html.includes(escapeText(confirmed ? t.booking.confirmedNote : t.booking.pendingNote)))
    assert.ok(html.includes(escapeText(confirmed ? t.booking.confirmed : t.booking.pending)))
    assert.ok(html.includes(service.name[language]))
    assert.ok(html.includes(value.specialists[0].name[language]))
    assert.ok(html.includes('success-demo-id'))
    assert.ok(!html.includes('Demo Customer')) // Customer details need not be echoed.
  }
})
