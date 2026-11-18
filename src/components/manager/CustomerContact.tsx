import { useState } from 'react'
import { Copy } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { customerWhatsAppHref } from '../../lib/management'

export function CustomerContact({ phone }: { phone: string }) {
  const { t } = useI18n()
  const [message, setMessage] = useState('')
  const href = customerWhatsAppHref(phone)
  async function copy() {
    try { await navigator.clipboard.writeText(phone); setMessage('copied') } catch { setMessage('copyFailed') }
  }
  return <div className="space-y-1 text-sm">
    <p className="select-text break-all">{phone}</p>
    <div className="flex flex-wrap gap-x-3"><button type="button" className="manager-text-button" onClick={() => void copy()}><Copy size={13} aria-hidden="true" />{t.manager.copy}</button>{href && <a href={href} target="_blank" rel="noopener noreferrer" className="manager-text-button">{t.manager.whatsapp}</a>}</div>
    <p role="status" className="text-xs text-muted">{message === 'copied' ? t.manager.copied : message === 'copyFailed' ? t.manager.copyFailed : ''}</p>
  </div>
}
