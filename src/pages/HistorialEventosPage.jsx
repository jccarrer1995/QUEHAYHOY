import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { EventCard } from '../components/events'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useMisEventosCatalog } from '../hooks/useMisEventosCatalog.js'
import { canManageEventsRole, isAdministratorRole } from '../lib/organizerPlans.js'

const COMPACT_TITLE_TOUCH_OFFSET = 10

/**
 * Historial de eventos creados: antiguos y actuales.
 */
export function HistorialEventosPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { user, loading: authLoading, role } = useAuth()
  const isDark = theme === 'dark'
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const catalogEnabled = Boolean(user) && canManageEventsRole(role)
  const { events: eventsToShow, loading: listLoading, error: listError } = useMisEventosCatalog({
    uid: user?.uid,
    role,
    enabled: catalogEnabled,
    scope: 'all',
  })

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const panelCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'

  const updateCompactTitle = useCallback(() => {
    const headerEl = compactHeaderRef.current
    const titleEl = heroTitleRef.current
    if (!headerEl || !titleEl) return
    const headerBottom = headerEl.getBoundingClientRect().bottom
    const titleTop = titleEl.getBoundingClientRect().top
    setShowCompactTitle(titleTop <= headerBottom - COMPACT_TITLE_TOUCH_OFFSET)
  }, [])

  useEffect(() => {
    updateCompactTitle()
    function handleResize() {
      updateCompactTitle()
    }
    window.addEventListener('scroll', updateCompactTitle, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', updateCompactTitle)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateCompactTitle])

  const loading = authLoading || (Boolean(user) && listLoading)

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <header
        ref={compactHeaderRef}
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>

          <h2
            className={`m-0 text-center text-sm font-bold transition-all duration-200 ${
              showCompactTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            Historial de Eventos
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <section className="pb-4">
          <div ref={heroTitleRef} className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-2xl font-bold tracking-tight" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
              Historial de Eventos
            </h2>
            <CalendarDays className="h-6 w-6 shrink-0 text-[#14b8a6]" strokeWidth={2} aria-hidden />
          </div>
          <p className={`mt-2 text-sm leading-5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            {!user
              ? 'Inicia sesión para ver tu historial de eventos.'
              : isAdministratorRole(role)
                ? 'Como administrador ves el historial completo del sistema.'
                : 'Aquí verás todos tus eventos, antiguos y nuevos.'}
          </p>
        </section>

        {!user && !authLoading ? (
          <div className={`rounded-2xl border px-5 py-10 text-center ${panelCls}`}>
            <p className={`mx-auto max-w-md text-sm leading-relaxed ${mutedCls}`}>
              Inicia sesión para consultar tu historial de eventos.
            </p>
          </div>
        ) : loading ? (
          <div className={`rounded-2xl border px-4 py-6 ${panelCls}`}>
            <p className={`text-sm ${mutedCls}`}>Cargando historial...</p>
          </div>
        ) : listError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-50/40 px-4 py-6 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
          </div>
        ) : eventsToShow.length === 0 ? (
          <div className={`rounded-2xl border px-5 py-8 text-center ${panelCls}`}>
            <h2 className="m-0 text-lg font-bold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
              Aún no hay eventos en el historial
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${mutedCls}`}>
              Cuando crees eventos, se irán guardando aquí automáticamente.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventsToShow.map((event) => (
              <EventCard key={event.id} event={event} isDark={isDark} />
            ))}
          </section>
        )}
      </main>

      <Footer />
      <BottomNav activeTab="myEvents" onTabChange={() => {}} />
    </div>
  )
}

export default HistorialEventosPage
