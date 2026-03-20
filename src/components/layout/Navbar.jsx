/**
 * Navbar - QUEHAYHOY
 * Mobile: hamburger, logo, campana | Desktop: logo, search, nav, campana, tema
 * QuickFilters (pills) debajo del buscador
 */
import { useTheme } from '../../contexts/ThemeContext.jsx'

const ACCENT = 'text-[#14b8a6] dark:text-[#14b8a6]'

export function Navbar({ searchValue = '', onSearchChange }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const bgColor = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'

  const searchInputCls = isDark
    ? 'w-full pl-4 pr-10 py-2.5 md:py-2 rounded-2xl bg-[#1e1e1e] border border-gray-700 text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]'
    : 'w-full pl-4 pr-10 py-2.5 md:py-2 rounded-2xl bg-[#f5f5f5] border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]'

  return (
    <header className={`sticky top-0 z-50 border-b ${borderColor} ${bgColor}`}>
      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 py-3 md:py-0">
        <div className="flex items-center justify-between gap-3 md:h-[50px] md:min-h-[50px]">
          {/* Logo - móvil centrado | desktop: esquina izquierda, compacto */}
          <h1 className={`flex-1 md:flex-none md:min-w-[90px] text-left md:text-left font-bold tracking-tight flex items-center gap-0.5 text-xl md:text-sm md:leading-normal`}>
            <span className={textColor}>QUEHAY</span>
            <span className={ACCENT}>H</span>
            <span className="text-base md:text-xs" aria-hidden>🔥</span>
            <span className={ACCENT}>Y</span>
          </h1>

          {/* Desktop: búsqueda centrada */}
          <div className="hidden md:flex md:flex-[2] md:justify-center md:items-center md:px-4">
            <div className="relative w-full max-w-md">
              <input
                type="search"
                placeholder="¿Qué buscas hoy en GYE? 🔥"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={`${searchInputCls} md:py-1.5 md:text-sm`}
                aria-label="Buscar"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Derecha: campana, tema */}
          <div className="flex items-center gap-1 md:flex-shrink-0">
            <button
              type="button"
              className="relative p-1.5 md:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notificaciones"
            >
              <svg className={`w-6 h-6 md:w-5 md:h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:block p-1.5 md:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Buscador móvil - debajo del header */}
        <div className="mt-0 md:hidden">
          <div className="relative">
            <input
              type="search"
              placeholder="¿Qué buscas hoy en GYE? 🔥"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={searchInputCls.replace('py-2.5 md:py-2', 'py-3')}
              aria-label="Buscar"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
