import { Globe2 } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { isLanguage, languageOptions } from '../i18n/config'

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()
  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
      <Globe2 size={16} aria-hidden="true" />
      <span className="sr-only">{t.common.language}</span>
      <select className="min-h-11 max-w-32 cursor-pointer bg-transparent pr-1" value={language}
        onChange={(event) => { if (isLanguage(event.target.value)) setLanguage(event.target.value) }}>
        {languageOptions.map(({ code, label }) => <option key={code} value={code} lang={code}>{label}</option>)}
      </select>
    </label>
  )
}
