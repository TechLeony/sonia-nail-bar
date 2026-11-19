import { salonMedia } from './media'
/** Populate only with verified official URLs. Null entries render as labelled,
 * inactive placeholders, never as invented accounts or map destinations.
 */
export const contactLinks: Record<'whatsapp' | 'instagram' | 'maps', string | null> = {
  whatsapp: null,
  instagram: 'https://www.instagram.com/sonianailbar/',
  maps: 'https://maps.app.goo.gl/8shwzBbxc6r11YgHA',
}

/** Local portfolio and explicitly labelled generated supporting imagery.
 * The keys map to translated descriptions in the homepage dictionary.
 */
export const homepageMedia: {
  hero: string | null
  contact: string | null
  services: Record<ServicePreviewKey, string | null>
  gallery: { id: 'detail' | 'colour' | 'brows'; src: string | null; tone: 'blush' | 'lilac' | 'pink' }[]
} = {
  hero: salonMedia.editorialManicure.src,
  contact: salonMedia.floralSatin.src,
  services: { manicure: salonMedia.nails.src, pedicure: salonMedia.editorialPedicure.src, lashes: salonMedia.lashes.src, nailArt: salonMedia.nailArt.src },
  gallery: [
    { id: 'detail', src: salonMedia.nails.src, tone: 'blush' },
    { id: 'colour', src: salonMedia.nailArt.src, tone: 'lilac' },
    { id: 'brows', src: salonMedia.brows.src, tone: 'pink' },
  ],
}

/** Illustrative navigation categories, not a confirmed service catalogue. */
export const servicePreviewKeys = ['manicure', 'pedicure', 'lashes', 'nailArt'] as const
export const bookingStepKeys = ['service', 'specialist', 'time', 'confirm'] as const

export type ServicePreviewKey = typeof servicePreviewKeys[number]
