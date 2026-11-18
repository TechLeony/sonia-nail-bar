import { useCallback, useEffect, useState } from 'react'
import { appointmentStore } from '../lib/appointmentStore'
import { PROTOTYPE_UPDATED } from '../lib/prototypeSync'

export function usePrototypeAppointments() {
  const [snapshot, setSnapshot] = useState(() => appointmentStore.readResult())
  const refresh = useCallback(() => setSnapshot(appointmentStore.readResult()), [])
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === appointmentStore.key || event.key === null) refresh() }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refresh)
    window.addEventListener(PROTOTYPE_UPDATED, refresh)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', refresh); window.removeEventListener(PROTOTYPE_UPDATED, refresh) }
  }, [refresh])
  return { appointments: snapshot.ok ? snapshot.value ?? [] : [], storageReady: snapshot.ok, refresh }
}
