import { trManager, enManager, ruManager } from './manager'
import { trBooking, enBooking, ruBooking } from './booking'
import { trCatalogue, enCatalogue, ruCatalogue } from './catalogue'
import { trHomepage, enHomepage, ruHomepage } from './homepage'

export const tr = {
  homepage: trHomepage,
  catalogue: trCatalogue,
  booking: trBooking,
  manager: trManager,
  nav: { home: 'Ana sayfa', services: 'Hizmetler', gallery: 'Galeri', booking: 'Randevu', admin: 'Yönetim' },
  common: {
    language: 'Dil', skip: 'İçeriğe geç', prototype: 'Ön izleme',
    location: 'Ankara, Türkiye', back: 'Web sitesine dön',
    note: 'Bu site bir prototiptir. Gerçek salon randevusu oluşturulmaz.',
    prepared: 'Hazırlanıyor', explore: 'Hizmetleri keşfet',
  },
  pages: {
    home: { title: 'Kendinize ayırdığınız zaman.', description: 'Sonia Nail Bar’ın dijital deneyimi hazırlanıyor.' },
    services: { title: 'Hizmetler', description: 'Hizmet listesi, süreler ve fiyatlar salon onayından sonra eklenecek.' },
    gallery: { title: 'Galeri', description: 'Salonun onayladığı görseller burada yer alacak.' },
    booking: { title: 'Randevunuzu planlayın', description: 'Örnek hizmet, uzman ve saatlerle tarayıcı içi randevu deneyimini keşfedin.' },
    admin: { title: 'Yönetim paneli', description: 'Randevular, uzmanlar ve salon takvimi için ayrılmış yönetim alanı.' },
    notFound: { title: 'Sayfa bulunamadı', description: 'Bu adres mevcut değil. Ana sayfaya dönebilirsiniz.' },
  },
  admin: {
    area: 'Yönetim alanı', overview: 'Genel bakış',
    notice: 'Bu yönetim ön izlemesi herkese açıktır. Kimlik doğrulaması ve gerçek müşteri verisi içermez.',
    appointments: 'Randevular', specialists: 'Uzmanlar', schedule: 'Çalışma takvimi',
    empty: 'Henüz veri eklenmedi.',
  },
}

// Widen string values while requiring identical keys in every dictionary.
export type TranslationShape<T> = { [K in keyof T]: T[K] extends string ? string : TranslationShape<T[K]> }
export type Translations = TranslationShape<typeof tr>

const en: Translations = {
  homepage: enHomepage,
  catalogue: enCatalogue,
  booking: enBooking,
  manager: enManager,
  nav: { home: 'Home', services: 'Services', gallery: 'Gallery', booking: 'Booking', admin: 'Manager' },
  common: {
    language: 'Language', skip: 'Skip to content', prototype: 'Preview',
    location: 'Ankara, Türkiye', back: 'Back to website',
    note: 'This is a prototype. No real salon appointment is created.',
    prepared: 'Coming soon', explore: 'Explore services',
  },
  pages: {
    home: { title: 'A little time for yourself.', description: 'The Sonia Nail Bar digital experience is taking shape.' },
    services: { title: 'Services', description: 'The service list, durations and prices will be added after salon approval.' },
    gallery: { title: 'Gallery', description: 'Salon-approved imagery will appear here.' },
    booking: { title: 'Plan your appointment', description: 'Explore browser-only booking with illustrative services, specialists and times.' },
    admin: { title: 'Manager dashboard', description: 'A dedicated space for appointments, specialists and the salon calendar.' },
    notFound: { title: 'Page not found', description: 'This address does not exist. You can return to the home page.' },
  },
  admin: {
    area: 'Manager space', overview: 'Overview',
    notice: 'This manager preview is public. It has no authentication and contains no real customer data.',
    appointments: 'Appointments', specialists: 'Specialists', schedule: 'Working calendar',
    empty: 'No data has been added yet.',
  },
}

const ru: Translations = {
  homepage: ruHomepage,
  catalogue: ruCatalogue,
  booking: ruBooking,
  manager: ruManager,
  nav: { home: 'Главная', services: 'Услуги', gallery: 'Галерея', booking: 'Запись', admin: 'Управление' },
  common: {
    language: 'Язык', skip: 'Перейти к содержимому', prototype: 'Предпросмотр',
    location: 'Анкара, Турция', back: 'Вернуться на сайт',
    note: 'Это прототип. Реальная запись в салон не создаётся.',
    prepared: 'Скоро', explore: 'Посмотреть услуги',
  },
  pages: {
    home: { title: 'Время для себя.', description: 'Цифровой мир Sonia Nail Bar обретает форму.' },
    services: { title: 'Услуги', description: 'Список услуг, продолжительность и цены появятся после согласования с салоном.' },
    gallery: { title: 'Галерея', description: 'Здесь появятся фотографии, одобренные салоном.' },
    booking: { title: 'Запланируйте визит', description: 'Попробуйте демо-запись в браузере с примерами услуг, специалистов и времени.' },
    admin: { title: 'Панель управления', description: 'Раздел для записей, специалистов и календаря салона.' },
    notFound: { title: 'Страница не найдена', description: 'Такого адреса нет. Вы можете вернуться на главную.' },
  },
  admin: {
    area: 'Управление салоном', overview: 'Обзор',
    notice: 'Этот раздел открыт для всех. В нём нет авторизации и реальных данных клиентов.',
    appointments: 'Записи', specialists: 'Специалисты', schedule: 'Рабочий календарь',
    empty: 'Данные пока не добавлены.',
  },
}

export const translations = { tr, en, ru }
