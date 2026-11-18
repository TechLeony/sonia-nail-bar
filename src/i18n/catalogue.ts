import type { TranslationShape } from './translations'

export const trCatalogue = {
  services: {
    eyebrow: 'Bakım menüsü', title: 'Hizmetler & fiyatlar', description: 'Kategorileri keşfedin, detayları inceleyin ve seçiminizle bir sonraki adıma geçin.',
    notice: 'Örnek olarak işaretlenen hizmetler, fiyatlar ve süreler yalnızca gösterim amaçlıdır; Sonia Nail Bar’ın gerçek hizmet veya fiyat listesi değildir.',
    demo: 'Örnek veri', categories: 'Hizmet kategorileri', duration: 'Örnek süre', price: 'Örnek fiyat', actualDuration: 'Süre', actualPrice: 'Fiyat', minutes: 'dk',
    select: 'Seç ve devam et', missing: 'Bilgi bekleniyor', empty: 'Bu kategoride henüz hizmet yok.', emptyAll: 'Hizmet listesi hazırlanıyor.',
  },
  gallery: {
    eyebrow: 'Sonia’dan kareler', title: 'Detaylarda ilham var.', description: 'Bakım, renk ve tasarımlar için ayrılan görsel seçkisini keşfedin.',
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
  services: {
    eyebrow: 'The care menu', title: 'Services & prices', description: 'Explore the categories, look through the details and carry your choice to the next step.',
    notice: 'Services, prices and durations labelled illustrative are demonstration data, not Sonia Nail Bar’s actual offerings or price list.',
    demo: 'Illustrative data', categories: 'Service categories', duration: 'Sample duration', price: 'Sample price', actualDuration: 'Duration', actualPrice: 'Price', minutes: 'min',
    select: 'Select & continue', missing: 'Details pending', empty: 'No services in this category yet.', emptyAll: 'The service list is being prepared.',
  },
  gallery: {
    eyebrow: 'A glimpse of Sonia', title: 'Inspiration in the details.', description: 'Explore the visual collection reserved for care, colour and design.',
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
  services: {
    eyebrow: 'Меню ухода', title: 'Услуги и цены', description: 'Изучите категории и подробности услуг, затем перейдите к следующему шагу с выбранной услугой.',
    notice: 'Услуги, цены и продолжительность с отметкой «Демонстрационные данные» приведены для примера и не являются реальным предложением или прайс-листом Sonia Nail Bar.',
    demo: 'Демонстрационные данные', categories: 'Категории услуг', duration: 'Пример длительности', price: 'Пример цены', actualDuration: 'Длительность', actualPrice: 'Цена', minutes: 'мин',
    select: 'Выбрать и продолжить', missing: 'Данные ожидаются', empty: 'В этой категории пока нет услуг.', emptyAll: 'Список услуг готовится.',
  },
  gallery: {
    eyebrow: 'Мир Sonia', title: 'Вдохновение в деталях.', description: 'Посмотрите подборку мест для будущих фотографий ухода, оттенков и дизайна.',
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
