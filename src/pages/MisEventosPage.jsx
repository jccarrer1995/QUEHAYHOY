import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteDoc, doc } from 'firebase/firestore'
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react'
import { BottomNav, DesktopNavbar, Footer } from '../components/layout'
import { EventCard, EventCatalogToolbar, EventSkeleton } from '../components/events'
import { DeleteEventConfirmDialog } from '../components/organizer/DeleteEventConfirmDialog.jsx'
import { OrganizerEventListMenu } from '../components/organizer/OrganizerEventListMenu.jsx'
import { OrganizerQuotaCard } from '../components/organizer/OrganizerQuotaCard.jsx'
import { db } from '../config/firebaseConfig.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useProfileGoogleSignIn } from '../components/layout/useProfileGoogleSignIn.js'
import { useOrganizerMonthlyEventCount } from '../hooks/useOrganizerMonthlyEventCount.js'
import { useMisEventosCatalog } from '../hooks/useMisEventosCatalog.js'
import { ROLE_ORGANIZADOR, canManageEventsRole, isAdministratorRole } from '../lib/organizerPlans.js'
import {
  isEventExpired,
  isEventScheduledForToday,
  ORGANIZER_DELETE_LOCKED_MESSAGE,
  ORGANIZER_EDIT_LOCKED_MESSAGE,
  ORGANIZER_EXPIRED_EVENT_MESSAGE,
} from '../lib/eventExpiration.js'
import { DEFAULT_EVENT_SORT, sortEvents } from '../lib/eventSort.js'
import { getEventDetailPath } from '../lib/slug.js'
import { toast } from 'sonner'

/**
 * @param {unknown} price
 * @returns {string}
 */
