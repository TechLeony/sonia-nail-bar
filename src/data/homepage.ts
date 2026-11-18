/** Populate only with verified official URLs. Null entries render as labelled,
 * inactive placeholders, never as invented accounts or map destinations.
 */
export const contactLinks: Record<'whatsapp' | 'instagram' | 'maps', string | null> = {
  whatsapp: null,
  instagram: null,
  maps: null,
}

/** Replace with local, client-approved media and translated descriptions.
 * The keys map to translated descriptions in the homepage dictionary.
 */
export const homepageMedia: {
  hero: string | null
  contact: string | null
  services: Record<ServicePreviewKey, string | null>
  gallery: { id: 'detail' | 'colour' | 'salon'; src: string | null; tone: 'blush' | 'lilac' | 'pink' }[]
} = {
  hero: null,
  contact: null,
  services: { manicure: null, pedicure: null, lashes: null, nailArt: null },
  gallery: [
    { id: 'detail', src: null, tone: 'blush' },
    { id: 'colour', src: null, tone: 'lilac' },
    { id: 'salon', src: null, tone: 'pink' },
  ],
}

/** Illustrative navigation categories, not a confirmed service catalogue. */
export const servicePreviewKeys = ['manicure', 'pedicure', 'lashes', 'nailArt'] as const
export const bookingStepKeys = ['service', 'specialist', 'time', 'confirm'] as const

export type ServicePreviewKey = typeof servicePreviewKeys[number]
