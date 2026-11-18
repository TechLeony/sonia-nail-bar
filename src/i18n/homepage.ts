import type { TranslationShape } from './translations'

export const trHomepage = {
  navigation: 'Ana menü', openMenu: 'Menüyü aç', closeMenu: 'Menüyü kapat',
  book: 'Randevu al', viewServices: 'Hizmetleri incele',
  hero: {
    eyebrow: 'Ankara · Sonia Nail Bar',
    title: 'Bakım, estetik', accent: 've tarz bir arada.',
    description: 'Sonia Nail Bar’a hoş geldiniz. Kendinize ayıracağınız bir sonraki küçük molayı burada planlayın.',
    image: 'Salon fotoğrafı', imageNote: 'Onaylı salon görseli bekleniyor.',
  },
  services: {
    eyebrow: 'Hizmetlerimiz', title: 'Sana uygun bakım.',
    note: 'Örnek kategoriler · Hizmetler salon onayından sonra kesinleşecek.',
    manicure: { title: 'Manikür', description: 'El ve tırnak bakımı için örnek kategori.' },
    pedicure: { title: 'Pedikür', description: 'Ayak ve tırnak bakımı için örnek kategori.' },
    lashes: { title: 'Kirpik', description: 'Kirpik bakımı için örnek kategori.' },
    nailArt: { title: 'Nail art', description: 'Renk ve tasarımlar için örnek kategori.' },
    all: 'Tüm hizmetler',
  },
  gallery: {
    eyebrow: 'Galeri', title: 'Bir sonraki stilinize ilham.', all: 'Galeriye göz at',
    note: 'Bu alanlar fotoğraf yer tutucusudur; gerçek salon çalışmalarını göstermez.',
    detail: 'Tırnak detayı', colour: 'Renk ve tasarım', salon: 'Salon atmosferi',
    placeholder: 'Fotoğraf yakında',
  },
  process: {
    eyebrow: 'Randevu süreci', title: 'Dört adımda kendinize zaman ayırın.',
    description: 'Tarayıcı içi demo randevu deneyimine kısa bir bakış.',
    service: { title: 'Hizmetinizi seçin', description: 'Size uygun bakımı bulun.' },
    specialist: { title: 'Uzmanınızı seçin', description: 'Tercih ettiğiniz uzmanı belirleyin.' },
    time: { title: 'Günü ve saati seçin', description: 'Takviminize uyan zamanı seçin.' },
    confirm: { title: 'Onaylayın', description: 'Bilgilerinizi gözden geçirip tamamlayın.' },
    note: 'Demo akışını deneyebilirsiniz. Gerçek randevu oluşturulmaz; onay süreci salonla netleştirilecek.',
  },
  contact: {
    eyebrow: 'İletişim', title: 'Bize ulaşın.', image: 'Salon iç mekân fotoğrafı',
    description: 'Sorularınız, ilhamınız ve yol tarifiniz için tek bir yer.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Salonla iletişime geçin',
    instagram: 'Instagram', instagramDescription: 'Sonia’nın dünyasına göz atın',
    maps: 'Google Maps', mapsDescription: 'Yol tarifi alın',
    pending: 'Bağlantı doğrulanmayı bekliyor',
    note: 'Resmî hesaplar ve konum doğrulandığında bu bağlantılar açılacak.',
  },
  footer: { line: 'Bakım için küçük bir mola.', navigation: 'Alt menü', prototype: 'Tarayıcı içi demo · Gerçek salon randevusu oluşturulmaz.' },
}

type HomepageCopy = TranslationShape<typeof trHomepage>

