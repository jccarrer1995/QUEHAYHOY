import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { isAdministratorRole } from '../../lib/organizerPlans.js'

/**
 * Solo usuarios con rol Admin.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function RequireAdministrator({ children }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center bg-[#0a0a0a] text-zinc-300">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-400"
          aria-label="Cargando"
        />
      </div>
    )
  }

  if (!user || !isAdministratorRole(role)) {
    return <Navigate to="/perfil" replace state={{ from: location.pathname }} />
  }

  return children
}
