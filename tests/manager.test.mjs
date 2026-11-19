import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const [management, transactions, appointments, settingsStore, time, config, catalogue, app, context, dictionaries, recordView, closureForm] = await Promise.all([
  server.ssrLoadModule('/src/lib/management.ts'), server.ssrLoadModule('/src/lib/managerStore.ts'),
  server.ssrLoadModule('/src/lib/appointmentStore.ts'), server.ssrLoadModule('/src/lib/salonSettingsStore.ts'),
  server.ssrLoadModule('/src/lib/bookingTime.ts'),
  server.ssrLoadModule('/src/data/booking.ts'), server.ssrLoadModule('/src/data/services.ts'),
  server.ssrLoadModule('/src/App.tsx'), server.ssrLoadModule('/src/i18n/context.ts'), server.ssrLoadModule('/src/i18n/translations.ts'),
  server.ssrLoadModule('/src/components/manager/AppointmentDetails.tsx'), server.ssrLoadModule('/src/components/manager/ClosureEditor.tsx'),
])
const now = Date.parse('2026-11-16T06:00:00Z') // Monday 09:00 Istanbul
const service = { ...catalogue.catalogueServices[0], durationMinutes: 60 }
const date = '2026-11-16'
const at = (clock, day = date) => new Date(time.localInstants(day, clock, 'Europe/Istanbul')[0]).toISOString()
const settings = () => structuredClone(config.bookingSettings)
const request = (clock = '10:00', specialistId = 'demo-specialist-a') => ({ serviceId: service.id, specialistId, startsAt: at(clock), customer: { name: 'Demo Customer', phone: '+90 555 123 45 67' } })
const booking = (clock = '10:00', status = 'pending', id = 'original') => ({
  id, serviceId: service.id, specialistId: 'demo-specialist-a', startsAt: at(clock), endsAt: new Date(Date.parse(at(clock)) + 60 * 60_000).toISOString(),
  customer: { name: 'Demo Customer', phone: '+90 555 123 45 67' }, status, confirmationMode: 'manual', createdAt: new Date(now - 60_000).toISOString(), illustrative: true,
})
const closure = (id = 'closure-one', startDate = date, endDate = date) => ({ id, startDate, endDate, reason: { tr: 'Örnek kapanış', en: 'Demo closure', ru: 'Демо-закрытие' }, illustrative: true })
const apply = (command, records, value = settings(), clock = now) => management.applyAppointmentCommand(command, records, [service], value, clock, 'new-id')
function mockStorage() {
  const values = new Map()
  const events = []
  globalThis.window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }, dispatchEvent: (event) => { events.push(event.type); return true } }
  return { values, events }
}
async function inDemo(run) {
  const originalNow = Date.now
  Date.now = () => now
  const storage = mockStorage()
  try { await run(storage) } finally { Date.now = originalNow; delete globalThis.window }
}
const command = (change, base = settings()) => transactions.executeManagerCommand(change, [service], base)
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;')
function localized(language, element) {
  return createElement(context.I18nContext.Provider, { value: { language, t: dictionaries.translations[language], setLanguage() {} } }, createElement(MemoryRouter, null, element))
}

