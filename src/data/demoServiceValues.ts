/** FICTIONAL prototype configuration, not Sonia's approved tariff or schedule.
 * Prices are integer kuruş; durations are minutes. No screenshot rates used.
 * Multi-session durations are illustrative totals across visits, not one slot.
 * Changing this table does NOT assign a specialist or enable online booking.
 */
export interface DemoServiceValues { priceMinor: number; durationMinutes: number }
export const demoServiceValues: Record<string, DemoServiceValues> = {
  'demo-manicure': { priceMinor: 50000, durationMinutes: 45 },
  'demo-gel-manicure': { priceMinor: 75000, durationMinutes: 75 },
  'demo-pedicure': { priceMinor: 65000, durationMinutes: 60 },
  'demo-lash-lift': { priceMinor: 90000, durationMinutes: 60 },
  'demo-minimal-art': { priceMinor: 25000, durationMinutes: 30 },
  'demo-floral-art': { priceMinor: 40000, durationMinutes: 45 },
  'menu-gel-polish': { priceMinor: 64500, durationMinutes: 45 },
  'menu-medical-manicure': { priceMinor: 56500, durationMinutes: 45 },
  'menu-nail-extensions': { priceMinor: 147500, durationMinutes: 120 },
  'menu-extension-maintenance': { priceMinor: 112500, durationMinutes: 90 },
  'menu-nail-art': { priceMinor: 32500, durationMinutes: 30 },
  'menu-3d-art': { priceMinor: 68500, durationMinutes: 60 },
  'menu-pedicure-polish-care': { priceMinor: 87500, durationMinutes: 90 },
  'menu-single-toe-extension': { priceMinor: 27500, durationMinutes: 30 },
  'menu-single-finger-extension': { priceMinor: 22500, durationMinutes: 30 },
  'menu-wet-medical-manicure': { priceMinor: 59500, durationMinutes: 45 },
  'menu-wet-medical-pedicure': { priceMinor: 79500, durationMinutes: 60 },
  'menu-removal': { priceMinor: 29500, durationMinutes: 30 },
  'menu-manicure-removal': { priceMinor: 69500, durationMinutes: 60 },
  'menu-japanese-manicure': { priceMinor: 74500, durationMinutes: 60 },
  'menu-polish-strengthening-combination': { priceMinor: 132500, durationMinutes: 105 },
  'menu-extension-combination': { priceMinor: 187500, durationMinutes: 150 },
  'menu-natural-lashes': { priceMinor: 137500, durationMinutes: 120 },
  'menu-medium-lashes': { priceMinor: 162500, durationMinutes: 150 },
  'menu-full-lashes': { priceMinor: 187500, durationMinutes: 150 },
  'menu-mega-lashes': { priceMinor: 227500, durationMinutes: 180 },
  'menu-brown-lash-addon': { priceMinor: 27500, durationMinutes: 15 },
  'menu-lash-maintenance': { priceMinor: 112500, durationMinutes: 90 },
  'menu-lash-removal': { priceMinor: 37500, durationMinutes: 30 },
  'menu-brow-lamination': { priceMinor: 92500, durationMinutes: 60 },
  'menu-microblading': { priceMinor: 365000, durationMinutes: 120 },
  'menu-lip-colour': { priceMinor: 417500, durationMinutes: 150 },
  'menu-eyeliner': { priceMinor: 337500, durationMinutes: 120 },
  'menu-lashline': { priceMinor: 287500, durationMinutes: 90 },
  'menu-hydrafacial-one': { priceMinor: 147500, durationMinutes: 60 },
  'menu-hydrafacial-three': { priceMinor: 397500, durationMinutes: 180 },
  'menu-ipl': { priceMinor: 77500, durationMinutes: 30 },
  'menu-diode': { priceMinor: 92500, durationMinutes: 45 },
}
export function demoValuesFor(id: string): DemoServiceValues {
  const values = demoServiceValues[id]
  if (!values) throw new Error(`Missing demo service values: ${id}`)
  return { ...values }
}
