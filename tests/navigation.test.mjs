import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scrollForRouteChange } from '../src/lib/navigationScroll.ts'

function actions(found = true) {
  const calls = []
  return { calls, top: () => calls.push('top'), anchor: (id) => { calls.push(`anchor:${id}`); return found } }
}
const position = (pathname, hash = '') => ({ pathname, hash })

test('initial route and pathname changes reset to top', () => {
  const scroll = actions()
  scrollForRouteChange(null, position('/'), scroll)
  scrollForRouteChange(position('/'), position('/services'), scroll)
  scrollForRouteChange(position('/services'), position('/booking'), scroll)
  assert.deepEqual(scroll.calls, ['top', 'top', 'top'])
})

test('query-only category, booking and admin modal changes do not reset scroll', () => {
  const scroll = actions()
  for (const pathname of ['/services', '/booking', '/admin', '/admin/analytics']) {
    scrollForRouteChange({ ...position(pathname), search: '?category=nailBar' }, { ...position(pathname), search: '?category=laser&service=demo-manicure&appointment=one' }, scroll)
  }
  assert.deepEqual(scroll.calls, [])
})

test('intentional anchors take precedence over a pathname reset', () => {
  const scroll = actions()
  scrollForRouteChange(position('/'), position('/services', '#category-lashes'), scroll)
  scrollForRouteChange(position('/services'), position('/services', '#category-pedicure'), scroll)
  assert.deepEqual(scroll.calls, ['anchor:category-lashes', 'anchor:category-pedicure'])
})

test('encoded anchors resolve safely and unchanged anchors do not re-scroll during ordinary state updates', () => {
  const scroll = actions()
  scrollForRouteChange(null, position('/services', '#%C4%B1%C5%9F%C4%B1k'), scroll)
  scrollForRouteChange(position('/services', '#%C4%B1%C5%9F%C4%B1k'), position('/services', '#%C4%B1%C5%9F%C4%B1k'), scroll)
  assert.deepEqual(scroll.calls, ['anchor:ışık'])
})

test('unknown anchors fall back to top only when changing pathname', () => {
  const scroll = actions(false)
  scrollForRouteChange(position('/'), position('/services', '#missing'), scroll)
  scrollForRouteChange(position('/services'), position('/services', '#missing'), scroll)
  assert.deepEqual(scroll.calls, ['anchor:missing', 'top', 'anchor:missing'])
})

test('clearing a category anchor and malformed anchor encoding never force an unrelated top reset', () => {
  const scroll = actions(false)
  scrollForRouteChange(position('/services', '#category-lashes'), position('/services'), scroll)
  scrollForRouteChange(position('/services'), position('/services', '#%bad%'), scroll)
  assert.deepEqual(scroll.calls, ['anchor:%bad%'])
})

test('back/forward pathname changes use the same reset policy without mutating route values', () => {
  const scroll = actions()
  const before = position('/gallery')
  const after = position('/services')
  scrollForRouteChange(before, after, scroll)
  scrollForRouteChange(after, before, scroll)
  assert.deepEqual(scroll.calls, ['top', 'top'])
  assert.deepEqual(before, position('/gallery')); assert.deepEqual(after, position('/services'))
})
