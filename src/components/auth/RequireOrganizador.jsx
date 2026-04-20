import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { canManageEventsRole } from '../../lib/organizerPlans.js'

/**
 * Usuarios con rol `organizador` o `administrador` en Firestore.
 * Si no hay sesión → `/perfil`. Si no puede gestionar eventos → onboarding.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function RequireOrganizador({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center bg-[#0a0a0a] text-zinc-300">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-400" aria-label="Cargando" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/perfil" replace state={{ from: location.pathname }} />
  }

  if (!canManageEventsRole(profile?.role)) {
    return <Navigate to="/onboarding-organizador" replace state={{ from: location.pathname }} />
  }

  return children
}
