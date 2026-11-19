import { useI18n } from '../hooks/useI18n'
import type { BookingDayAvailability } from '../lib/availability'
import { normalizeClosureDescription } from '../lib/closures'

export function BookingAvailabilityMessage({ availability }: { availability: BookingDayAvailability }) {
  const { t } = useI18n()
  if (availability.state === 'available') return null
  const custom = availability.state === 'explicitClosure' ? normalizeClosureDescription(availability.closure.reason.tr) : ''
  return <p role="status" lang={custom ? 'tr' : undefined} className="empty-state mt-3 break-words">
    {custom || t.booking.availability[availability.state]}
  </p>
}
