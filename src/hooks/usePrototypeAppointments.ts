import { useCallback, useEffect, useState } from 'react'
import { appointmentStore, subscribeToAppointmentChanges } from '../lib/appointmentStore'

export function usePrototypeAppointments() {
  const [snapshot, setSnapshot] = useState(() => appointmentStore.readResult())
  const refresh = useCallback(() => setSnapshot(appointmentStore.readResult()), [])
  useEffect(() => subscribeToAppointmentChanges(refresh), [refresh])
  return { appointments: snapshot.ok ? snapshot.value ?? [] : [], storageReady: snapshot.ok, refresh }
}
