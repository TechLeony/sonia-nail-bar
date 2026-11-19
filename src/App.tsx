import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RouteScrollRestoration } from './components/RouteScrollRestoration'
import { LanguageProvider } from './i18n/LanguageProvider'
import { PublicLayout } from './layouts/PublicLayout'
import { ManagerLayout } from './layouts/ManagerLayout'
import { HomePage } from './pages/HomePage'
import { ServicesPage } from './pages/ServicesPage'
import { GalleryPage } from './pages/GalleryPage'
import { BookingPage } from './pages/BookingPage'
import { ManagerPage } from './pages/ManagerPage'
import { ManagerAnalyticsPage } from './pages/ManagerAnalyticsPage'
import { ManagerClosuresPage } from './pages/ManagerClosuresPage'
import { ManagerSettingsPage } from './pages/ManagerSettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRoutes() {
  return (
    <><RouteScrollRestoration /><Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin" element={<ManagerLayout />}>
        <Route index element={<ManagerPage />} />
        <Route path="analytics" element={<ManagerAnalyticsPage />} />
        <Route path="closures" element={<ManagerClosuresPage />} />
        <Route path="settings" element={<ManagerSettingsPage />} />
      </Route>
    </Routes></>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter><AppRoutes /></BrowserRouter>
    </LanguageProvider>
  )
}