test('manager creates confirmed or pending appointments using the customer availability engine', () => {
  for (const status of ['confirmed', 'pending']) {
    const result = apply({ type: 'create', request: request(), status }, [])
    assert.ok(result.ok)
    assert.equal(result.value[0].status, status)
    assert.equal(result.value[0].id, 'new-id')
    assert.equal(Date.parse(result.value[0].endsAt) - Date.parse(result.value[0].startsAt), 60 * 60_000)
    assert.deepEqual(management.applyAppointmentCommand({ type: 'create', request: request(), status }, result.value, [service], settings(), now, 'second-id'), { ok: false, error: 'unavailable' })
  }
})
test('approval excludes itself and preserves ID, start/end, creation time and other records', () => {
  const original = booking()
  const adjacent = booking('11:00', 'confirmed', 'adjacent')
  const result = apply({ type: 'status', expected: original, status: 'confirmed' }, [original, adjacent])
  assert.ok(result.ok)
  assert.deepEqual(result.value[0], { ...original, status: 'confirmed', updatedAt: new Date(now).toISOString() })
  assert.deepEqual(result.value[1], adjacent)
  assert.equal(original.status, 'pending') // pure operation, no mutation
})
test('approval retains booked duration after catalogue duration changes', () => {
  const original = booking()
  const adjacent = booking('11:00', 'confirmed', 'adjacent')
  const result = management.applyAppointmentCommand({ type: 'status', expected: original, status: 'confirmed' }, [original, adjacent], [{ ...service, durationMinutes: 90 }], settings(), now, 'new-id')
  assert.ok(result.ok)
  assert.equal(result.value[0].endsAt, original.endsAt)
})
test('approval rejects conflicts, closures and starts in the past', () => {
  const original = booking()
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'confirmed' }, [original, booking('10:30', 'confirmed', 'conflict')]), { ok: false, error: 'unavailable' })
  const value = settings(); value.closures = [closure()]
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'confirmed' }, [original], value), { ok: false, error: 'unavailable' })
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'confirmed' }, [original], settings(), Date.parse(at('10:01'))), { ok: false, error: 'unavailable' })
})
test('rescheduling and specialist changes validate new slots, preserve status and exclude own reservation', () => {
  for (const status of ['pending', 'confirmed']) {
    const original = booking('12:00', status)
    const unchanged = apply({ type: 'edit', expected: original, request: request('12:00') }, [original])
    assert.ok(unchanged.ok)
    assert.equal(unchanged.value[0].id, original.id)
    const moved = apply({ type: 'edit', expected: original, request: request('13:00', 'demo-specialist-b') }, [original])
    assert.ok(moved.ok)
    assert.equal(moved.value[0].specialistId, 'demo-specialist-b')
    assert.equal(moved.value[0].status, status)
    assert.equal(moved.value[0].createdAt, original.createdAt)
    const conflict = { ...booking('13:30', 'pending', 'conflict'), specialistId: 'demo-specialist-b' }
    assert.deepEqual(apply({ type: 'edit', expected: original, request: request('13:00', 'demo-specialist-b') }, [original, conflict]), { ok: false, error: 'unavailable' })
    assert.deepEqual(apply({ type: 'edit', expected: original, request: request('11:00', 'demo-specialist-b') }, [original]), { ok: false, error: 'unavailable' })
  }
})
test('cancellation releases slots; closure flagging never cancels records', () => {
  const original = booking()
  const result = apply({ type: 'status', expected: original, status: 'cancelled' }, [original])
  assert.ok(result.ok)
  assert.equal(result.value[0].status, 'cancelled')
  assert.ok(apply({ type: 'create', request: request(), status: 'confirmed' }, result.value).ok)
  assert.equal(management.affectedAppointments(result.value, [closure()], 'Europe/Istanbul').length, 0)
})
test('only ended confirmed appointments can complete; cancelled/completed are terminal', () => {
  const original = booking('10:00', 'confirmed')
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'completed' }, [original]), { ok: false, error: 'tooEarly' })
  const ended = apply({ type: 'status', expected: original, status: 'completed' }, [original], settings(), Date.parse(original.endsAt))
  assert.ok(ended.ok)
  assert.equal(ended.value[0].status, 'completed')
  const pending = booking()
  assert.deepEqual(apply({ type: 'status', expected: pending, status: 'completed' }, [pending], settings(), Date.parse(pending.endsAt)), { ok: false, error: 'transition' })
  for (const status of ['cancelled', 'completed']) {
    const terminal = booking('10:00', status)
    assert.deepEqual(apply({ type: 'status', expected: terminal, status: 'confirmed' }, [terminal]), { ok: false, error: 'transition' })
    assert.deepEqual(apply({ type: 'edit', expected: terminal, request: request('12:00') }, [terminal]), { ok: false, error: 'transition' })
  }
})
test('stale or missing appointment snapshots cannot overwrite newer data', () => {
  const original = booking()
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'cancelled' }, []), { ok: false, error: 'notFound' })
  const changed = { ...original, customer: { ...original.customer, name: 'Updated Demo' } }
  assert.deepEqual(apply({ type: 'status', expected: original, status: 'cancelled' }, [changed]), { ok: false, error: 'stale' })
})
test('closure notifications deduplicate active bookings, include overnight overlap, and respect exclusive midnight', () => {
  const overnight = { ...booking(), startsAt: at('23:00', '2026-11-15'), endsAt: at('01:00') }
  const midnightEnd = { ...booking(), id: 'midnight', startsAt: at('23:00', '2026-11-15'), endsAt: at('00:00') }
  const records = [overnight, midnightEnd, booking('10:00', 'cancelled', 'cancelled'), booking('11:00', 'completed', 'completed')]
  const affected = management.affectedAppointments(records, [closure(), closure('closure-two')], 'Europe/Istanbul')
  assert.equal(affected.length, 1)
  assert.equal(affected[0].appointment.customer.phone, overnight.customer.phone)
  assert.deepEqual(affected[0].closureIds, ['closure-one', 'closure-two'])
  assert.equal(overnight.status, 'pending')
})
test('dashboard today total uses local start dates; calendar and list filters are chronological and overnight-aware', () => {
  const records = [booking('13:00', 'confirmed', 'third'), booking('11:00', 'completed', 'second'), booking('10:00', 'pending', 'first'), booking('12:00', 'cancelled', 'cancelled')]
  assert.deepEqual(management.dashboardMetrics(records, now, 'Europe/Istanbul'), { total: 3, pending: 1, confirmed: 1, completed: 1 })
  const week = management.calendarDates('2026-11-18', 'week')
  assert.equal(week[0], date); assert.equal(week.at(-1), '2026-11-22')
  assert.equal(management.filterAppointments(records, [date], 'pending', '', 'Europe/Istanbul').length, 1)
  assert.deepEqual(management.filterAppointments(records, [date], 'all', '', 'Europe/Istanbul').map((entry) => entry.id), ['first', 'second', 'cancelled', 'third'])
  assert.equal(management.filterAppointments(records, [date], 'all', 'unknown', 'Europe/Istanbul').length, 0)
  const overnight = { ...booking(), startsAt: at('23:30', '2026-11-15'), endsAt: at('00:30') }
  assert.ok(management.appointmentTouchesDates(overnight, date, date, 'Europe/Istanbul'))
  assert.equal(management.dashboardMetrics([overnight], now, 'Europe/Istanbul').total, 0)
})
test('WhatsApp links require explicit international numbers and never guess country codes', () => {
  assert.equal(management.customerWhatsAppHref('+90 (555) 123-45-67'), 'https://wa.me/905551234567')
  assert.equal(management.customerWhatsAppHref('0090 555 1234567'), 'https://wa.me/905551234567')
  for (const phone of ['05551234567', '5551234567', '+0 123456789', '+123', 'javascript:alert(1)', '+90555abc1234567']) assert.equal(management.customerWhatsAppHref(phone), null)
})

