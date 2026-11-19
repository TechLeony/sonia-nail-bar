import type { TranslationShape } from './translations'

export const trCatalogue = {
  menu: {
    title: 'Sonia bakım kataloğu', intro: 'Salondan paylaşılan hizmet adlarıyla bakım seçeneklerini keşfedin. Fiyatlar henüz onaylanmadı.',
    demoNotice: 'Tüm fiyatlar ve süreler hayali demo değerleridir; salon tarafından onaylanmamıştır. Online randevu yalnızca örnek uzman atanmış hizmetlerde açıktır.',
    pending: 'Bu uygulamalara uzman atanmamıştır; online randevu kapalıdır.', demoOptions: 'Demo randevu seçenekleri', treatments: 'Menüdeki uygulamalar', contact: 'Salonla iletişim',
    laserAreas: 'Bölgeler: Tüm Bacak, Tüm Kol, Tüm Yüz, Kol Altı, Genital, Sırt, Göbek, Göğüs ve Çene. Bölge fiyatları ve paket içerikleri salonla teyit edilecek.',
    sessionNote: 'Çok seanslı seçeneklerde süre, seansların toplam örnek uygulama süresidir; tek randevu süresi değildir.', combination: 'Birlikte yazılan uygulamalar tek bir kombinasyonu ifade eder; bileşenlere ayrı fiyat atanmamıştır.',
  },
  services: {
    eyebrow: 'Bakım menüsü', title: 'Hizmetler & fiyatlar', description: 'Kategorileri keşfedin, detayları inceleyin ve seçiminizle bir sonraki adıma geçin.',
    notice: 'Menüden alınan uygulama adlarının yanında demo seçenekleri de gösterilir. Örnek fiyatlar ve süreler onaylı salon tarifesi değildir.',
    realWork: 'Sonia Nail Bar çalışması', supportingVisual: 'Üretilmiş dekoratif görsel', demo: 'Örnek veri', categories: 'Hizmet kategorileri', duration: 'Geçici demo süre', price: 'Geçici demo fiyat', pricePending: 'Fiyat teyit edilecek', durationPending: 'Süre teyit edilecek', actualDuration: 'Süre', actualPrice: 'Fiyat', minutes: 'dk',
    select: 'Seç ve devam et', missing: 'Bilgi bekleniyor', empty: 'Bu kategoride henüz hizmet yok.', emptyAll: 'Hizmet listesi hazırlanıyor.',
  },
  gallery: {
    eyebrow: 'Sonia’dan kareler', title: 'Detaylarda ilham var.', description: 'Sonia Nail Bar’ın tırnak, kirpik ve kaş çalışmalarından gerçek kareler.',
    notice: 'Onaylı salon fotoğrafları bu alana eklenecek. Açıkça işaretlenen yer tutucular gerçek çalışma örnekleri değildir.',
    filters: 'Galeri kategorileri', all: 'Tümü', placeholder: 'Onaylı fotoğraf bekleniyor', demo: 'Görsel yer tutucusu / örnek',
    preview: 'Görseli büyüt', close: 'Ön izlemeyi kapat', empty: 'Bu kategoride henüz görsel yok.',
    imageUnavailable: 'Görsel yüklenemedi. Lütfen daha sonra tekrar deneyin.',
  },
  booking: {
    eyebrow: 'Seçiminiz', title: 'Bir sonraki ziyaretinize ilk adım.',
    description: 'Seçiminiz demo randevu akışına aktarılır. Gerçek salon randevusu oluşturulmaz.',
    selected: 'Seçilen hizmet', demo: 'Örnek hizmet · Fiyat ve süre yalnızca gösterim amaçlıdır.',
    choose: 'Bir hizmet seçin', invalid: 'Bu hizmet bulunamadı veya artık listelenmiyor. Lütfen katalogdan yeniden seçin.',
    noSelection: 'Devam etmek için önce hizmet kataloğuna göz atın.', change: 'Hizmeti değiştir',
  },
}

