import { ArrowLeft, CalendarOff, ChartNoAxesCombined, LayoutDashboard, Settings } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LanguageSelector } from '../components/LanguageSelector'
import { useI18n } from '../hooks/useI18n'

export function ManagerLayout() {
  const { t } = useI18n()
  const links = [
    { to: '/admin', label: t.manager.overview, Icon: LayoutDashboard },
    { to: '/admin/analytics', label: t.manager.analytics, Icon: ChartNoAxesCombined },
    { to: '/admin/closures', label: t.manager.closures, Icon: CalendarOff },
    { to: '/admin/settings', label: t.manager.settings, Icon: Settings },
  ]
  return (
    <div className="manager-layout min-h-svh bg-neutral xl:grid xl:grid-cols-[13rem_minmax(0,1fr)]">
      <a href="#main-content" className="skip-link">{t.common.skip}</a>
      <aside className="manager-sidebar border-b border-line bg-ivory xl:border-r xl:border-b-0">
        <div className="manager-sidebar-top"><Brand /><Link to="/" className="nav-link flex items-center gap-2 text-sm"><ArrowLeft size={16} aria-hidden="true" />{t.common.back}</Link></div>
        <nav aria-label={t.manager.navigation} className="manager-navigation">
          {links.map(({ to, label, Icon }) => <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-12 min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-pink font-semibold text-burgundy' : 'hover:bg-blush'}`}><Icon size={18} className="shrink-0" aria-hidden="true" /><span className="min-w-0">{label}</span></NavLink>)}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ivory px-5 py-3 sm:px-8"><span className="demo-label font-semibold">{t.manager.demo}</span><LanguageSelector /></header>
        <div className="border-b border-line bg-blush px-5 py-3 text-xs leading-6 text-burgundy sm:px-8">{t.manager.notice}</div>
        <main id="main-content" tabIndex={-1} className="px-5 pb-10 sm:px-8"><Outlet /></main>
      </div>
    </div>
  )
}