test('persisted settings immediately govern customer submissions and do not rewrite existing appointments', async () => inDemo(async ({ events }) => {
  const base = settings()
  const first = await appointments.submitPrototypeBooking(request(), [service], base)
  assert.ok(first.ok); assert.equal(first.appointment.status, 'pending')
  assert.ok((await command({ kind: 'mode', mode: 'automatic' }, base)).ok)
  const second = await appointments.submitPrototypeBooking(request('11:00'), [service], base)
  assert.ok(second.ok); assert.equal(second.appointment.status, 'confirmed')
  assert.equal(appointments.appointmentStore.read([])[0].status, 'pending')
  assert.equal(settingsStore.readBookingSettings(base).settings.confirmationMode, 'automatic')
  assert.ok(events.every((name) => name === 'sonia-nail-bar:prototype-updated'))
  assert.equal(events.length, 3)
}))
test('closure CRUD preserves appointments, updates availability and reconstructs persistent follow-up flags', async () => inDemo(async () => {
  assert.ok((await command({ kind: 'appointment', command: { type: 'create', request: request(), status: 'confirmed' } })).ok)
  const before = JSON.stringify(appointments.appointmentStore.read([]))
  const first = closure()
  assert.ok((await command({ kind: 'closure', closure: first })).ok)
  assert.equal(JSON.stringify(appointments.appointmentStore.read([])), before)
  const loaded = settingsStore.readBookingSettings(settings()).settings
  assert.equal(management.affectedAppointments(appointments.appointmentStore.read([]), loaded.closures, loaded.timeZone).length, 1)
  assert.equal((await appointments.submitPrototypeBooking(request('12:00'), [service], settings())).ok, false)
  const edited = { ...first, startDate: '2026-11-17', endDate: '2026-11-17' }
  assert.ok((await command({ kind: 'closure', closure: edited, expected: first })).ok)
  assert.equal(management.affectedAppointments(appointments.appointmentStore.read([]), settingsStore.readBookingSettings(settings()).settings.closures, loaded.timeZone).length, 0)
  assert.ok((await appointments.submitPrototypeBooking(request('12:00'), [service], settings())).ok)
  assert.deepEqual(await command({ kind: 'removeClosure', expected: first }), { ok: false, error: 'stale' })
  assert.ok((await command({ kind: 'removeClosure', expected: edited })).ok)
  assert.deepEqual(settingsStore.readBookingSettings(settings()).settings.closures, [])
}))
test('invalid closure edits and stale snapshots do not overwrite stored settings', async () => inDemo(async () => {
  const first = closure()
  assert.ok((await command({ kind: 'closure', closure: first })).ok)
  const changed = { ...first, reason: { ...first.reason, en: 'Updated demo closure' } }
  assert.ok((await command({ kind: 'closure', closure: changed, expected: first })).ok)
  assert.deepEqual(await command({ kind: 'closure', closure: first, expected: first }), { ok: false, error: 'stale' })
  const invalid = { ...first, id: 'invalid', startDate: '2026-02-30' }
  assert.deepEqual(await command({ kind: 'closure', closure: invalid }), { ok: false, error: 'closure' })
  assert.equal(settingsStore.readBookingSettings(settings()).settings.closures[0].reason.en, changed.reason.en)
  assert.ok((await command({ kind: 'mode', mode: 'automatic' })).ok)
  assert.equal(settingsStore.readBookingSettings(settings()).settings.closures.length, 1)
}))
test('manager and customer mutations share records and revalidate latest data at commit', async () => inDemo(async () => {
  const result = await appointments.submitPrototypeBooking(request(), [service], settings())
  assert.ok(result.ok)
  assert.ok((await command({ kind: 'appointment', command: { type: 'status', expected: result.appointment, status: 'confirmed' } })).ok)
  const current = appointments.appointmentStore.read([])[0]
  assert.equal(current.status, 'confirmed')
  assert.deepEqual(await command({ kind: 'appointment', command: { type: 'status', expected: result.appointment, status: 'cancelled' } }), { ok: false, error: 'stale' })
  assert.ok((await command({ kind: 'appointment', command: { type: 'status', expected: current, status: 'cancelled' } })).ok)
  assert.ok((await appointments.submitPrototypeBooking(request(), [service], settings())).ok)
}))
test('malformed or unsupported preferences fail closed for admin and customer, with no destructive reset', async () => inDemo(async ({ values }) => {
  for (const raw of ['{', '{"version":99,"data":{}}', '{"version":1,"data":{"confirmationMode":"automatic","closures":[{}]}}']) {
    values.set(settingsStore.salonPreferencesStore.key, raw)
    assert.deepEqual(await command({ kind: 'mode', mode: 'manual' }), { ok: false, error: 'storage' })
    assert.deepEqual(await appointments.submitPrototypeBooking(request(), [service], settings()), { ok: false, error: 'storage' })
    assert.equal(values.get(settingsStore.salonPreferencesStore.key), raw)
  }
}))

