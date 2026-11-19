import type { GalleryCategoryId, GalleryItem, LocalizedText } from '../types/domain'
import { salonMedia } from './media'

export const galleryCategories: { id: GalleryCategoryId; name: LocalizedText }[] = [
  { id: 'manicure', name: { tr: 'Tırnaklar', en: 'Nails', ru: 'Ногти' } },
  { id: 'lashes', name: { tr: 'Kirpikler', en: 'Lashes', ru: 'Ресницы' } },
  { id: 'brows', name: { tr: 'Kaşlar', en: 'Brows', ru: 'Брови' } },
]

/** Only supplied real Sonia portfolio photographs belong in this collection. */
export const galleryItems: GalleryItem[] = [
  { id: 'gallery-manicure', categoryId: 'manicure', title: { tr: 'Işıltılı geçişler', en: 'A little shimmer', ru: 'Немного блеска' }, ...salonMedia.nails, illustrative: false },
  { id: 'gallery-art', categoryId: 'manicure', title: { tr: 'Denizden ilhamla', en: 'Inspired by the sea', ru: 'Морское вдохновение' }, ...salonMedia.nailArt, illustrative: false },
  { id: 'gallery-lashes', categoryId: 'lashes', title: { tr: 'Bakışta bir dokunuş', en: 'A lift to the look', ru: 'Выразительный взгляд' }, ...salonMedia.lashes, illustrative: false },
  { id: 'gallery-lash-detail', categoryId: 'lashes', title: { tr: 'Kirpiklere yakından', en: 'Lashes, up close', ru: 'Ресницы в деталях' }, ...salonMedia.lashDetail, illustrative: false },
  { id: 'gallery-brows', categoryId: 'brows', title: { tr: 'Kaş detayları', en: 'Brow details', ru: 'Детали бровей' }, ...salonMedia.brows, illustrative: false },
]
