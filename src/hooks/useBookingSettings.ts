import { useCallback, useEffect, useState } from 'react'
import { bookingSettings } from '../data/booking'
import { readBookingSettings, salonPreferencesStore } from '../lib/salonSettingsStore'
import { PROTOTYPE_UPDATED } from '../lib/prototypeSync'

export function useBookingSettings() {
  const [snapshot, setSnapshot] = useState(() => readBookingSettings(bookingSettings))
  const refreshSettings = useCallback(() => setSnapshot(readBookingSettings(bookingSettings)), [])
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === salonPreferencesStore.key || event.key === null) refreshSettings() }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refreshSettings)
    window.addEventListener(PROTOTYPE_UPDATED, refreshSettings)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', refreshSettings)
      window.removeEventListener(PROTOTYPE_UPDATED, refreshSettings)
    }
  }, [refreshSettings])
  return { settings: snapshot.ok ? snapshot.settings : bookingSettings, settingsReady: snapshot.ok, refreshSettings }
}
