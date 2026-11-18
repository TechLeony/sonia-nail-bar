import type { Service, ServiceCategory } from '../types/domain'

/** ILLUSTRATIVE catalogue only. None of these services, prices or durations
 * have been supplied by Sonia Nail Bar. Replace with client-approved records.
 * active controls prototype visibility/selection, not real-world availability.
 */
export const serviceCategories: ServiceCategory[] = [
  { id: 'manicure', name: { tr: 'Manikür', en: 'Manicure', ru: 'Маникюр' }, description: { tr: 'Eller ve tırnaklar için bakım örnekleri.', en: 'Example care for hands and nails.', ru: 'Примеры ухода за руками и ногтями.' } },
  { id: 'pedicure', name: { tr: 'Pedikür', en: 'Pedicure', ru: 'Педикюр' }, description: { tr: 'Ayak bakımı için örnek seçenekler.', en: 'Example foot-care options.', ru: 'Примеры ухода за стопами.' } },
  { id: 'lashes', name: { tr: 'Kirpik', en: 'Lashes', ru: 'Ресницы' }, description: { tr: 'Kirpik bakımı için örnek seçenekler.', en: 'Example lash-care options.', ru: 'Примеры ухода за ресницами.' } },
  { id: 'nailArt', name: { tr: 'Nail art', en: 'Nail art', ru: 'Нейл-арт' }, description: { tr: 'Renk ve tasarımla ilgili örnekler.', en: 'Examples of colour and design.', ru: 'Примеры оттенков и дизайна.' } },
]

export const catalogueServices: Service[] = [
  {
    id: 'demo-manicure', categoryId: 'manicure',
    name: { tr: 'Klasik manikür', en: 'Classic manicure', ru: 'Классический маникюр' },
    description: { tr: 'Tırnak şekillendirme ve temel el bakımı için örnek hizmet.', en: 'An example service for nail shaping and basic hand care.', ru: 'Пример услуги по приданию формы ногтям и базовому уходу за руками.' },
    durationMinutes: 45, priceMinor: 50000, currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-gel-manicure', categoryId: 'manicure',
    name: { tr: 'Kalıcı oje ile manikür', en: 'Gel-polish manicure', ru: 'Маникюр с гель-лаком' },
    description: { tr: 'Manikür ve tek renk uygulaması için örnek seçenek.', en: 'An example manicure with a single-colour application.', ru: 'Пример маникюра с однотонным покрытием.' },
    durationMinutes: 75, priceMinor: 75000, currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-pedicure', categoryId: 'pedicure',
    name: { tr: 'Klasik pedikür', en: 'Classic pedicure', ru: 'Классический педикюр' },
    description: { tr: 'Tırnak şekillendirme ve temel ayak bakımı için örnek hizmet.', en: 'An example service for nail shaping and basic foot care.', ru: 'Пример услуги по приданию формы ногтям и базовому уходу за стопами.' },
    durationMinutes: 60, priceMinor: 65000, currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-lash-lift', categoryId: 'lashes',
    name: { tr: 'Kirpik lifting', en: 'Lash lift', ru: 'Ламинирование ресниц' },
    description: { tr: 'Kirpik şekillendirme uygulamasını temsil eden örnek hizmet.', en: 'An illustrative service representing lash shaping.', ru: 'Пример услуги по приданию изгиба ресницам.' },
    durationMinutes: 60, priceMinor: 90000, currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-minimal-art', categoryId: 'nailArt',
    name: { tr: 'Minimal tırnak tasarımı', en: 'Minimal nail design', ru: 'Минималистичный дизайн ногтей' },
    description: { tr: 'İnce çizgiler ve küçük renk detayları için örnek tasarım.', en: 'An example design with fine lines and small colour details.', ru: 'Пример дизайна с тонкими линиями и цветовыми акцентами.' },
    durationMinutes: 30, priceMinor: 25000, currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-floral-art', categoryId: 'nailArt',
    name: { tr: 'Çiçek desenli tasarım', en: 'Floral nail design', ru: 'Цветочный дизайн ногтей' },
    description: { tr: 'Çiçek motifleriyle hazırlanan örnek tasarım seçeneği.', en: 'An illustrative design option featuring floral motifs.', ru: 'Пример дизайна с цветочными мотивами.' },
    durationMinutes: 45, priceMinor: 40000, currency: 'TRY', active: true, illustrative: true,
  },
]
