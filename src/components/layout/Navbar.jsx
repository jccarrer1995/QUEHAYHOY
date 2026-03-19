/**
 * Navbar - QUEHAYHOY
 * Mobile: hamburger, logo, campana | Desktop: logo, search, nav, campana, tema
 * Login con Google: botón "Iniciar sesión" cuando no hay usuario
 */
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

const ACCENT = 'text-[#14b8a6] dark:text-[#14b8a6]'

export function Navbar({ searchValue = '', onSearchChange }) {
  const { theme, toggleTheme } = useTheme()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const bgColor = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'

  const searchInputCls =
    'w-full pl-4 pr-10 py-2.5 md:py-2 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border-0 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-500 focus:ring-2 focus:ring-[#14b8a6]'

  return (
    <header className={`sticky top-0 z-50 border-b ${borderColor} ${bgColor}`}>
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Hamburger - solo móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo QUEHAYHOY - QUEHAY negro, HOY teal */}
          <h1 className="flex-1 md:flex-none text-center md:text-left text-xl font-bold tracking-tight">
            <span className={textColor}>QUEHAY</span>
            <span className={ACCENT}>HOY</span>
          </h1>

          {/* Desktop: búsqueda integrada en header */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="search"
                placeholder="¿Qué quieres hacer hoy en Guayaquil?"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={searchInputCls}
                aria-label="Buscar"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Derecha: login/user, campana, tema (desktop) */}
          <div className="flex items-center gap-1">
            {!authLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${textColor} hidden sm:inline truncate max-w-[100px]`}>
                    {user.displayName?.split(' ')[0] ?? user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="px-3 py-1.5 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setLoginLoading(true)
                    try {
                      await signInWithGoogle()
                      setMenuOpen(false)
                    } finally {
                      setLoginLoading(false)
                    }
                  }}
                  disabled={loginLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl bg-[#14b8a6] text-white hover:bg-[#0d9488] disabled:opacity-70"
                >
                  {loginLoading ? '...' : 'Iniciar sesión'}
                </button>
              )
            )}
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notificaciones"
            >
              <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Buscador móvil - debajo del header */}
        <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="search"
                placeholder="¿Qué quieres hacer hoy en Guayaquil?"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border-0 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-500 focus:ring-2 focus:ring-[#14b8a6]"
                aria-label="Buscar"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

        {/* Menú hamburger desplegable */}
        {menuOpen && (
          <div className="md:hidden mt-3 py-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              {!authLoading && (
                user ? (
                  <>
                    <span className={`px-3 py-2 text-sm ${textColor}`}>
                      {user.displayName ?? user.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setLoginLoading(true)
                      try {
                        await signInWithGoogle()
                        setMenuOpen(false)
                      } finally {
                        setLoginLoading(false)
                      }
                    }}
                    disabled={loginLoading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14b8a6] text-white font-medium disabled:opacity-70"
                  >
                    {loginLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
              >
                {isDark ? '☀️ Modo claro' : '🌙 Modo oscuro'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
