import { demoValuesFor } from './demoServiceValues'
import type { LocalizedText, Service, ServiceCategory, ServiceCategoryId } from '../types/domain'

/** The six original demo records retain their IDs, configured prices and durations.
 * All numerical values come from fictional demo configuration; eligibility stays separate.
 * active means catalogue visibility; booking requires complete configuration. */
export const serviceCategories: ServiceCategory[] = [
  { id: 'manicure', name: { tr: 'Manikür', en: 'Manicure', ru: 'Маникюр' }, description: { tr: 'Eller ve tırnaklar için bakım örnekleri.', en: 'Example care for hands and nails.', ru: 'Примеры ухода за руками и ногтями.' } },
  { id: 'pedicure', name: { tr: 'Pedikür', en: 'Pedicure', ru: 'Педикюр' }, description: { tr: 'Ayak bakımı için örnek seçenekler.', en: 'Example foot-care options.', ru: 'Примеры ухода за стопами.' } },
  { id: 'lashes', name: { tr: 'Kirpik', en: 'Lashes', ru: 'Ресницы' }, description: { tr: 'Kirpik bakımı için örnek seçenekler.', en: 'Example lash-care options.', ru: 'Примеры ухода за ресницами.' } },
  { id: 'permanentMakeup', name: { tr: 'Kalıcı Makyaj', en: 'Permanent makeup', ru: 'Перманентный макияж' }, description: { tr: 'Kaş, dudak ve göz uygulamaları.', en: 'Brow, lip and eye treatments.', ru: 'Процедуры для бровей, губ и глаз.' } },
  { id: 'skinCare', name: { tr: 'Cilt Bakım', en: 'Skin care', ru: 'Уход за кожей' }, description: { tr: 'Seans seçenekleriyle cilt bakımı.', en: 'Skin-care session options.', ru: 'Варианты сеансов ухода за кожей.' } },
  { id: 'laser', name: { tr: 'Lazer Epilasyon', en: 'Laser hair removal', ru: 'Лазерная эпиляция' }, description: { tr: 'Yöntem, bölge ve paket detayları teyit edilecek.', en: 'Treatment, area and package details await confirmation.', ru: 'Метод, зоны и состав пакетов требуют уточнения.' } },
  { id: 'nailArt', name: { tr: 'Nail art', en: 'Nail art', ru: 'Нейл-арт' }, description: { tr: 'Renk ve tasarımla ilgili örnekler.', en: 'Examples of colour and design.', ru: 'Примеры оттенков и дизайна.' } },
]

export const demoBookingServiceIds = ['demo-manicure', 'demo-gel-manicure', 'demo-pedicure', 'demo-lash-lift', 'demo-minimal-art', 'demo-floral-art'] as const

export const catalogueServices: Service[] = [
  {
    id: 'demo-manicure', categoryId: 'manicure',
    name: { tr: 'Klasik manikür', en: 'Classic manicure', ru: 'Классический маникюр' },
    description: { tr: 'Tırnak şekillendirme ve temel el bakımı için örnek hizmet.', en: 'An example service for nail shaping and basic hand care.', ru: 'Пример услуги по приданию формы ногтям и базовому уходу за руками.' },
    ...demoValuesFor('demo-manicure'), currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-gel-manicure', categoryId: 'manicure',
    name: { tr: 'Kalıcı oje ile manikür', en: 'Gel-polish manicure', ru: 'Маникюр с гель-лаком' },
    description: { tr: 'Manikür ve tek renk uygulaması için örnek seçenek.', en: 'An example manicure with a single-colour application.', ru: 'Пример маникюра с однотонным покрытием.' },
    ...demoValuesFor('demo-gel-manicure'), currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-pedicure', categoryId: 'pedicure',
    name: { tr: 'Klasik pedikür', en: 'Classic pedicure', ru: 'Классический педикюр' },
    description: { tr: 'Tırnak şekillendirme ve temel ayak bakımı için örnek hizmet.', en: 'An example service for nail shaping and basic foot care.', ru: 'Пример услуги по приданию формы ногтям и базовому уходу за стопами.' },
    ...demoValuesFor('demo-pedicure'), currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-lash-lift', categoryId: 'lashes',
    name: { tr: 'Kirpik Lifting', en: 'Lash lift', ru: 'Ламинирование ресниц' },
    description: { tr: 'Kirpik şekillendirme uygulamasını temsil eden örnek hizmet.', en: 'An illustrative service representing lash shaping.', ru: 'Пример услуги по приданию изгиба ресницам.' },
    ...demoValuesFor('demo-lash-lift'), currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-minimal-art', categoryId: 'nailArt',
    name: { tr: 'Minimal tırnak tasarımı', en: 'Minimal nail design', ru: 'Минималистичный дизайн ногтей' },
    description: { tr: 'İnce çizgiler ve küçük renk detayları için örnek tasarım.', en: 'An example design with fine lines and small colour details.', ru: 'Пример дизайна с тонкими линиями и цветовыми акцентами.' },
    ...demoValuesFor('demo-minimal-art'), currency: 'TRY', active: true, illustrative: true,
  },
  {
    id: 'demo-floral-art', categoryId: 'nailArt',
    name: { tr: 'Çiçek desenli tasarım', en: 'Floral nail design', ru: 'Цветочный дизайн ногтей' },
    description: { tr: 'Çiçek motifleriyle hazırlanan örnek tasarım seçeneği.', en: 'An illustrative design option featuring floral motifs.', ru: 'Пример дизайна с цветочными мотивами.' },
    ...demoValuesFor('demo-floral-art'), currency: 'TRY', active: true, illustrative: true,
  },
]

