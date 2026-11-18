import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createStorageEntry } from '../src/lib/storage.ts'

const key = 'sonia-nail-bar:prototype:test'
const entry = createStorageEntry('test', (value) => typeof value === 'string')

function mockStorage() {
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (name) => values.get(name) ?? null,
      setItem: (name, value) => values.set(name, value),
      removeItem: (name) => values.delete(name),
    },
  }
  return values
}

test('persists a versioned preference across entry instances and removes it', () => {
  const values = mockStorage()
  assert.equal(entry.read('tr'), 'tr')
  assert.equal(entry.write('ru'), true)
  assert.deepEqual(JSON.parse(values.get(key)), { version: 1, data: 'ru' })
  assert.equal(createStorageEntry('test', (v) => typeof v === 'string').read('tr'), 'ru')
  assert.equal(entry.remove(), true)
  assert.equal(entry.read('tr'), 'tr')
})

test('rejects malformed data, invalid values and unsupported versions', () => {
  const values = mockStorage()
  for (const raw of ['{', 'null', '[]', '"en"', '{"version":2,"data":"ru"}', '{"version":1,"data":42}']) {
    values.set(key, raw)
    assert.equal(entry.read('tr'), 'tr')
  }
  assert.equal(entry.write(42), false)
})

test('handles denied storage and quota failures without crashing', () => {
  globalThis.window = {
    localStorage: {
      getItem() { throw new Error('Storage denied') },
      setItem() { throw new Error('Quota exceeded') },
      removeItem() { throw new Error('Storage denied') },
    },
  }
  assert.equal(entry.read('tr'), 'tr')
  assert.equal(entry.write('en'), false)
  assert.equal(entry.remove(), false)
})

test('handles environments without window', () => {
  delete globalThis.window
  assert.equal(entry.read('tr'), 'tr')
  assert.equal(entry.write('en'), false)
  assert.equal(entry.remove(), false)
})
