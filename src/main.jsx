import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminEventForm } from './pages/AdminEventForm.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'
import { EventDetailPage } from './pages/EventDetailPage.jsx'
import { CollectionPage } from './pages/CollectionPage.jsx'
import { LegalPage } from './pages/LegalPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { FavoriteSectorsPage } from './pages/FavoriteSectorsPage.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SectorVisibilityProvider } from './contexts/SectorVisibilityContext.jsx'
import { AppToaster } from './components/layout/AppToaster.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <SectorVisibilityProvider>
            <AppToaster />
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/coleccion/:id" element={<CollectionPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/perfil/sectores" element={<FavoriteSectorsPage />} />
              <Route path="/evento/:categoria/:slug" element={<EventDetailPage />} />
              <Route path="/evento/:id" element={<EventDetailPage />} />
              <Route path="/wp-admin" element={<AdminDashboard />} />
              <Route path="/wp-admin/nuevo" element={<AdminEventForm />} />
              <Route path="/wp-admin/editar/:eventId" element={<AdminEventForm />} />
            </Routes>
          </SectorVisibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
