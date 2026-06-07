/**
 * Navbar - QUEHAYHOY
 * Mobile: hamburger, campana | Desktop: menú cuenta, búsqueda, campana, tema (logo visual oculto en md+)
 * Opcional: fila extra bajo el buscador (p. ej. filtros del home) dentro del header sticky.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useEphemeralNotifications } from '../../hooks/useEphemeralNotifications.js'
import { EventDetailModal } from '../events'
import { DesktopProfileMenuContent } from './DesktopProfileMenuContent.jsx'

/**
 * @param {{ searchValue?: string, onSearchChange?: (v: string) => void, mobileHomeFilters?: import('react').ReactNode }} props
 */
export function Navbar({ searchValue = '', onSearchChange, mobileHomeFilters = null }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const isDark = theme === 'dark'
  const showDesktopProfileMenu = !location.pathname.startsWith('/perfil')
  /** En Explorar la búsqueda va en ExploreFloatingHeader; evitar duplicar el input en desktop. */
  const hideDesktopSearch = location.pathname === '/explorar'

  const {
    recentEvents,
    eventsLoading,
    eventsError,
    seenIds,
    unreadCount,
    markAsSeen,
  } = useEphemeralNotifications(user?.uid ?? null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEventId, setModalEventId] = useState(null)

  const bellWrapRef = useRef(null)
  const menuId = useId()

  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const bgColor = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'
  const safeAreaTopStyle = { paddingTop: 'env(safe-area-inset-top, 0px)' }

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

  useEffect(() => {
    if (!profileDrawerOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [profileDrawerOpen])

  useEffect(() => {
    if (!profileDrawerOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setProfileDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [profileDrawerOpen])

  useEffect(() => {
    if (!profileDrawerOpen) return undefined
    const mq = window.matchMedia('(min-width: 768px)')
    function onMq() {
      if (!mq.matches) setProfileDrawerOpen(false)
    }
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [profileDrawerOpen])

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
    <header
      className={`sticky top-0 z-50 border-b ${borderColor} ${bgColor}`}
      style={safeAreaTopStyle}
    >
      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 py-3 md:py-0">
        <div className="flex items-center justify-between gap-3 md:h-[50px] md:min-h-[50px]">
          {/* Desktop: menú cuenta (sin logo visual en md+). Móvil: sin hamburguesa (perfil en barra inferior). */}
          <div className="hidden md:flex md:flex-none md:items-center md:gap-2">
            {showDesktopProfileMenu ? (
              <button
                type="button"
                onClick={() => setProfileDrawerOpen(true)}
                className="cursor-pointer rounded-lg p-2"
                aria-label="Abrir menú de cuenta"
                aria-expanded={profileDrawerOpen}
                aria-controls="desktop-profile-drawer"
              >
                <Menu className={`h-6 w-6 ${textColor}`} strokeWidth={2} />
              </button>
            ) : null}
            <h1 className="sr-only">QUEHAYHOY</h1>
          </div>

          {/* Móvil: buscador en la cabecera para ahorrar espacio vertical */}
          <div className="flex flex-1 md:hidden">
            <div className="relative w-full">
              <input
                type="search"
                placeholder=""
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={searchInputCls.replace('py-2.5 md:py-2', 'py-2.5')}
                aria-label="Buscar"
              />
              {!searchValue ? (
                <span
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <span>QUEHAYHOY</span> en GYE?
                </span>
              ) : null}
              <Search
                className="pointer-events-none absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400 md:h-5 md:w-5"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>

          {/* Desktop: búsqueda centrada (oculta en /explorar) */}
          <div
            className={
              hideDesktopSearch
                ? 'hidden'
                : 'hidden md:flex md:flex-[2] md:justify-center md:items-center md:px-4'
            }
          >
            <div className="relative w-full max-w-md">
              <input
                type="search"
                placeholder="¿Qué buscas hoy en GYE? 🔥"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={`${searchInputCls} md:py-1.5 md:text-sm`}
                aria-label="Buscar"
              />
              <Search
                className="pointer-events-none absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400 md:h-5 md:w-5"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>

          {/* Derecha: campana, tema */}
          <div className="flex items-center gap-1 md:flex-shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="cursor-pointer rounded-lg p-1.5 md:p-1.5"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <Sun className={`h-6 w-6 md:h-5 md:w-5 ${textColor}`} strokeWidth={2} aria-hidden />
              ) : (
                <Moon className={`h-6 w-6 md:h-5 md:w-5 ${textColor}`} strokeWidth={2} aria-hidden />
              )}
            </button>

            <div className="relative" ref={bellWrapRef}>
              <button
                type="button"
                className="relative cursor-pointer rounded-lg p-1.5 md:p-1.5"
                aria-label="Notificaciones"
                aria-expanded={panelOpen}
                aria-controls={menuId}
                onClick={() => setPanelOpen((v) => !v)}
              >
                <Bell className={`h-6 w-6 md:h-5 md:w-5 ${textColor}`} strokeWidth={2} aria-hidden />
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
                      Nuevos Planes (Últimas 24h)
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
          </div>
        </div>

      </div>

      {mobileHomeFilters ? (
        <div className={`border-t ${borderColor} ${bgColor}`}>
          <div className="mx-auto max-w-6xl px-4 pb-3 pt-2.5 lg:max-w-7xl">{mobileHomeFilters}</div>
        </div>
      ) : null}

      {profileDrawerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[85] hidden cursor-default bg-black/50 md:block"
            aria-label="Cerrar menú"
            onClick={() => setProfileDrawerOpen(false)}
          />
          <aside
            id="desktop-profile-drawer"
            className={`fixed inset-y-0 left-0 z-[90] hidden h-[100dvh] w-[min(100vw,300px)] max-w-[100vw] flex-col border-r shadow-2xl md:flex md:flex-col ${
              isDark ? 'border-gray-800 bg-[#121212]' : 'border-gray-200 bg-white'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de cuenta"
          >
            <DesktopProfileMenuContent onClose={() => setProfileDrawerOpen(false)} />
          </aside>
        </>
      ) : null}

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
