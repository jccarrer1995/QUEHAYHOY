/**
 * BottomNav - Navegación inferior móvil. Admin: Inicio, Eventos, Moderación, Perfil.
 */
import { CalendarDays, Compass, Heart, House, ShieldCheck, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext'
import { canManageEventsRole, isAdministratorRole } from '../../lib/organizerPlans.js'

const ICON_STROKE = 2

export function BottomNav({ activeTab = 'home', onTabChange }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { role } = useAuth()
  const canManageEvents = canManageEventsRole(role)
  const isAdmin = isAdministratorRole(role)
  const isDark = theme === 'dark'
  const accentCl = 'text-[#14b8a6]'
  const mutedCl = 'text-gray-400'
  const safeAreaDockStyle = {
    bottom: 'calc(env(safe-area-inset-bottom, 0px) * -1)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  }

  const items = isAdmin
    ? [
        { id: 'home', label: 'Inicio', icon: House, active: activeTab === 'home' },
        {
          id: 'myEvents',
          label: 'Eventos',
          icon: CalendarDays,
          active: activeTab === 'myEvents',
        },
        {
          id: 'moderation',
          label: 'Moderación',
          icon: ShieldCheck,
          active: activeTab === 'moderation',
        },
        { id: 'profile', label: 'Perfil', icon: User, active: activeTab === 'profile' },
      ]
    : canManageEvents
      ? [
          { id: 'home', label: 'Inicio', icon: House, active: activeTab === 'home' },
          { id: 'explore', label: 'Explorar', icon: Compass, active: activeTab === 'explore' },
          {
            id: 'myEvents',
            label: 'Mis Eventos',
            icon: CalendarDays,
            active: activeTab === 'myEvents',
          },
          { id: 'favorites', label: 'Favoritos', icon: Heart, active: activeTab === 'favorites' },
          { id: 'profile', label: 'Perfil', icon: User, active: activeTab === 'profile' },
        ]
      : [
          { id: 'home', label: 'Inicio', icon: House, active: activeTab === 'home' },
          { id: 'explore', label: 'Explorar', icon: Compass, active: activeTab === 'explore' },
          { id: 'favorites', label: 'Favoritos', icon: Heart, active: activeTab === 'favorites' },
          { id: 'profile', label: 'Perfil', icon: User, active: activeTab === 'profile' },
        ]

  function handleItemClick(id) {
    if (id === 'home') {
      navigate('/')
      onTabChange?.('home')
      return
    }
    if (id === 'explore') {
      navigate('/explorar')
      onTabChange?.('explore')
      return
    }
    if (id === 'myEvents') {
      navigate('/mis-eventos')
      onTabChange?.('myEvents')
      return
    }
    if (id === 'moderation') {
      navigate('/admin/moderacion')
      onTabChange?.('moderation')
      return
    }
    if (id === 'favorites') {
      navigate('/favoritos')
      onTabChange?.('favorites')
      return
    }
    if (id === 'profile') {
      navigate('/perfil')
      onTabChange?.('profile')
    }
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t md:hidden ${
        isDark ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'
      }`}
      style={safeAreaDockStyle}
    >
      <div className="flex items-stretch justify-between gap-0 px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2"
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${item.active ? accentCl : mutedCl}`}
                strokeWidth={ICON_STROKE}
                aria-hidden
              />
              <span
                className={`max-w-full text-center text-[11px] leading-tight sm:text-xs ${
                  item.active ? accentCl : mutedCl
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
