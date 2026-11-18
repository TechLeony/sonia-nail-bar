/** Browser-only, disposable prototype persistence. Never authentication or a
 * production database. Booking demos may store fictional customer details only.
 */
const NAMESPACE = 'sonia-nail-bar:prototype:'
const VERSION = 1
type Validator<T> = (value: unknown) => value is T
export type StorageRead<T> = { ok: true; value: T | null } | { ok: false; reason: 'invalid' | 'version' | 'unavailable' }

export function createStorageEntry<T>(key: string, validate: Validator<T>) {
  const storageKey = `${NAMESPACE}${key}`
  function readResult(): StorageRead<T> {
    let raw: string | null
    try { raw = window.localStorage.getItem(storageKey) } catch { return { ok: false, reason: 'unavailable' } }
    if (raw === null) return { ok: true, value: null }
    try {
      const envelope: unknown = JSON.parse(raw)
      if (typeof envelope !== 'object' || envelope === null || !('version' in envelope)) return { ok: false, reason: 'invalid' }
      if (envelope.version !== VERSION) return { ok: false, reason: 'version' }
      if (!('data' in envelope) || !validate(envelope.data)) return { ok: false, reason: 'invalid' }
      return { ok: true, value: envelope.data }
    } catch { return { ok: false, reason: 'invalid' } }
  }
  return {
    key: storageKey,
    readResult,
    read(fallback: T): T {
      const result = readResult()
      return result.ok ? result.value ?? fallback : fallback
    },
    write(value: T): boolean {
      try {
        if (!validate(value)) return false
        window.localStorage.setItem(storageKey, JSON.stringify({ version: VERSION, data: value }))
        return true
      } catch { return false }
    },
    remove(): boolean {
      try { window.localStorage.removeItem(storageKey); return true } catch { return false }
    },
  }
}
