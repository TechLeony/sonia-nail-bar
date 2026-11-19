import type { TranslationShape } from './translations'

export const trHomepage = {
  navigation: 'Ana menü', openMenu: 'Menüyü aç', closeMenu: 'Menüyü kapat',
  book: 'Randevu al', viewServices: 'Hizmetleri incele',
  hero: {
    eyebrow: 'Ankara · Sonia Nail Bar',
    title: 'Bakım, estetik', accent: 've tarz bir arada.',
    description: 'Sonia Nail Bar’a hoş geldiniz. Kendinize ayıracağınız bir sonraki küçük molayı burada planlayın.',
    image: 'Çiçekler arasında pembe manikür', imageNote: 'Üretilmiş editoryal görsel · Portfolyo çalışması değildir.',
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
    note: 'Sonia Nail Bar’dan gerçek çalışmalar. Işıltılı tırnaklar, özgün tasarımlar ve bakışa dokunuşlar.',
    detail: 'Sonia’dan ışıltılı manikür', colour: 'Sonia’dan deniz temalı tırnak tasarımı', brows: 'Sonia’dan kaş detayları',
    placeholder: 'Fotoğraf yakında',
  },
  process: {
    eyebrow: 'Randevu süreci', title: 'Dört adımda kendinize zaman ayırın.',
    description: 'Tarayıcı içi demo randevu deneyimine kısa bir bakış.', imageNote: 'Arka plan: üretilmiş salon konsepti; gerçek salon fotoğrafı değildir.',
    service: { title: 'Hizmetinizi seçin', description: 'Size uygun bakımı bulun.' },
    specialist: { title: 'Uzmanınızı seçin', description: 'Tercih ettiğiniz uzmanı belirleyin.' },
    time: { title: 'Günü ve saati seçin', description: 'Takviminize uyan zamanı seçin.' },
    confirm: { title: 'Onaylayın', description: 'Bilgilerinizi gözden geçirip tamamlayın.' },
    note: 'Demo akışını deneyebilirsiniz. Gerçek randevu oluşturulmaz; onay süreci salonla netleştirilecek.',
  },
  contact: {
    eyebrow: 'İletişim', title: 'Bize ulaşın.', image: 'Çiçekler ve pembe saten', imageNote: 'Üretilmiş dekoratif kompozisyon',
    description: 'Sorularınız, ilhamınız ve yol tarifiniz için tek bir yer.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Salonla iletişime geçin',
    instagram: 'Instagram', instagramDescription: 'Sonia’nın dünyasına göz atın',
    maps: 'Google Maps', mapsDescription: 'Yol tarifi alın',
    pending: 'Bağlantı doğrulanmayı bekliyor',
    note: 'Instagram’da çalışmalarımızı keşfedin veya Google Maps ile yol tarifi alın. WhatsApp numarası henüz paylaşılmadı.',
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
    image: 'Pink manicure among flowers', imageNote: 'Generated editorial image · Not portfolio work.',
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
    note: 'Real work from Sonia Nail Bar. Shimmering nails, individual designs and thoughtful beauty details.',
    detail: 'Shimmering manicure by Sonia', colour: 'Sea-inspired nail art by Sonia', brows: 'Brow details by Sonia', placeholder: 'Photo coming soon',
  },
  process: {
    eyebrow: 'The booking process', title: 'Make time for you in four steps.',
    description: 'A glimpse of the browser-only demo booking experience.', imageNote: 'Background: generated salon concept, not a photograph of the actual salon.',
    service: { title: 'Choose a service', description: 'Find the care you’re looking for.' },
    specialist: { title: 'Choose a specialist', description: 'Select your preferred specialist.' },
    time: { title: 'Pick a date & time', description: 'Find a moment that fits your day.' },
    confirm: { title: 'Confirm', description: 'Review your details and finish.' },
    note: 'Try the demo flow. No real appointment is made; the confirmation policy still needs salon approval.',
  },
  contact: {
    eyebrow: 'Stay in touch', title: 'Let’s talk.', image: 'Flowers and pink satin', imageNote: 'Generated decorative composition',
    description: 'A place for your questions, inspiration and directions.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Get in touch with the salon',
    instagram: 'Instagram', instagramDescription: 'Step into Sonia’s world',
    maps: 'Google Maps', mapsDescription: 'Find your way here', pending: 'Link awaiting verification',
    note: 'Explore our work on Instagram or get directions with Google Maps. A WhatsApp number has not yet been supplied.',
  },
  footer: { line: 'A little moment for care.', navigation: 'Footer navigation', prototype: 'Browser-only demo · No real salon appointment is created.' },
}

export const ruHomepage: HomepageCopy = {
  navigation: 'Основное меню', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню',
  book: 'Записаться', viewServices: 'Посмотреть услуги',
  hero: {
    eyebrow: 'Анкара · Sonia Nail Bar', title: 'Уход, красота', accent: 'и ваш стиль.',
    description: 'Добро пожаловать в Sonia Nail Bar. Найдите немного времени для себя и начните планировать следующий визит.',
    image: 'Розовый маникюр среди цветов', imageNote: 'Сгенерированное постановочное изображение · Не работа из портфолио.',
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
    note: 'Реальные работы Sonia Nail Bar: блеск ногтей, выразительные дизайны и детали образа.',
    detail: 'Мерцающий маникюр Sonia', colour: 'Морской дизайн ногтей Sonia', brows: 'Детали бровей Sonia', placeholder: 'Фото скоро появится',
  },
  process: {
    eyebrow: 'Как записаться', title: 'Время для себя за четыре шага.',
    description: 'Как устроена демонстрационная запись в браузере.', imageNote: 'Фон: сгенерированная концепция салона, не фотография реального интерьера.',
    service: { title: 'Выберите услугу', description: 'Найдите подходящий уход.' },
    specialist: { title: 'Выберите специалиста', description: 'Укажите, к кому хотите записаться.' },
    time: { title: 'Выберите дату и время', description: 'Найдите удобное время в своём расписании.' },
    confirm: { title: 'Подтвердите', description: 'Проверьте данные и завершите запись.' },
    note: 'Попробуйте демо-запись. Реальная запись не создаётся; порядок подтверждения требует согласования с салоном.',
  },
  contact: {
    eyebrow: 'На связи', title: 'Свяжитесь с нами.', image: 'Цветы и розовый атлас', imageNote: 'Сгенерированная декоративная композиция',
    description: 'Вопросы, вдохновение и маршрут — в одном месте.',
    whatsapp: 'WhatsApp', whatsappDescription: 'Свяжитесь с салоном',
    instagram: 'Instagram', instagramDescription: 'Загляните в мир Sonia',
    maps: 'Google Maps', mapsDescription: 'Постройте маршрут', pending: 'Ссылка ожидает проверки',
    note: 'Смотрите работы в Instagram или постройте маршрут в Google Maps. Номер WhatsApp пока не предоставлен.',
  },
  footer: { line: 'Немного времени для заботы.', navigation: 'Меню внизу страницы', prototype: 'Демо в браузере · Реальная запись в салон не создаётся.' },
}
