import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { EventCard } from '../components/events'
import { OrganizerQuotaCard } from '../components/organizer/OrganizerQuotaCard.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useProfileGoogleSignIn } from '../components/layout/useProfileGoogleSignIn.js'
import { useOrganizerMonthlyEventCount } from '../hooks/useOrganizerMonthlyEventCount.js'
import { useMisEventosCatalog } from '../hooks/useMisEventosCatalog.js'
import { ROLE_ORGANIZADOR, canManageEventsRole, isAdministratorRole } from '../lib/organizerPlans.js'

const COMPACT_TITLE_TOUCH_OFFSET = 10

/** Logo Google (marca) */
function GoogleLogo({ className = 'h-7 w-7 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/**
 * Listado de eventos: organizador ve solo los suyos; administrador ve todos.
 */
export function MisEventosPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    beginGoogleRedirect,
    role,
    activePlan,
  } = useAuth()
  const { handleGoogleClick, googleBusy } = useProfileGoogleSignIn({ signInWithGoogle, beginGoogleRedirect })
  const isDark = theme === 'dark'
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const catalogEnabled = Boolean(user) && canManageEventsRole(role)
  const { events: eventsToShow, loading: listLoading, error: listError } = useMisEventosCatalog({
    uid: user?.uid,
    role,
    enabled: catalogEnabled,
  })
  const error = listError

  const showQuota =
    Boolean(user) &&
    (role ?? '').toLowerCase() === ROLE_ORGANIZADOR &&
    activePlan != null &&
    typeof activePlan.maxEventsPerMonth === 'number' &&
    activePlan.maxEventsPerMonth > 0

  const { count: usedThisMonth, loading: quotaLoading, error: quotaError } = useOrganizerMonthlyEventCount(
    showQuota ? user?.uid : null
  )

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

  const listLoadingEffective = Boolean(user) && listLoading
  const loading = authLoading || listLoadingEffective

  useEffect(() => {
    updateCompactTitle()
  }, [error, eventsToShow.length, authLoading, user, listLoading, updateCompactTitle])

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
            Mis Eventos
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <section className="pb-4">
          <div ref={heroTitleRef} className="flex flex-wrap items-center gap-2">
            <h2
              className="m-0 text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Mis Eventos
            </h2>
            <CalendarDays className="h-6 w-6 shrink-0 text-[#14b8a6]" strokeWidth={2} aria-hidden />
          </div>
          <p className={`mt-2 text-sm leading-5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            {!user
              ? 'Inicia sesión para ver y administrar tus eventos.'
              : isAdministratorRole(role)
                ? 'Como administrador ves todos los eventos del sistema.'
                : 'Aquí verás solo los eventos que creaste como organizador.'}
          </p>
          {user && showQuota ? (
            <div className="mt-5">
              <OrganizerQuotaCard
                used={usedThisMonth}
                limit={activePlan.maxEventsPerMonth}
                planLabel={activePlan.label}
                loading={quotaLoading}
                error={quotaError}
                isDark={isDark}
              />
            </div>
          ) : null}
        </section>

        {!user && !authLoading ? (
          <div className={`rounded-2xl border px-5 py-10 text-center ${panelCls}`}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#14b8a6]/12 text-[#14b8a6]">
              <CalendarDays className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <h2
              className="m-0 text-xl font-bold leading-snug"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Accede a tu agenda
            </h2>
            <p className={`mx-auto mt-3 max-w-md text-sm leading-relaxed ${mutedCls}`}>
              Inicia sesión para ver tus eventos y seguir construyendo tu programación.
            </p>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={googleBusy}
              className="mx-auto mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#14b8a6] py-4 pl-5 pr-6 text-base font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition hover:bg-[#0d9488] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleLogo className="h-7 w-7 shrink-0" />
              {googleBusy ? 'Conectando…' : 'Iniciar sesión con Google'}
            </button>
          </div>
        ) : loading ? (
          <div className={`rounded-2xl border px-4 py-6 ${panelCls}`}>
            <p className={`text-sm ${mutedCls}`}>Cargando tus eventos...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-50/40 px-4 py-6 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : eventsToShow.length === 0 ? (
          <div className={`rounded-2xl border px-5 py-8 text-center ${panelCls}`}>
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">
              <CalendarDays className="h-7 w-7" strokeWidth={2} />
            </div>
            <h2
              className="m-0 text-lg font-bold"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Aún no hay eventos aquí
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${mutedCls}`}>
              Cuando publiques o enlaces eventos, los verás listados en esta pantalla.
            </p>
            <Link
              to="/mis-eventos/crear"
              className="mt-5 inline-flex rounded-2xl bg-[#14b8a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
            >
              Crear evento
            </Link>
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

export default MisEventosPage