for (const language of ['tr', 'en', 'ru']) test(`admin routes render translated demo labels, navigation, metrics and affected contacts in ${language}`, async () => inDemo(async () => {
  const original = booking()
  appointments.appointmentStore.write([original])
  settingsStore.salonPreferencesStore.write({ confirmationMode: 'manual', closures: [closure()] })
  const t = dictionaries.translations[language]
  for (const [path, title] of [['/admin', t.manager.title], ['/admin/closures', t.manager.closureTitle], ['/admin/settings', t.manager.settingsTitle]]) {
    const html = renderToStaticMarkup(createElement(context.I18nContext.Provider, { value: { language, t, setLanguage() {} } }, createElement(MemoryRouter, { initialEntries: [path] }, createElement(app.AppRoutes))))
    assert.ok(html.includes(escape(title)))
    assert.ok(html.includes(escape(t.manager.demo)))
    assert.ok(html.includes(escape(t.manager.notice)))
    for (const link of ['/admin', '/admin/closures', '/admin/settings']) assert.ok(html.includes(`href="${link}"`))
    if (path !== '/admin/settings') {
      assert.ok(html.includes(original.customer.name)); assert.ok(html.includes(original.customer.phone))
      assert.ok(html.includes(escape(t.manager.followUp)))
    }
  }
  const details = renderToStaticMarkup(localized(language, createElement(recordView.AppointmentDetails, { appointment: original, settings: settings() })))
  assert.ok(details.includes('https://wa.me/905551234567'))
  assert.ok(details.includes(escape(t.manager.copy)))
  assert.ok(details.includes(escape(t.manager.statuses.pending)))
  const editor = renderToStaticMarkup(localized(language, createElement(closureForm.ClosureEditor, { settings: settings(), appointments: [original], onClose() {}, onSaved() {} })))
  assert.ok(editor.includes('<dialog'))
  assert.ok(editor.includes('aria-labelledby='))
}))

