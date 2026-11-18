export const PROTOTYPE_UPDATED = 'sonia-nail-bar:prototype-updated'
export const BOOKING_LOCK = 'sonia-nail-bar:prototype:appointments'

export async function withBookingLock<T>(operation: () => T | Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(BOOKING_LOCK, operation)
  return operation()
}
export function notifyPrototypeUpdate() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event(PROTOTYPE_UPDATED))
}
