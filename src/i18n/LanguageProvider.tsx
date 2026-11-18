import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { I18nContext } from './context'
import { defaultLanguage, languageStorage } from './config'
import { translations } from './translations'
import type { Language } from '../types/domain'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() => languageStorage.read(defaultLanguage))

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  function setLanguage(next: Language) {
    updateLanguage(next)
    languageStorage.write(next)
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  )
}
