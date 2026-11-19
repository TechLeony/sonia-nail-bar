import { Clock3 } from 'lucide-react'
import type { Service } from '../types/domain'
import { useI18n } from '../hooks/useI18n'
import { formatServicePrice } from '../lib/catalogue'

export function ServiceFacts({ service, compact = false }: { service: Service; compact?: boolean }) {
  const { language, t } = useI18n()
  const copy = t.catalogue.services
  return (
    <dl className="service-facts">
      <div>
        <dt>{!compact && service.durationMinutes !== null && service.illustrative ? copy.duration : copy.actualDuration}</dt>
        <dd><Clock3 size={15} aria-hidden="true" />{service.durationMinutes === null ? copy.durationPending : `${service.durationMinutes} ${copy.minutes}`}</dd>
      </div>
      <div>
        <dt>{!compact && service.priceMinor !== null && service.illustrative ? copy.price : copy.actualPrice}</dt>
        <dd>{formatServicePrice(service, language, copy.pricePending)}</dd>
      </div>
    </dl>
  )
}
