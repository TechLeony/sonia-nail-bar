import { Link } from 'react-router-dom'
import { salonConfig } from '../data/salon'
import { BrandMotif } from './BrandMotif'

export function Brand() {
  return (
    <Link to="/" aria-label={salonConfig.name} className="brand">
      <BrandMotif className="brand-bow" />
      <span className="brand-name">SONIA</span>
      <span className="brand-caption">NAIL BAR</span>
    </Link>
  )
}