export const enHomepage: HomepageCopy = {
  navigation: 'Main navigation', openMenu: 'Open menu', closeMenu: 'Close menu',
  book: 'Book appointment', viewServices: 'View services',
  hero: {
    eyebrow: 'Ankara · Sonia Nail Bar', title: 'Care, beauty', accent: 'and a little you.',
    description: 'Welcome to Sonia Nail Bar. Make a little room for yourself and start planning your next visit.',
    image: 'Salon photograph', imageNote: 'Awaiting approved salon imagery.',
  },
  services: {
    eyebrow: 'Our services', title: 'Find your kind of care.',
    note: 'Illustrative categories · Services are subject to salon approval.',
    manicure: { title: 'Manicure', description: 'An illustrative category for hand and nail care.' },
    pedicure: { title: 'Pedicure', description: 'An illustrative category for foot and nail care.' },
    lashes: { title: 'Lashes', description: 'An illustrative category for lash care.' },
    nailArt: { title: 'Nail art', description: 'An illustrative category for colours and designs.' },
    all: 'All services',
  },
  gallery: {
    eyebrow: 'The gallery', title: 'Inspiration for your next look.', all: 'Explore the gallery',
    note: 'These are photo placeholders, not examples of actual salon work.',
    detail: 'Nail detail', colour: 'Colour & design', salon: 'Inside the salon', placeholder: 'Photo coming soon',
  },
  process: {
    eyebrow: 'The booking process', title: 'Make time for you in four steps.',
    description: 'A glimpse of the browser-only demo booking experience.',
    service: { title: 'Choose a service', description: 'Find the care you’re looking for.' },
    specialist: { title: 'Choose a specialist', description: 'Select your preferred specialist.' },
    time: { title: 'Pick a date & time', description: 'Find a moment that fits your day.' },
    confirm: { title: 'Confirm', description: 'Review your details and finish.' },
    note: 'Try the demo flow. No real appointment is made; the confirmation policy still needs salon approval.',
  },
  contact: {
    eyebrow: 'Stay in touch', title: 'Let’s talk.', image: 'Salon interior photograph',
    description: 'A place for your questions, inspiration and directions.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Get in touch with the salon',
    instagram: 'Instagram', instagramDescription: 'Step into Sonia’s world',
    maps: 'Google Maps', mapsDescription: 'Find your way here', pending: 'Link awaiting verification',
    note: 'Links will become available once official accounts and the location are verified.',
  },
  footer: { line: 'A little moment for care.', navigation: 'Footer navigation', prototype: 'Browser-only demo · No real salon appointment is created.' },
}

export const ruHomepage: HomepageCopy = {
  navigation: 'Основное меню', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню',
  book: 'Записаться', viewServices: 'Посмотреть услуги',
  hero: {
    eyebrow: 'Анкара · Sonia Nail Bar', title: 'Уход, красота', accent: 'и ваш стиль.',
    description: 'Добро пожаловать в Sonia Nail Bar. Найдите немного времени для себя и начните планировать следующий визит.',
    image: 'Фотография салона', imageNote: 'Ожидаем фотографии, одобренные салоном.',
  },
  services: {
    eyebrow: 'Наши услуги', title: 'Уход, который вам подходит.',
    note: 'Примеры категорий · Услуги требуют согласования с салоном.',
    manicure: { title: 'Маникюр', description: 'Пример категории для ухода за руками и ногтями.' },
    pedicure: { title: 'Педикюр', description: 'Пример категории для ухода за стопами и ногтями.' },
    lashes: { title: 'Ресницы', description: 'Пример категории для ухода за ресницами.' },
    nailArt: { title: 'Нейл-арт', description: 'Пример категории для оттенков и дизайна.' },
    all: 'Все услуги',
  },
  gallery: {
    eyebrow: 'Галерея', title: 'Вдохновение для нового образа.', all: 'Открыть галерею',
    note: 'Это места для будущих фотографий, а не примеры реальных работ салона.',
    detail: 'Детали маникюра', colour: 'Цвет и дизайн', salon: 'Атмосфера салона', placeholder: 'Фото скоро появится',
  },
  process: {
    eyebrow: 'Как записаться', title: 'Время для себя за четыре шага.',
    description: 'Как устроена демонстрационная запись в браузере.',
    service: { title: 'Выберите услугу', description: 'Найдите подходящий уход.' },
    specialist: { title: 'Выберите специалиста', description: 'Укажите, к кому хотите записаться.' },
    time: { title: 'Выберите дату и время', description: 'Найдите удобное время в своём расписании.' },
    confirm: { title: 'Подтвердите', description: 'Проверьте данные и завершите запись.' },
    note: 'Попробуйте демо-запись. Реальная запись не создаётся; порядок подтверждения требует согласования с салоном.',
  },
  contact: {
    eyebrow: 'На связи', title: 'Свяжитесь с нами.', image: 'Фотография интерьера салона',
    description: 'Вопросы, вдохновение и маршрут — в одном месте.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Свяжитесь с салоном',
    instagram: 'Instagram', instagramDescription: 'Загляните в мир Sonia',
    maps: 'Google Maps', mapsDescription: 'Постройте маршрут', pending: 'Ссылка ожидает проверки',
    note: 'Ссылки станут доступны после проверки официальных аккаунтов и местоположения.',
  },
  footer: { line: 'Немного времени для заботы.', navigation: 'Меню внизу страницы', prototype: 'Демо в браузере · Реальная запись в салон не создаётся.' },
}
