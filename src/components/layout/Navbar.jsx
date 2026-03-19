/**
 * Navbar - Navegación superior de QUEHAYHOY
 * Incluye logo, buscador y switch de modo claro/oscuro
 */
import { useTheme } from '../../contexts/ThemeContext.jsx'

export function Navbar({ searchValue = '', onSearchChange }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212]">
      <div className="mx-auto max-w-4xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo QUEHAYHOY */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-[#E0E0E0]">
          QUEHAYHOY
        </h1>

        <div className="flex items-center gap-3 flex-1 sm:max-w-lg">
          {/* Buscador principal */}
          <div className="flex-1 relative">
            <input
              type="search"
              placeholder="¿Qué quieres hacer hoy en Guayaquil?"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-colors"
              aria-label="Buscar eventos"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
              aria-hidden
            >
              🔍
            </span>
          </div>

          {/* Switch tema */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
