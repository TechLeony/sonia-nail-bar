import nails from '../assets/sonia/IMG_7736.jpeg'
import nailArt from '../assets/sonia/IMG_7741.jpeg'
import lashes from '../assets/sonia/IMG_7737.jpeg'
import brows from '../assets/sonia/IMG_7738.jpeg'
import lashDetail from '../assets/sonia/IMG_7742.jpeg'
import salonConcept from '../assets/sonia/background-img.png'
import floralSatin from '../assets/sonia/interior-img.png'
import editorialManicure from '../assets/sonia/manicure-img.png'
import editorialPedicure from '../assets/sonia/pedicure-img.png'
import logoConcept from '../assets/sonia/soniaLogo-img.png'
import makeupConcept from '../assets/sonia/kaliciMakyaj-img.png'
import laserConcept from '../assets/sonia/lazerEpilyasyon-img.png'
import skinConcept from '../assets/sonia/ciltBakim-img.png'
import type { LocalizedText, ServiceCategoryId } from '../types/domain'

interface SalonImage { src: string; kind: 'portfolio' | 'support'; alt: LocalizedText }
/** Explicit imports only. Source filenames are retained; roles follow the actual
 * image contents (the background/interior filenames are reversed in this set). */
export const salonMedia = {
  makeupConcept: { src: makeupConcept, kind: 'support', alt: { tr: 'Kalıcı makyajı temsil eden üretilmiş görsel; gerçek Sonia çalışması değildir', en: 'Generated permanent makeup illustration; not real Sonia work', ru: 'Сгенерированная иллюстрация перманентного макияжа; не реальная работа Sonia' } },
  laserConcept: { src: laserConcept, kind: 'support', alt: { tr: 'Epilasyonu temsil eden üretilmiş görsel; gerçek Sonia çalışması değildir', en: 'Generated hair removal illustration; not real Sonia work', ru: 'Сгенерированная иллюстрация эпиляции; не реальная работа Sonia' } },
  skinConcept: { src: skinConcept, kind: 'support', alt: { tr: 'Cilt bakımını temsil eden üretilmiş görsel; gerçek Sonia çalışması değildir', en: 'Generated skin care illustration; not real Sonia work', ru: 'Сгенерированная иллюстрация ухода за кожей; не реальная работа Sonia' } },
  editorialPedicure: { src: editorialPedicure, kind: 'support', alt: { tr: 'Bordo ojeli pedikürün üretilmiş örnek görseli; gerçek Sonia müşteri çalışması değildir', en: 'Generated illustrative pedicure with burgundy polish; not real Sonia client work', ru: 'Сгенерированная иллюстрация педикюра с бордовым лаком; не реальная работа Sonia' } },
  logoConcept: { src: logoConcept, kind: 'support', alt: { tr: 'Kurdele ve kalp motifli SONIA Nail Bar logo önerisi; doğrulanmış resmî logo değildir', en: 'Ribbon-heart SONIA Nail Bar logo concept; not a verified official logo', ru: 'Концепция логотипа SONIA Nail Bar с сердцем и лентой; не утверждённый официальный логотип' } },
  nails: { src: nails, kind: 'portfolio', alt: { tr: 'Sonia Nail Bar çalışması: pembe-beyaz geçişli, parlak benekli uzun tırnaklar', en: 'Sonia Nail Bar work: long pink-to-white nails with reflective dots', ru: 'Работа Sonia Nail Bar: длинные ногти с розово-белым градиентом и блестящими точками' } },
  nailArt: { src: nailArt, kind: 'portfolio', alt: { tr: 'Sonia Nail Bar çalışması: mavi kaplumbağa, deniz kabuğu ve altın detaylı tırnak tasarımı', en: 'Sonia Nail Bar work: nail art with blue turtles, shell textures and gold details', ru: 'Работа Sonia Nail Bar: дизайн ногтей с синими черепахами, ракушками и золотистыми деталями' } },
  lashes: { src: lashes, kind: 'portfolio', alt: { tr: 'Sonia Nail Bar çalışması: kıvrımlı kirpiklerin göz açık yakın çekimi', en: 'Sonia Nail Bar work: open-eye close-up of curled lashes', ru: 'Работа Sonia Nail Bar: изогнутые ресницы крупным планом с открытым глазом' } },
  brows: { src: brows, kind: 'portfolio', alt: { tr: 'Sonia Nail Bar çalışması: taranmış kaşların ve kirpiklerin yakın çekimi', en: 'Sonia Nail Bar work: close-up of brushed brows and lashes', ru: 'Работа Sonia Nail Bar: уложенные брови и ресницы крупным планом' } },
  lashDetail: { src: lashDetail, kind: 'portfolio', alt: { tr: 'Sonia Nail Bar çalışması: göz kapalı iki kirpik yakın çekiminden oluşan kolaj', en: 'Sonia Nail Bar work: a pair of closed-eye lash close-ups', ru: 'Работа Sonia Nail Bar: коллаж из двух крупных планов ресниц с закрытыми глазами' } },
  salonConcept: { src: salonConcept, kind: 'support', alt: { tr: 'Üretilmiş pembe salon konsepti; gerçek salon fotoğrafı değildir', en: 'Generated pink salon concept; not a photograph of the actual salon', ru: 'Сгенерированная концепция розового салона; не фотография реального интерьера' } },
  floralSatin: { src: floralSatin, kind: 'support', alt: { tr: 'Pembe saten, çiçekler ve bordo kurdelelerden oluşan üretilmiş dekoratif kompozisyon', en: 'Generated decorative composition of pink satin, flowers and burgundy ribbons', ru: 'Сгенерированная декоративная композиция с розовым атласом, цветами и бордовыми лентами' } },
  editorialManicure: { src: editorialManicure, kind: 'support', alt: { tr: 'Çiçekler arasında pembe manikürün üretilmiş editoryal görseli; salon portfolyosu değildir', en: 'Generated editorial image of a pink manicure among flowers; not salon portfolio work', ru: 'Сгенерированное постановочное изображение розового маникюра среди цветов; не работа из портфолио салона' } },
} satisfies Record<string, SalonImage>

/** Pedicure uses generated illustrative imagery, never real portfolio evidence. */
export const serviceCategoryMedia: Partial<Record<ServiceCategoryId, SalonImage>> = {
  manicure: salonMedia.nails, pedicure: salonMedia.editorialPedicure,
  lashes: salonMedia.lashes, nailArt: salonMedia.nailArt,
  permanentMakeup: salonMedia.makeupConcept, laser: salonMedia.laserConcept, skinCare: salonMedia.skinConcept,
}
