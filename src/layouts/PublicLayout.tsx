import { useRef, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LanguageSelector } from '../components/LanguageSelector'
import { useI18n } from '../hooks/useI18n'

export function PublicLayout() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const links = [ ['/', t.nav.home], ['/services', t.nav.services], ['/gallery', t.nav.gallery] ]
  const navLinks = links.map(([path, label]) => (
    <NavLink key={path} to={path} end onClick={() => setMenuOpen(false)}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{label}</NavLink>
  ))
  return (
    <div className="flex min-h-svh flex-col bg-ivory">
      <a href="#main-content" className="skip-link">{t.common.skip}</a>
      <header className="public-header" onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false)
          menuButton.current?.focus()
        }
      }}>
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-3">
          <Brand />
          <nav aria-label={t.homepage.navigation} className="hidden items-center gap-7 lg:flex">{navLinks}</nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSelector />
            <Link to="/booking" onClick={() => setMenuOpen(false)} className="button-primary hidden sm:inline-flex">
              {t.homepage.book}<ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <button type="button" ref={menuButton} aria-expanded={menuOpen} aria-controls="mobile-navigation"
              aria-label={menuOpen ? t.homepage.closeMenu : t.homepage.openMenu}
              className="flex size-11 items-center justify-center rounded-full border border-line lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
          <Link to="/booking" onClick={() => setMenuOpen(false)} className="button-primary w-full sm:hidden">
            {t.homepage.book}<ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <nav id="mobile-navigation" aria-label={t.homepage.navigation} hidden={!menuOpen}
            className="w-full border-t border-line pt-3 lg:hidden">
            <div className="flex flex-col items-start gap-1">{navLinks}</div>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={pathname === '/' ? 'flex-1' : 'page-container flex-1'}><Outlet /></main>
      <footer className="public-footer">
        <div className="page-container py-8 sm:py-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex flex-col items-start gap-4">
              <Brand />
              <p className="text-sm text-muted">{t.homepage.footer.line}</p>
              <p className="text-xs text-muted">{t.common.location}</p>
            </div>
            <nav aria-label={t.homepage.footer.navigation} className="flex flex-wrap gap-x-6 gap-y-1">
              {links.map(([path, label]) => <Link key={path} to={path} className="nav-link">{label}</Link>)}
              <Link to="/booking" className="nav-link">{t.nav.booking}</Link>
            </nav>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-line pt-5 text-xs leading-6 text-muted sm:flex-row">
            <p>© Sonia Nail Bar · {t.homepage.footer.prototype}</p>
            <Link className="nav-link self-start text-xs" to="/admin">{t.nav.admin}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
