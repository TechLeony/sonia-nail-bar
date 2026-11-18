import { ArrowLeft, CalendarOff, LayoutDashboard, Settings } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LanguageSelector } from '../components/LanguageSelector'
import { useI18n } from '../hooks/useI18n'

export function ManagerLayout() {
  const { t } = useI18n()
  const links = [
    { to: '/admin', label: t.manager.overview, Icon: LayoutDashboard },
    { to: '/admin/closures', label: t.manager.closures, Icon: CalendarOff },
    { to: '/admin/settings', label: t.manager.settings, Icon: Settings },
  ]
  return (
    <div className="min-h-svh bg-neutral lg:grid lg:grid-cols-[15rem_1fr]">
      <a href="#main-content" className="skip-link">{t.common.skip}</a>
      <aside className="flex flex-col gap-5 border-b border-line bg-ivory p-5 lg:border-r lg:border-b-0 lg:p-7">
        <Brand />
        <nav aria-label={t.manager.navigation} className="flex flex-wrap gap-2 lg:mt-4 lg:flex-col">
          {links.map(({ to, label, Icon }) => <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? 'bg-pink font-semibold text-burgundy' : 'hover:bg-blush'}`}><Icon size={18} aria-hidden="true" />{label}</NavLink>)}
        </nav>
        <Link to="/" className="nav-link mt-auto flex items-center gap-2 text-sm"><ArrowLeft size={16} aria-hidden="true" />{t.common.back}</Link>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ivory px-5 py-3 sm:px-8"><span className="demo-label font-semibold">{t.manager.demo}</span><LanguageSelector /></header>
        <div className="border-b border-line bg-blush px-5 py-3 text-xs leading-6 text-burgundy sm:px-8">{t.manager.notice}</div>
        <main id="main-content" tabIndex={-1} className="px-5 pb-10 sm:px-8"><Outlet /></main>
      </div>
    </div>
  )
}
