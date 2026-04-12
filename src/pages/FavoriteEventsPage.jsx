import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { EventCard } from '../components/events'
import { useFavoriteEvents } from '../contexts/FavoriteEventsContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useEvents } from '../hooks/useEvents.js'

const COMPACT_TITLE_TOUCH_OFFSET = 10

export function FavoriteEventsPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { favoriteIds } = useFavoriteEvents()
  const { events, loading, error } = useEvents('all', 'all')
  const isDark = theme === 'dark'
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const favoriteEvents = useMemo(() => {
    if (favoriteIds.length === 0 || events.length === 0) return []

    const orderMap = new Map(favoriteIds.map((id, index) => [id, index]))

    return events
      .filter((event) => orderMap.has(String(event.id)))
      .sort((a, b) => (orderMap.get(String(b.id)) ?? -1) - (orderMap.get(String(a.id)) ?? -1))
  }, [events, favoriteIds])

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

  useEffect(() => {
    updateCompactTitle()
  }, [loading, error, favoriteIds.length, favoriteEvents.length, updateCompactTitle])

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
            Favoritos
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
              Favoritos
            </h2>
            <Heart className="h-6 w-6 shrink-0 text-[#14b8a6]" fill="currentColor" aria-hidden />
          </div>
          <p className={`mt-2 text-sm leading-5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Aquí se guardan los eventos que marcaste con el corazón.
          </p>
        </section>

        {loading ? (
          <div className={`rounded-2xl border px-4 py-6 ${panelCls}`}>
            <p className={`text-sm ${mutedCls}`}>Cargando tus favoritos...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-50/40 px-4 py-6 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : favoriteIds.length === 0 ? (
          <div className={`rounded-2xl border px-5 py-8 text-center ${panelCls}`}>
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">
              <Heart className="h-7 w-7" />
            </div>
            <h2
              className="m-0 text-lg font-bold"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Aún no guardas favoritos
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${mutedCls}`}>
              Explora eventos y toca el corazón de una card para guardarlos aquí.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-2xl bg-[#14b8a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
            >
              Explorar eventos
            </Link>
          </div>
        ) : favoriteEvents.length === 0 ? (
          <div className={`rounded-2xl border px-5 py-8 text-center ${panelCls}`}>
            <h2
              className="m-0 text-lg font-bold"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Tus favoritos no están disponibles
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${mutedCls}`}>
              Los eventos que habías guardado ya no están visibles en este momento.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteEvents.map((event) => (
              <EventCard key={event.id} event={event} isDark={isDark} />
            ))}
          </section>
        )}
      </main>

      <Footer />
      <BottomNav activeTab="favorites" onTabChange={() => {}} />
    </div>
  )
}

export default FavoriteEventsPage
