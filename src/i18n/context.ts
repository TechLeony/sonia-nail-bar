import { createContext } from 'react'
import type { Language } from '../types/domain'
import type { Translations } from './translations'

export interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translations
}
export const I18nContext = createContext<I18nContextValue | null>(null)
