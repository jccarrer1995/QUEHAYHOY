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
import { FavoriteEventsPage } from './pages/FavoriteEventsPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { FavoriteSectorsPage } from './pages/FavoriteSectorsPage.jsx'
import { FavoriteCategoriesPage } from './pages/FavoriteCategoriesPage.jsx'
import { ExplorePage } from './pages/ExplorePage.jsx'
import { MisEventosPage } from './pages/MisEventosPage.jsx'
import { MisEventosCrearPage } from './pages/MisEventosCrearPage.jsx'
import { OrganizadorBenefitsPage } from './pages/OrganizadorBenefitsPage.jsx'
import { OrganizadorPlansPage } from './pages/OrganizadorPlansPage.jsx'
import { RequireOrganizador } from './components/auth/RequireOrganizador.jsx'
import { CategoryVisibilityProvider } from './contexts/CategoryVisibilityContext.jsx'
import { FavoriteEventsProvider } from './contexts/FavoriteEventsContext.jsx'
import { FavoriteLoginPromptProvider } from './contexts/FavoriteLoginPromptContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SectorVisibilityProvider } from './contexts/SectorVisibilityContext.jsx'
import { AppToaster } from './components/layout/AppToaster.jsx'

const routerBasename = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <ThemeProvider>
        <AuthProvider>
          <CategoryVisibilityProvider>
            <FavoriteEventsProvider>
              <FavoriteLoginPromptProvider>
              <SectorVisibilityProvider>
                <AppToaster />
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/favoritos" element={<FavoriteEventsPage />} />
                  <Route
                    path="/mis-eventos/crear"
                    element={
                      <RequireOrganizador>
                        <MisEventosCrearPage />
                      </RequireOrganizador>
                    }
                  />
                  <Route path="/mis-eventos" element={<MisEventosPage />} />
                  <Route path="/explorar" element={<ExplorePage />} />
                  <Route path="/coleccion/:id" element={<CollectionPage />} />
                  <Route path="/legal/:slug" element={<LegalPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/perfil/sectores" element={<FavoriteSectorsPage />} />
                  <Route path="/perfil/categorias" element={<FavoriteCategoriesPage />} />
                  <Route path="/evento/:categoria/:slug" element={<EventDetailPage />} />
                  <Route path="/evento/:id" element={<EventDetailPage />} />
                  <Route path="/onboarding-organizador" element={<OrganizadorBenefitsPage />} />
                  <Route path="/onboarding-organizador/planes" element={<OrganizadorPlansPage />} />
                  <Route
                    path="/wp-admin"
                    element={
                      <RequireOrganizador>
                        <AdminDashboard />
                      </RequireOrganizador>
                    }
                  />
                  <Route
                    path="/wp-admin/nuevo"
                    element={
                      <RequireOrganizador>
                        <AdminEventForm />
                      </RequireOrganizador>
                    }
                  />
                  <Route
                    path="/wp-admin/editar/:eventId"
                    element={
                      <RequireOrganizador>
                        <AdminEventForm />
                      </RequireOrganizador>
                    }
                  />
                </Routes>
              </SectorVisibilityProvider>
              </FavoriteLoginPromptProvider>
            </FavoriteEventsProvider>
          </CategoryVisibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
