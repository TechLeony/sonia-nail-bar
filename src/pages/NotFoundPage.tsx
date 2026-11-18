import { Link } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { useI18n } from '../hooks/useI18n'

export function NotFoundPage() {
  const { t } = useI18n()
  return <PageIntro eyebrow="404" {...t.pages.notFound}><Link to="/" className="button-primary mt-8">{t.nav.home}</Link></PageIntro>
}
