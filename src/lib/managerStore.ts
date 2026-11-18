import type { BookingConfirmationMode, BookingSettings, SalonClosure, Service } from '../types/domain'
import { appointmentStore } from './appointmentStore'
import { applyAppointmentCommand } from './management'
import type { AppointmentCommand, ManagerResult } from './management'
import { isSalonClosure, readBookingSettings, salonPreferencesStore } from './salonSettingsStore'
import { notifyPrototypeUpdate, withBookingLock } from './prototypeSync'

export type ManagerCommand = { kind: 'appointment'; command: AppointmentCommand }
  | { kind: 'closure'; closure: SalonClosure; expected?: SalonClosure }
  | { kind: 'removeClosure'; expected: SalonClosure }
  | { kind: 'mode'; mode: BookingConfirmationMode }

export async function executeManagerCommand(command: ManagerCommand, services: Service[], base: BookingSettings): Promise<ManagerResult<true>> {
  try {
    return await withBookingLock((): ManagerResult<true> => {
      const records = appointmentStore.readResult()
      const current = readBookingSettings(base)
      if (!records.ok || !current.ok) return { ok: false, error: 'storage' }
      if (command.kind === 'appointment') {
        const result = applyAppointmentCommand(command.command, records.value ?? [], services, current.settings, Date.now(), crypto.randomUUID())
        if (!result.ok) return result
        if (!appointmentStore.write(result.value)) return { ok: false, error: 'storage' }
      } else {
        const preferences = { confirmationMode: current.settings.confirmationMode, closures: [...current.settings.closures] }
        if (command.kind === 'mode') {
          if (command.mode !== 'automatic' && command.mode !== 'manual') return { ok: false, error: 'configuration' }
          preferences.confirmationMode = command.mode
        } else {
          const expected = command.expected
          if (expected) {
            const stored = preferences.closures.find((entry) => entry.id === expected.id)
            if (!stored || JSON.stringify(stored) !== JSON.stringify(expected)) return { ok: false, error: 'stale' }
          }
          if (command.kind === 'removeClosure') preferences.closures = preferences.closures.filter((entry) => entry.id !== command.expected.id)
          else {
            if (!isSalonClosure(command.closure) || (expected && expected.id !== command.closure.id)) return { ok: false, error: 'closure' }
            if (!expected && preferences.closures.some((entry) => entry.id === command.closure.id)) return { ok: false, error: 'stale' }
            preferences.closures = [...preferences.closures.filter((entry) => entry.id !== command.closure.id), command.closure].sort((a, b) => a.startDate.localeCompare(b.startDate))
          }
        }
        if (!salonPreferencesStore.write(preferences)) return { ok: false, error: 'storage' }
      }
      notifyPrototypeUpdate()
      return { ok: true, value: true }
    })
  } catch { return { ok: false, error: 'storage' } }
}
