/**
 * Navbar - QUEHAYHOY
 * Mobile: hamburger, logo, campana | Desktop: logo, search, nav, campana, tema
 * QuickFilters (pills) debajo del buscador
 */
import { useEffect, useId, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useEphemeralNotifications } from '../../hooks/useEphemeralNotifications.js'
import { EventDetailModal } from '../events'

const ACCENT = 'text-[#14b8a6] dark:text-[#14b8a6]'

/**
 * @param {{ searchValue?: string, onSearchChange?: (v: string) => void }} props
 */
export function Navbar({ searchValue = '', onSearchChange }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const isDark = theme === 'dark'

  const {
    recentEvents,
    eventsLoading,
    eventsError,
    seenIds,
    unreadCount,
    markAsSeen,
  } = useEphemeralNotifications(user?.uid ?? null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEventId, setModalEventId] = useState(null)

  const bellWrapRef = useRef(null)
  const menuId = useId()

  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const bgColor = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'

  const searchInputCls = isDark
    ? 'w-full pl-4 pr-10 py-2.5 md:py-2 rounded-2xl bg-[#1e1e1e] border border-gray-700 text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]'
    : 'w-full pl-4 pr-10 py-2.5 md:py-2 rounded-2xl bg-[#f5f5f5] border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]'

  useEffect(() => {
    if (!panelOpen) return
    function handlePointerDown(e) {
      const el = bellWrapRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPanelOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [panelOpen])

  /**
   * @param {string} eventId
   */
  async function handlePickNotification(eventId) {
    try {
      await markAsSeen(eventId)
    } catch {
      toast.error('No se pudo marcar como visto. Intenta de nuevo.')
    }
    setModalEventId(eventId)
    setModalOpen(true)
    setPanelOpen(false)
  }

  const badgeLabel =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : ''

  return (
    <header className={`sticky top-0 z-50 border-b ${borderColor} ${bgColor}`}>
      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 py-3 md:py-0">
        <div className="flex items-center justify-between gap-3 md:h-[50px] md:min-h-[50px]">
          {/* Logo - móvil centrado | desktop: esquina izquierda, compacto */}
          <h1 className={`flex-1 md:flex-none md:min-w-[90px] text-left md:text-left font-bold tracking-tight flex items-center gap-0.5 text-xl md:text-sm md:leading-normal`}>
            <span className={textColor}>QUEHAY</span>
            <span className={ACCENT}>H</span>
            <span className="text-base md:text-xs" aria-hidden>
              🔥
            </span>
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
            <div className="relative" ref={bellWrapRef}>
              <button
                type="button"
                className="group relative p-1.5 md:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Notificaciones"
                aria-expanded={panelOpen}
                aria-controls={menuId}
                onClick={() => setPanelOpen((v) => !v)}
              >
                <svg
                  className={`w-6 h-6 md:w-5 md:h-5 ${textColor} dark:group-hover:text-white`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-h-[18px] min-w-[18px] rounded-full bg-red-600 px-1 text-[10px] font-bold leading-[18px] text-white text-center">
                    {badgeLabel}
                  </span>
                ) : null}
              </button>

              {panelOpen ? (
                <div
                  id={menuId}
                  className={`absolute right-0 top-full z-[60] mt-2 w-[min(calc(100vw-2rem),22rem)] max-h-[min(70vh,420px)] overflow-hidden rounded-2xl border shadow-xl ${
                    isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'
                  }`}
                  role="menu"
                >
                  <div
                    className={`border-b px-4 py-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
                  >
                    <p className={`text-sm font-bold ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                      Nuevos Planes (Últimos 30m)
                    </p>
                    <p className={`mt-0.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Eventos recientes que aún no has abierto.
                    </p>
                  </div>

                  <div className="max-h-[min(58vh,360px)] overflow-y-auto overscroll-contain">
                    {eventsError ? (
                      <div className="px-4 py-4 text-center text-sm text-red-600 dark:text-red-400">
                        {eventsError}
                      </div>
                    ) : eventsLoading ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Cargando…
                      </div>
                    ) : recentEvents.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay planes nuevos en esta ventana.
                      </div>
                    ) : (
                      <ul className="py-1">
                        {recentEvents.map((ev) => {
                          const read = seenIds.has(ev.id)
                          const rel = formatDistanceToNow(new Date(ev.createdAtMs), {
                            addSuffix: true,
                            locale: es,
                          })
                          return (
                            <li key={ev.id}>
                              <button
                                type="button"
                                className={`flex w-full items-start gap-2 px-4 py-3 text-left transition ${
                                  read
                                    ? isDark
                                      ? 'bg-[#161616] text-gray-400'
                                      : 'bg-white text-gray-600'
                                    : isDark
                                      ? 'bg-cyan-950/35 text-gray-100'
                                      : 'bg-cyan-50 text-gray-950'
                                }`}
                                onClick={() => handlePickNotification(ev.id)}
                              >
                                {!read ? (
                                  <span
                                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#14b8a6]"
                                    aria-hidden
                                  />
                                ) : (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" aria-hidden />
                                )}
                                <span className="min-w-0 flex-1">
                                  <span
                                    className={`block text-sm font-semibold leading-snug line-clamp-2 ${
                                      read
                                        ? ''
                                        : isDark
                                          ? 'text-gray-100'
                                          : 'text-gray-950'
                                    }`}
                                  >
                                    {ev.title}
                                  </span>
                                  <span
                                    className={`mt-0.5 block text-xs capitalize ${
                                      read ? 'text-gray-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                  >
                                    {rel}
                                  </span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

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

      <EventDetailModal
        eventId={modalEventId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setModalEventId(null)
        }}
      />
    </header>
  )
}

export default Navbar