test('manager and customer use one cross-tab lock so concurrent overlapping creates cannot both succeed', async () => inDemo(async () => {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'locks')
  let queue = Promise.resolve()
  const names = []
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request(name, operation) {
    names.push(name)
    const result = queue.then(operation)
    queue = result.then(() => {})
    return result
  } } })
  try {
    const results = await Promise.all([
      command({ kind: 'appointment', command: { type: 'create', request: request(), status: 'confirmed' } }),
      appointments.submitPrototypeBooking(request(), [service], settings()),
    ])
    assert.equal(results.filter((result) => result.ok).length, 1)
    assert.equal(appointments.appointmentStore.read([]).length, 1)
    assert.deepEqual(names, ['sonia-nail-bar:prototype:appointments', 'sonia-nail-bar:prototype:appointments'])
  } finally {
    if (descriptor) Object.defineProperty(navigator, 'locks', descriptor)
    else delete navigator.locks
  }
}))

test('failed settings or appointment writes report errors and preserve the last saved state', async () => inDemo(async () => {
  const before = booking()
  appointments.appointmentStore.write([before])
  window.localStorage.setItem = () => { throw new Error('Quota exceeded') }
  assert.deepEqual(await command({ kind: 'appointment', command: { type: 'status', expected: before, status: 'cancelled' } }), { ok: false, error: 'storage' })
  assert.equal(appointments.appointmentStore.read([])[0].status, 'pending')
  assert.deepEqual(await command({ kind: 'mode', mode: 'automatic' }), { ok: false, error: 'storage' })
  assert.equal(settingsStore.readBookingSettings(settings()).settings.confirmationMode, 'manual')
}))

test('existing appointment edits ignore supplied customer identity, including invalid input, for every status', () => {
  const replacements = [
    { name: 'Different Demo', phone: '+44 7700 900123' },
    { name: '', phone: 'invalid' },
    null, undefined,
  ]
  for (const status of ['pending', 'confirmed', 'completed', 'cancelled']) {
    for (const customer of replacements) {
      const original = { ...booking('10:00', status), customer: { name: ' Original Demo ', phone: '+90 (555) 123-45-67', email: 'original@example.test' } }
      const before = structuredClone(original)
      const result = apply({ type: 'edit', expected: original, request: { ...request('12:00', 'demo-specialist-b'), customer } }, [original])
      if (status === 'pending' || status === 'confirmed') {
        assert.ok(result.ok)
        assert.deepEqual(result.value[0].customer, before.customer)
        assert.equal(result.value[0].startsAt, at('12:00'))
        assert.equal(result.value[0].specialistId, 'demo-specialist-b')
        assert.equal(result.value[0].status, status)
      } else assert.deepEqual(result, { ok: false, error: 'transition' })
      assert.deepEqual(original, before)
    }
  }
})

