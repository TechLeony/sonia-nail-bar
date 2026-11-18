import { createStorageEntry } from '../lib/storage'
import type { Language } from '../types/domain'

export const defaultLanguage: Language = 'tr'
export const languageOptions: { code: Language; label: string }[] = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]
export function isLanguage(value: unknown): value is Language {
  return value === 'tr' || value === 'en' || value === 'ru'
}
export const languageStorage = createStorageEntry('language', isLanguage)
