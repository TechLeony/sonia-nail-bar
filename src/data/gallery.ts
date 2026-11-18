import type { GalleryCategoryId, GalleryItem, LocalizedText } from '../types/domain'
import { serviceCategories } from './services'

export const galleryCategories: { id: GalleryCategoryId; name: LocalizedText }[] = [
  ...serviceCategories.map(({ id, name }) => ({ id, name })),
  { id: 'salon', name: { tr: 'Salon', en: 'The salon', ru: 'Салон' } },
]

/** Empty media slots, not Sonia work. Add only approved local photos and their
 * translated alt text/descriptions; set illustrative to false after approval.
 */
export const galleryItems: GalleryItem[] = [
  { id: 'gallery-manicure', categoryId: 'manicure', title: { tr: 'Manikür detayı', en: 'Manicure detail', ru: 'Детали маникюра' }, alt: { tr: 'Manikür fotoğrafı için ayrılan alan', en: 'Reserved slot for a manicure photograph', ru: 'Место для фотографии маникюра' }, src: null, illustrative: true },
  { id: 'gallery-colour', categoryId: 'manicure', title: { tr: 'Renk seçkisi', en: 'A study in colour', ru: 'Палитра оттенков' }, alt: { tr: 'Oje renkleri fotoğrafı için ayrılan alan', en: 'Reserved slot for a nail colour photograph', ru: 'Место для фотографии оттенков лака' }, src: null, illustrative: true },
  { id: 'gallery-pedicure', categoryId: 'pedicure', title: { tr: 'Pedikür detayı', en: 'Pedicure detail', ru: 'Детали педикюра' }, alt: { tr: 'Pedikür fotoğrafı için ayrılan alan', en: 'Reserved slot for a pedicure photograph', ru: 'Место для фотографии педикюра' }, src: null, illustrative: true },
  { id: 'gallery-lashes', categoryId: 'lashes', title: { tr: 'Kirpik detayı', en: 'Lash detail', ru: 'Детали ресниц' }, alt: { tr: 'Kirpik fotoğrafı için ayrılan alan', en: 'Reserved slot for a lash photograph', ru: 'Место для фотографии ресниц' }, src: null, illustrative: true },
  { id: 'gallery-art', categoryId: 'nailArt', title: { tr: 'Tasarım detayları', en: 'Design details', ru: 'Детали дизайна' }, alt: { tr: 'Tırnak tasarımı fotoğrafı için ayrılan alan', en: 'Reserved slot for a nail design photograph', ru: 'Место для фотографии дизайна ногтей' }, description: { tr: 'Onaylı tasarım görseli ve açıklaması burada yer alacak.', en: 'An approved design image and description will appear here.', ru: 'Здесь появятся одобренная фотография дизайна и описание.' }, src: null, illustrative: true },
  { id: 'gallery-salon', categoryId: 'salon', title: { tr: 'Sonia’dan bir köşe', en: 'A corner of Sonia', ru: 'Уголок Sonia' }, alt: { tr: 'Salon iç mekân fotoğrafı için ayrılan alan', en: 'Reserved slot for a salon interior photograph', ru: 'Место для фотографии интерьера салона' }, src: null, illustrative: true },
]
