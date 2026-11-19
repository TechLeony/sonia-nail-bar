import { useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import { useBookingClock } from '../hooks/useBookingClock'
import { usePrototypeAppointments } from '../hooks/usePrototypeAppointments'
import { bookingSettings } from '../data/booking'
import { catalogueServices } from '../data/services'
import { analyticsMetrics, reportingPeriods, reportingRange } from '../lib/analytics'
import type { ReportingPeriod } from '../lib/analytics'
import { formatBookingDate, zonedParts } from '../lib/bookingTime'

export function ManagerAnalyticsPage() {
  const { t, language } = useI18n()
  const copy = t.analytics
  const { now } = useBookingClock()
  const { appointments, storageReady } = usePrototypeAppointments()
  const zone = bookingSettings.timeZone
  const today = zonedParts(now, zone).date
  const [period, setPeriod] = useState<ReportingPeriod>('thisWeek')
  const [custom, setCustom] = useState({ startDate: today, endDate: today })
  const selection = reportingRange(period, now, zone, custom)
  const metrics = selection.ok && storageReady ? analyticsMetrics(appointments, catalogueServices, selection.range, zone) : null
  const money = new Intl.NumberFormat({ tr: 'tr-TR', en: 'en-GB', ru: 'ru-RU' }[language], { style: 'currency', currency: 'TRY' })
  return <div className="py-8 sm:py-10">
    <header><h1 className="font-display text-4xl text-burgundy">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
    <section aria-label={copy.period} className="my-7 rounded-2xl border border-line bg-ivory p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div><label htmlFor="analytics-period" className="form-label">{copy.period}</label><select id="analytics-period" className="form-input" value={period} onChange={(event) => {
          const value = event.target.value
          if (reportingPeriods.some((entry) => entry === value)) setPeriod(value as ReportingPeriod)
        }}>{reportingPeriods.map((entry) => <option key={entry} value={entry}>{copy.periods[entry]}</option>)}</select></div>
        {period === 'custom' && <>
          <div><label htmlFor="analytics-start" className="form-label">{copy.startDate}</label><input type="date" id="analytics-start" className="form-input" value={custom.startDate} aria-invalid={!selection.ok} aria-describedby={!selection.ok ? 'analytics-range-error' : undefined} onChange={(event) => setCustom({ ...custom, startDate: event.target.value })} /></div>
          <div><label htmlFor="analytics-end" className="form-label">{copy.endDate}</label><input type="date" id="analytics-end" className="form-input" value={custom.endDate} min={custom.startDate || undefined} aria-invalid={!selection.ok} aria-describedby={!selection.ok ? 'analytics-range-error' : undefined} onChange={(event) => setCustom({ ...custom, endDate: event.target.value })} /></div>
        </>}
      </div>
      <p className="mt-4 text-xs leading-6 text-muted">{copy.rangeNote}</p>
      {selection.ok ? <p role="status" className="mt-3 text-sm font-medium text-burgundy">{formatBookingDate(selection.range.startDate, language, zone, true)} – {formatBookingDate(selection.range.endDate, language, zone, true)}</p> : <p id="analytics-range-error" role="alert" className="field-error mt-3">{copy[selection.error]}</p>}
    </section>
    {!storageReady && <p role="alert" className="prototype-notice">{copy.unavailable}</p>}
    {metrics && <>
      {!metrics.created && !metrics.scheduled && !metrics.completedEvents && !metrics.cancelledEvents && !metrics.valuedCount && !metrics.missingPriceCount && <p role="status" className="empty-state mb-6">{copy.empty}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{([
        ['created', copy.created, copy.createdNote], ['scheduled', copy.scheduled, copy.scheduledNote],
        ['completedEvents', copy.completedEvents, copy.completedNote], ['cancelledEvents', copy.cancelledEvents, copy.cancelledNote],
      ] as const).map(([key, label, note]) => <section key={key} className="min-w-0 rounded-2xl border border-line bg-ivory p-5">
        <h2 className="text-sm font-semibold text-burgundy">{label}</h2><p className="mt-3 text-3xl font-semibold text-burgundy">{metrics[key]}</p><p className="mt-3 text-xs leading-6 text-muted">{note}</p>
      </section>)}</div>
      <section aria-labelledby="analytics-statuses" className="my-6 rounded-2xl border border-line bg-ivory p-5 sm:p-6">
        <h2 id="analytics-statuses" className="text-xl font-semibold text-burgundy">{copy.breakdown}</h2><p className="mt-3 text-sm leading-6 text-muted">{copy.breakdownNote}</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => <div key={status} className="rounded-xl bg-blush p-4"><dt className="text-sm text-burgundy">{t.manager.statuses[status]}</dt><dd className="mt-2 text-2xl font-semibold text-burgundy">{metrics.statuses[status]}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="analytics-value" className="rounded-2xl border border-rose bg-blush p-5 sm:p-6">
        <h2 id="analytics-value" className="text-xl font-semibold text-burgundy">{copy.revenue}</h2><p className="mt-4 break-words text-3xl font-semibold text-burgundy">{money.format(metrics.estimatedValueMinor / 100)}</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-burgundy">{copy.revenueNote}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{copy.revenueBasis}</p><p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{copy.priceBasis}</p>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">{([
          [copy.valuedCount, metrics.valuedCount], [copy.scheduledFallback, metrics.scheduledFallbackCount], [copy.currentPrice, metrics.currentPriceCount], [copy.missingPrice, metrics.missingPriceCount],
        ] as const).map(([label, value]) => <div key={label}><dt className="text-xs leading-6 text-muted">{label}</dt><dd className="mt-1 font-semibold text-burgundy">{value}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="analytics-history" className="mt-6 rounded-2xl border border-line bg-ivory p-5 sm:p-6">
        <h2 id="analytics-history" className="font-semibold text-burgundy">{copy.history}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{copy.historyNote}</p>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">{([[copy.unknownCompleted, metrics.unknownCompletionDates], [copy.unknownCancelled, metrics.unknownCancellationDates]] as const).map(([label, value]) => <div key={label}><dt className="text-xs leading-6 text-muted">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
      </section>
    </>}
  </div>
}