function formatEventPrice(price) {
  if (price == null) return ''
  const num = Number(price)
  if (Number.isNaN(num)) return ''
  if (num <= 0) return 'Gratis'
  return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`
}


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
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState(DEFAULT_EVENT_SORT)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const catalogEnabled = Boolean(user) && canManageEventsRole(role)
  const {
    events: eventsToShow,
    loading: listLoading,
    error: listError,
    refetch: refetchEvents,
  } = useMisEventosCatalog({
    uid: user?.uid,
    role,
    enabled: catalogEnabled,
    scope: 'createdThisMonth',
  })
  const error = listError

  const sortedEvents = useMemo(
    () => sortEvents(eventsToShow, sortBy),
    [eventsToShow, sortBy]
  )

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteActionError, setDeleteActionError] = useState(null)

  const isAdmin = isAdministratorRole(role)
  const pageTitle = isAdmin ? 'Eventos' : 'Mis Eventos'
  const showOrganizerCardActions = catalogEnabled && !isAdmin

  function isEventLockedToday(event) {
    const ownerUid = typeof event?.createdByUid === 'string' ? event.createdByUid : null
    const ownedByUser = !ownerUid || ownerUid === user?.uid
    return ownedByUser && isEventScheduledForToday(event)
  }

  function handleEditEvent(event) {
    const id = typeof event?.id === 'string' ? event.id.trim() : ''
    if (!id) return
    if (isEventExpired(event)) {
      toast.message(ORGANIZER_EXPIRED_EVENT_MESSAGE, { duration: 4500 })
      return
    }
    if (isEventLockedToday(event)) {
      toast.message(ORGANIZER_EDIT_LOCKED_MESSAGE, { duration: 4500 })
      return
    }
    navigate(`/mis-eventos/editar/${id}`)
  }

  function handleRequestDelete(event) {
    const id = typeof event?.id === 'string' ? event.id.trim() : ''
    if (!id) return
    if (isEventExpired(event)) {
      toast.message(ORGANIZER_EXPIRED_EVENT_MESSAGE, { duration: 4500 })
      return
    }
    if (isEventLockedToday(event)) {
      toast.message(ORGANIZER_DELETE_LOCKED_MESSAGE, { duration: 4500 })
      return
    }
    setDeleteActionError(null)
    setDeleteTarget({
      id,
      title: typeof event?.title === 'string' ? event.title : 'este evento',
    })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget?.id || !db) return
    const targetEvent = eventsToShow.find((ev) => ev.id === deleteTarget.id)
    if (targetEvent && isEventExpired(targetEvent)) {
      toast.message(ORGANIZER_EXPIRED_EVENT_MESSAGE, { duration: 4500 })
      setDeleteTarget(null)
      return
    }
    if (targetEvent && isEventLockedToday(targetEvent)) {
      toast.message(ORGANIZER_DELETE_LOCKED_MESSAGE, { duration: 4500 })
      setDeleteTarget(null)
      return
    }
    setDeleting(true)
    setDeleteActionError(null)
    try {
      await deleteDoc(doc(db, 'events', deleteTarget.id))
      setDeleteTarget(null)
      refetchEvents()
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String(e.message) : 'No se pudo eliminar el evento'
      setDeleteActionError(msg)
    } finally {
      setDeleting(false)
    }
  }

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
    <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
      <DesktopNavbar />
      <header
        ref={compactHeaderRef}
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors md:hidden ${
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
            {pageTitle}
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-1 flex-col px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-6">
        <section className="pb-4">
          <div ref={heroTitleRef} className="flex flex-wrap items-center gap-2">
            <h2
              className="m-0 text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              {pageTitle}
            </h2>
            <CalendarDays className="h-6 w-6 shrink-0 text-[#14b8a6]" strokeWidth={2} aria-hidden />
          </div>
          <p className={`mt-2 text-sm leading-5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            {!user
              ? 'Inicia sesión para ver y administrar tus eventos.'
              : isAdmin
                ? 'Como administrador ves todos los eventos del sistema.'
                : 'Aquí verás solo los eventos que creaste este mes como organizador.'}
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
                lightSkeleton
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
          <section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Cargando tus eventos"
            aria-busy="true"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <EventSkeleton key={i} layout="grid" lightOnly />
            ))}
          </section>
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
              Aún no hay eventos de este mes
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${mutedCls}`}>
              Aquí aparecen solo los eventos creados en el mes actual.
            </p>
          </div>
        ) : (
          <>
            {deleteActionError ? (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-50/40 px-4 py-3 dark:bg-red-950/20">
                <p className="text-sm text-red-600 dark:text-red-400">{deleteActionError}</p>
              </div>
            ) : null}

            <EventCatalogToolbar
              isDark={isDark}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {viewMode === 'grid' ? (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isDark={isDark}
                    showOrganizerActions={showOrganizerCardActions}
                    showExpiredState
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleRequestDelete}
                    deleteActionDisabled={deleting}
                  />
                ))}
              </section>
            ) : (
              <section className="flex flex-col gap-3">
                {sortedEvents.map((event) => {
                  const detailPath = getEventDetailPath(event) ?? `/evento/${event.id}`
                  const expired = isEventExpired(event)
                  const canOpenDetail = Boolean(detailPath) && !expired
                  const showActions = showOrganizerCardActions && !expired
                  const lockedToday = showActions && isEventLockedToday(event)
                  const priceLabel = formatEventPrice(event.price)
                  const rowCls = `rounded-xl border p-3 transition ${
                    isDark
                      ? 'border-gray-800 bg-[#161616] hover:bg-[#1b1b1b]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  } ${expired ? 'cursor-default opacity-[0.88]' : ''}`

                  const rowContent = (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className={`m-0 truncate text-base font-semibold ${
                            isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
                          }`}
                        >
                          {event.title ?? 'Evento sin título'}
                        </h3>
                        <p className={`mt-1 text-sm ${mutedCls}`}>{event.sector || 'Sin sector'}</p>
                        <p className={`mt-1 text-xs ${mutedCls}`}>{event.date || 'Fecha por confirmar'}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          {priceLabel ? (
                            <span
                              className={`whitespace-nowrap pr-0.5 text-sm font-semibold tabular-nums ${
                                isDark ? 'text-[#14b8a6]' : 'text-teal-600'
                              }`}
                            >
                              {priceLabel}
                            </span>
                          ) : null}
                          {showActions ? (
                            <OrganizerEventListMenu
                              isDark={isDark}
                              onEdit={() => handleEditEvent(event)}
                              onDelete={() => handleRequestDelete(event)}
                              editDisabled={lockedToday}
                              deleteDisabled={deleting || lockedToday}
                              editDisabledMessage={ORGANIZER_EDIT_LOCKED_MESSAGE}
                              deleteDisabledMessage={ORGANIZER_DELETE_LOCKED_MESSAGE}
                            />
                          ) : null}
                        </div>
                        {expired ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                              isDark ? 'bg-red-950/70 text-red-300' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            Expirado
                          </span>
                        ) : event.category ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              isDark ? 'bg-[#14b8a6]/15 text-[#5eead4]' : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {event.category}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )

                  return canOpenDetail ? (
                    <Link key={event.id} to={detailPath} className={rowCls}>
                      {rowContent}
                    </Link>
                  ) : (
                    <div key={event.id} className={rowCls}>
                      {rowContent}
                    </div>
                  )
                })}
              </section>
            )}
          </>
        )}
      </main>

      {catalogEnabled && user && !loading && !error ? (
        <Link
          to="/mis-eventos/crear"
          aria-label="Crear evento"
          className={`fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/35 transition hover:bg-[#0d9488] active:scale-95 md:right-8 ${
            isDark ? 'ring-2 ring-[#1f1f1f]' : 'ring-2 ring-white'
          } bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] md:bottom-8`}
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} aria-hidden />
        </Link>
      ) : null}

      <DeleteEventConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
        isDark={isDark}
      />

      <Footer />
      <BottomNav activeTab="myEvents" onTabChange={() => {}} />
    </div>
  )
}

export default MisEventosPage
