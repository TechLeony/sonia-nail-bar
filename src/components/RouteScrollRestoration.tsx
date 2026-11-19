import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollForRouteChange } from '../lib/navigationScroll'
import type { RoutePosition } from '../lib/navigationScroll'

export function RouteScrollRestoration() {
  const { pathname, hash } = useLocation()
  const previous = useRef<RoutePosition | null>(null)
  useLayoutEffect(() => {
    const current = { pathname, hash }
    scrollForRouteChange(previous.current, current, {
      top: () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }),
      anchor: (id) => {
        const target = document.getElementById(id)
        if (!target) return false
        target.scrollIntoView({ block: 'start', behavior: 'instant' })
        return true
      },
    })
    previous.current = current
  }, [pathname, hash])
  return null
}
