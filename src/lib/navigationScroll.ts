export interface RoutePosition { pathname: string; hash: string }
export interface ScrollActions { top(): void; anchor(id: string): boolean }

/** Search parameters are deliberately absent: filters, booking selections and
 * admin dialogs must not trigger route-level scrolling. Never changes history. */
export function scrollForRouteChange(previous: RoutePosition | null, current: RoutePosition, actions: ScrollActions): void {
  const pathnameChanged = previous?.pathname !== current.pathname
  const hashChanged = previous?.hash !== current.hash
  if (current.hash && (pathnameChanged || hashChanged)) {
    let id: string
    try { id = decodeURIComponent(current.hash.slice(1)) } catch { id = current.hash.slice(1) }
    if (actions.anchor(id)) return
  }
  if (pathnameChanged) actions.top()
}