/** Supplied terminology with fictional demo values; no new staff eligibility. */
function menuService(id: string, categoryId: ServiceCategoryId, name: LocalizedText): Service {
  return { id: `menu-${id}`, categoryId, name,
    description: { tr: 'Sayısal bilgiler yalnızca prototip içindir; uzman ataması yapılmamıştır.', en: 'Numerical details are for this prototype only; no specialist is assigned.', ru: 'Числовые данные приведены только для прототипа; специалист не назначен.' },
    ...demoValuesFor(`menu-${id}`), currency: 'TRY', active: true, illustrative: true }
}
catalogueServices.push(
  menuService("gel-polish", "manicure", { tr: "Kalıcı Oje", en: "Gel polish", ru: "Гель-лак" }),
  menuService("medical-manicure", "manicure", { tr: "Medikal Manikür", en: "Medical manicure", ru: "Медицинский маникюр" }),
  menuService("nail-extensions", "manicure", { tr: "Protez Tırnak", en: "Nail extensions", ru: "Наращивание ногтей" }),
  menuService("extension-maintenance", "manicure", { tr: "Protez Tırnak Bakım", en: "Nail extension maintenance", ru: "Коррекция наращённых ногтей" }),
  menuService("nail-art", "nailArt", { tr: "Nail Art", en: "Nail art", ru: "Дизайн ногтей" }),
  menuService("3d-art", "nailArt", { tr: "3D & Yoğun Nail Art Tırnaklar", en: "3D & elaborate nail art", ru: "Объёмный и сложный дизайн ногтей" }),
  menuService("pedicure-polish-care", "pedicure", { tr: "Pedikür + Kalıcı Oje + Bakım", en: "Pedicure + gel polish + care", ru: "Педикюр + гель-лак + уход" }),
  menuService("single-toe-extension", "pedicure", { tr: "Ayak Tek Parmak Protez", en: "Single toenail extension", ru: "Наращивание одного ногтя на ноге" }),
  menuService("single-finger-extension", "manicure", { tr: "El Tek Parmak Protez", en: "Single fingernail extension", ru: "Наращивание одного ногтя на руке" }),
  menuService("wet-medical-manicure", "manicure", { tr: "Manikür (Islak ve Medikal)", en: "Manicure (wet and medical)", ru: "Маникюр (мокрый и медицинский)" }),
  menuService("wet-medical-pedicure", "pedicure", { tr: "Pedikür (Islak ve Medikal)", en: "Pedicure (wet and medical)", ru: "Педикюр (мокрый и медицинский)" }),
  menuService("removal", "manicure", { tr: "Sadece İşlem Çıkartma", en: "Removal only", ru: "Только снятие" }),
  menuService("manicure-removal", "manicure", { tr: "Manikür + Çıkartma", en: "Manicure + removal", ru: "Маникюр + снятие" }),
  menuService("japanese-manicure", "manicure", { tr: "Japon Manikür", en: "Japanese manicure", ru: "Японский маникюр" }),
  menuService("polish-strengthening-combination", "manicure", { tr: "Kalıcı Oje + Güçlendirme + Nail Art + Medikal Manikür", en: "Gel polish + strengthening + nail art + medical manicure", ru: "Гель-лак + укрепление + дизайн + медицинский маникюр" }),
  menuService("extension-combination", "manicure", { tr: "Protez Tırnak + Kalıcı Oje + Nail Art + Medikal Manikür", en: "Nail extensions + gel polish + nail art + medical manicure", ru: "Наращивание + гель-лак + дизайн + медицинский маникюр" }),
  menuService("natural-lashes", "lashes", { tr: "İpek Kirpik Doğal", en: "Natural lash extensions", ru: "Натуральный объём ресниц" }),
  menuService("medium-lashes", "lashes", { tr: "İpek Kirpik Orta", en: "Medium-volume lash extensions", ru: "Средний объём ресниц" }),
  menuService("full-lashes", "lashes", { tr: "İpek Kirpik Yoğun", en: "Full-volume lash extensions", ru: "Густой объём ресниц" }),
  menuService("mega-lashes", "lashes", { tr: "İpek Kirpik Mega Volüm", en: "Mega-volume lash extensions", ru: "Мегаобъём ресниц" }),
  menuService("brown-lash-addon", "lashes", { tr: "Kahverengi Tüm Volümlere Ek", en: "Brown lashes — supplement for any volume", ru: "Коричневые ресницы — доплата к любому объёму" }),
  menuService("lash-maintenance", "lashes", { tr: "İpek Kirpik Bakım", en: "Lash extension maintenance", ru: "Коррекция наращённых ресниц" }),
  menuService("lash-removal", "lashes", { tr: "İpek Kirpik Çıkartma", en: "Lash extension removal", ru: "Снятие наращённых ресниц" }),
  menuService("brow-lamination", "lashes", { tr: "Kaş Laminasyon", en: "Brow lamination", ru: "Ламинирование бровей" }),
  menuService("microblading", "permanentMakeup", { tr: "Microblading", en: "Microblading", ru: "Микроблейдинг" }),
  menuService("lip-colour", "permanentMakeup", { tr: "Dudak Renklendirme", en: "Lip pigmentation", ru: "Перманентный макияж губ" }),
  menuService("eyeliner", "permanentMakeup", { tr: "Eyeliner", en: "Eyeliner", ru: "Перманентная стрелка" }),
  menuService("lashline", "permanentMakeup", { tr: "Dipliner", en: "Lash-line enhancement", ru: "Межресничный татуаж" }),
  menuService("hydrafacial-one", "skinCare", { tr: "Hydrafacial (1 seans)", en: "Hydrafacial (1 session)", ru: "Hydrafacial (1 сеанс)" }),
  menuService("hydrafacial-three", "skinCare", { tr: "Hydrafacial (3 seans)", en: "Hydrafacial (3 sessions)", ru: "Hydrafacial (3 сеанса)" }),
  menuService("ipl", "laser", { tr: "IPL (Soğuk hava)", en: "IPL (cold air)", ru: "IPL (холодный воздух)" }),
  menuService("diode", "laser", { tr: "Diode (Buz başlık)", en: "Diode (cooling head)", ru: "Диодная эпиляция (охлаждающая насадка)" }),
)

export const catalogueGroups: { id: string; name: LocalizedText; categoryIds: ServiceCategoryId[] }[] = [
  { id: 'nailBar', name: { tr: 'Nail Bar', en: 'Nail Bar', ru: 'Ногтевой сервис' }, categoryIds: ['manicure', 'pedicure', 'nailArt'] },
  { id: 'lashBrow', name: { tr: 'Kirpik & Kaş', en: 'Lashes & brows', ru: 'Ресницы и брови' }, categoryIds: ['lashes'] },
  { id: 'permanentMakeup', name: { tr: 'Kalıcı Makyaj', en: 'Permanent makeup', ru: 'Перманентный макияж' }, categoryIds: ['permanentMakeup'] },
  { id: 'skinCare', name: { tr: 'Cilt Bakım', en: 'Skin care', ru: 'Уход за кожей' }, categoryIds: ['skinCare'] },
  { id: 'laser', name: { tr: 'Lazer Epilasyon', en: 'Laser hair removal', ru: 'Лазерная эпиляция' }, categoryIds: ['laser'] },
]
