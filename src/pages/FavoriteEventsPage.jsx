import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { EventCard } from '../components/events'
import { useFavoriteEvents } from '../contexts/FavoriteEventsContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useEvents } from '../hooks/useEvents.js'

export function FavoriteEventsPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { favoriteIds } = useFavoriteEvents()
  const { events, loading, error } = useEvents('all', 'all')
  const isDark = theme === 'dark'

  const favoriteEvents = useMemo(() => {
    if (favoriteIds.length === 0 || events.length === 0) return []

    const orderMap = new Map(favoriteIds.map((id, index) => [id, index]))

    return events
      .filter((event) => orderMap.has(String(event.id)))
      .sort((a, b) => (orderMap.get(String(b.id)) ?? -1) - (orderMap.get(String(a.id)) ?? -1))
  }, [events, favoriteIds])

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const panelCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-24 pt-4 md:pb-8 md:pt-6">
        <header className={`mb-5 flex items-center gap-3 border-b pb-4 ${borderCls}`}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="m-0 text-xl font-bold"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                Favoritos 
              </h1>
              <Heart className="h-5 w-5 text-[#14b8a6]" fill="currentColor" />
            </div>
            <p className={`mt-1 text-sm ${mutedCls}`}>
              Aquí se guardan los eventos que marcaste con el corazón.
            </p>
          </div>
        </header>

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
