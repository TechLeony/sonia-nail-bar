import { catalogueGroups } from '../data/services'

/** Query selection is shareable; legacy category/menu anchors still resolve. */
export function selectedCatalogueGroup(search: string, hash = '') {
  const requested = new URLSearchParams(search).get('category')
  const explicit = catalogueGroups.find((group) => group.id === requested)
  if (explicit) return explicit
  if (requested !== null) return catalogueGroups[0]
  const anchor = hash.replace(/^#(?:category-|menu-)/, '')
  return catalogueGroups.find((group) => group.id === anchor || group.categoryIds.some((id) => id === anchor)) ?? catalogueGroups[0]
}

/** Keep category changes local unless their heading is outside the viewport. */
export function revealCatalogueHeading(heading: { getBoundingClientRect(): { top: number; bottom: number }; scrollIntoView(options: ScrollIntoViewOptions): void }, viewportHeight: number) {
  const bounds = heading.getBoundingClientRect()
  if (bounds.top < 0 || bounds.bottom > viewportHeight) heading.scrollIntoView({ block: 'start', behavior: 'instant' })
}
