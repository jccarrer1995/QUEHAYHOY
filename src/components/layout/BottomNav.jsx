/**
 * BottomNav - Navegación inferior móvil: Home, Explore, Notificaciones, Perfil
 */
export function BottomNav({ activeTab = 'home', onTabChange, hasNotifications = true }) {
  const accentCl = 'text-[#14b8a6]'
  const mutedCl = 'text-gray-400'

  const items = [
    { id: 'home', label: 'Inicio', icon: HomeIcon, active: activeTab === 'home' },
    { id: 'explore', label: 'Explorar', icon: CompassIcon, active: activeTab === 'explore' },
    { id: 'notifications', label: 'Notificaciones', icon: BellIcon, active: activeTab === 'notifications', dot: hasNotifications },
    { id: 'profile', label: 'Perfil', icon: UserIcon, active: activeTab === 'profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(({ id, label, icon: Icon, active, dot }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange?.(id)}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <span className="relative">
              <Icon className={`w-6 h-6 ${active ? accentCl : mutedCl}`} />
              {dot && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className={`text-xs ${active ? accentCl : mutedCl}`}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13z" />
    </svg>
  )
}
function CompassIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}
function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default BottomNav