type CatalogueCopy = TranslationShape<typeof trCatalogue>
export const enCatalogue: CatalogueCopy = {
  menu: {
    title: 'The Sonia care catalogue', intro: 'Explore the treatment names supplied by the salon. Display prices have not yet been approved.',
    demoNotice: 'All prices and durations are fictional demo values, unapproved by the salon. Online booking is available only for services with an assigned demo specialist.',
    pending: 'No specialist is assigned to these treatments; online booking is unavailable.', demoOptions: 'Demo booking options', treatments: 'Treatments on the menu', contact: 'Contact the salon',
    laserAreas: 'Areas: full legs, full arms, full face, underarms, intimate area, back, abdomen, chest and chin. Area prices and package contents await salon confirmation.',
    sessionNote: 'For multi-session options, duration is the total illustrative treatment time across visits, not a single appointment.', combination: 'Treatments joined together describe one combination; no separate component prices have been assigned.',
  },
  services: {
    eyebrow: 'The care menu', title: 'Services & prices', description: 'Explore the categories, look through the details and carry your choice to the next step.',
    notice: 'Menu treatment names appear alongside demo options. Sample prices and durations are not an approved salon tariff.',
    realWork: 'Sonia Nail Bar work', supportingVisual: 'Generated decorative image', demo: 'Illustrative data', categories: 'Service categories', duration: 'Provisional demo duration', price: 'Provisional demo price', pricePending: 'Price to be confirmed', durationPending: 'Duration to be confirmed', actualDuration: 'Duration', actualPrice: 'Price', minutes: 'min',
    select: 'Select & continue', missing: 'Details pending', empty: 'No services in this category yet.', emptyAll: 'The service list is being prepared.',
  },
  gallery: {
    eyebrow: 'A glimpse of Sonia', title: 'Inspiration in the details.', description: 'Real nail, lash and brow work from Sonia Nail Bar.',
    notice: 'Approved salon photographs will be added here. Clearly labelled placeholders are not examples of actual work.',
    filters: 'Gallery categories', all: 'All', placeholder: 'Awaiting approved photo', demo: 'Image placeholder / illustrative',
    preview: 'Enlarge image', close: 'Close preview', empty: 'No images in this category yet.',
    imageUnavailable: 'The image could not be loaded. Please try again later.',
  },
  booking: {
    eyebrow: 'Your choice', title: 'A first step towards your next visit.',
    description: 'Your choice carries into the demo booking flow. No real salon appointment is created.',
    selected: 'Selected service', demo: 'Illustrative service · Price and duration are for demonstration only.',
    choose: 'Choose a service', invalid: 'This service was not found or is no longer listed. Please choose again from the catalogue.',
    noSelection: 'Start by exploring the service catalogue.', change: 'Change service',
  },
}
export const ruCatalogue: CatalogueCopy = {
  menu: {
    title: 'Каталог ухода Sonia', intro: 'Названия процедур предоставлены салоном. Цены для публикации ещё не утверждены.',
    demoNotice: 'Все цены и длительность вымышлены для демонстрации и не утверждены салоном. Онлайн-запись доступна только для услуг с назначенным демо-специалистом.',
    pending: 'Для этих процедур специалист не назначен; онлайн-запись недоступна.', demoOptions: 'Демо-услуги для записи', treatments: 'Процедуры из меню', contact: 'Связаться с салоном',
    laserAreas: 'Зоны: ноги полностью, руки полностью, лицо полностью, подмышки, интимная зона, спина, живот, грудь и подбородок. Цены по зонам и состав пакетов требуют подтверждения салона.',
    sessionNote: 'Для нескольких сеансов указана суммарная примерная длительность процедур, а не одной записи.', combination: 'Объединённые процедуры обозначают одну комбинацию; отдельные цены на компоненты не назначены.',
  },
  services: {
    eyebrow: 'Меню ухода', title: 'Услуги и цены', description: 'Изучите категории и подробности услуг, затем перейдите к следующему шагу с выбранной услугой.',
    notice: 'Рядом с названиями процедур из меню показаны демо-услуги. Примерные цены и длительность не являются утверждённым тарифом салона.',
    realWork: 'Работа Sonia Nail Bar', supportingVisual: 'Сгенерированное декоративное изображение', demo: 'Демонстрационные данные', categories: 'Категории услуг', duration: 'Примерная демо-длительность', price: 'Предварительная демо-цена', pricePending: 'Цена уточняется', durationPending: 'Длительность уточняется', actualDuration: 'Длительность', actualPrice: 'Цена', minutes: 'мин',
    select: 'Выбрать и продолжить', missing: 'Данные ожидаются', empty: 'В этой категории пока нет услуг.', emptyAll: 'Список услуг готовится.',
  },
  gallery: {
    eyebrow: 'Мир Sonia', title: 'Вдохновение в деталях.', description: 'Реальные работы Sonia Nail Bar: ногти, ресницы и брови.',
    notice: 'Здесь появятся одобренные фотографии салона. Отмеченные заполнители не являются примерами реальных работ.',
    filters: 'Категории галереи', all: 'Все', placeholder: 'Ожидается одобренное фото', demo: 'Место для фото / пример',
    preview: 'Увеличить изображение', close: 'Закрыть просмотр', empty: 'В этой категории пока нет изображений.',
    imageUnavailable: 'Не удалось загрузить изображение. Попробуйте позже.',
  },
  booking: {
    eyebrow: 'Ваш выбор', title: 'Первый шаг к следующему визиту.',
    description: 'Выбранная услуга переносится в демо-запись. Реальная запись в салон не создаётся.',
    selected: 'Выбранная услуга', demo: 'Пример услуги · Цена и длительность указаны только для демонстрации.',
    choose: 'Выбрать услугу', invalid: 'Услуга не найдена или больше не доступна в каталоге. Выберите другую услугу.',
    noSelection: 'Начните с просмотра каталога услуг.', change: 'Изменить услугу',
  },
}
