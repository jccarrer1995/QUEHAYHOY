import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminEventForm } from './pages/AdminEventForm.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'
import { EventDetailPage } from './pages/EventDetailPage.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AppToaster } from './components/layout/AppToaster.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppToaster />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/evento/:id" element={<EventDetailPage />} />
            <Route path="/wp-admin" element={<AdminDashboard />} />
            <Route path="/wp-admin/nuevo" element={<AdminEventForm />} />
            <Route path="/wp-admin/editar/:eventId" element={<AdminEventForm />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