test('lifecycle transitions preserve identity and forged expected identities fail stale-edit checks', () => {
  for (const [status, target] of [['pending', 'confirmed'], ['pending', 'cancelled'], ['confirmed', 'cancelled'], ['confirmed', 'completed']]) {
    const original = booking('10:00', status)
    const result = apply({ type: 'status', expected: original, status: target, customer: { name: 'Changed Demo', phone: '+447700900123' } }, [original], settings(), target === 'completed' ? Date.parse(original.endsAt) : now)
    assert.ok(result.ok)
    assert.deepEqual(result.value[0].customer, original.customer)
  }
  for (const status of ['pending', 'confirmed', 'completed', 'cancelled']) {
    const original = booking('10:00', status)
    const forged = { ...original, customer: { name: 'Changed Demo', phone: '+447700900123' } }
    assert.deepEqual(apply({ type: 'edit', expected: forged, request: request('12:00') }, [original]), { ok: false, error: 'stale' })
  }
})

test('persisted appointment updates preserve original identity across all statuses', async () => inDemo(async () => {
  for (const status of ['pending', 'confirmed', 'completed', 'cancelled']) {
    const original = booking('10:00', status)
    assert.ok(appointments.appointmentStore.write([original]))
    const result = await command({ kind: 'appointment', command: { type: 'edit', expected: original, request: { ...request('12:00'), customer: { name: 'Different Demo', phone: '+447700900123' } } } })
    assert.equal(result.ok, status === 'pending' || status === 'confirmed')
    const saved = appointments.appointmentStore.read([])[0]
    assert.deepEqual(saved.customer, original.customer)
    if (!result.ok) assert.deepEqual(saved, original)
  }
}))

test('manual creation still accepts and persists supplied customer details', async () => inDemo(async () => {
  for (const status of ['pending', 'confirmed']) {
    appointments.appointmentStore.write([])
    const customer = { name: `New Demo ${status}`, phone: '+44 7700 900123' }
    const result = await command({ kind: 'appointment', command: { type: 'create', request: { ...request(), customer }, status } })
    assert.ok(result.ok)
    assert.deepEqual(appointments.appointmentStore.read([])[0].customer, customer)
  }
}))

test('edit dialogs show read-only customer information in TR/EN/RU while new dialogs retain editable fields', async () => inDemo(async () => {
  const { AppointmentEditor } = await server.ssrLoadModule('/src/components/manager/AppointmentEditor.tsx')
  for (const language of ['tr', 'en', 'ru']) {
    const t = dictionaries.translations[language]
    for (const status of ['pending', 'confirmed', 'completed', 'cancelled']) {
      const original = booking('10:00', status)
      const html = renderToStaticMarkup(localized(language, createElement(AppointmentEditor, { appointment: original, appointments: [original], settings: settings(), onClose() {}, onSaved() {} })))
      assert.ok(html.includes(escape(t.manager.identityReadOnly)))
      assert.ok(html.includes(original.customer.name))
      assert.ok(html.includes(original.customer.phone))
      assert.ok(html.includes(escape(t.manager.copy)))
      assert.ok(html.includes('href="https://wa.me/905551234567"'))
      assert.ok(!html.includes('id="manager-name"'))
      assert.ok(!html.includes('id="manager-phone"'))
      for (const field of ['manager-service', 'manager-specialist', 'manager-date', 'manager-time']) assert.ok(html.includes(`id="${field}"`))
    }
    const created = renderToStaticMarkup(localized(language, createElement(AppointmentEditor, { appointments: [], settings: settings(), onClose() {}, onSaved() {} })))
    assert.match(created, /<input[^>]*id="manager-name"/)
    assert.match(created, /<input[^>]*id="manager-phone"/)
    assert.ok(!created.includes('readOnly=""'))
    assert.ok(!created.includes(escape(t.manager.identityReadOnly)))
  }
}))
