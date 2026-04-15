import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Share2 } from 'lucide-react'
import { useCategoryVisibility } from '../contexts/CategoryVisibilityContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useSectorVisibility } from '../contexts/SectorVisibilityContext.jsx'
import { useEvents } from '../hooks/useEvents.js'
import { filterEventsByCategoryVisibility } from '../lib/favoriteCategories.js'
import { filterEventsBySectorVisibility } from '../lib/topSectors.js'
import { EventCard } from '../components/events'
import { Footer } from '../components/layout'
import { getCollectionById } from '../lib/specialCollections.js'

/**
 * @param {{ dateMs?: number | null }} event
 * @param {{ day: number, month: number }} collection
 */
function matchesCollectionDate(event, collection) {
  if (!event || typeof event.dateMs !== 'number' || !Number.isFinite(event.dateMs)) return false
  const d = new Date(event.dateMs)
  return d.getDate() === collection.day && d.getMonth() + 1 === collection.month
}

export function CollectionPage() {
  const { id } = useParams()
  const location = useLocation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { isCategoryVisible } = useCategoryVisibility()
  const { isSectorVisible } = useSectorVisibility()
  const { events, loading, error } = useEvents('all', 'all')
  const [showCompactHeader, setShowCompactHeader] = useState(false)

  const collection = useMemo(() => getCollectionById(id ?? ''), [id])

  const filteredEvents = useMemo(() => {
    if (!collection) return []
    const visibleByCategory = filterEventsByCategoryVisibility(events, isCategoryVisible)
    const visible = filterEventsBySectorVisibility(visibleByCategory, isSectorVisible)
    return visible.filter((ev) => matchesCollectionDate(ev, collection))
  }, [collection, events, isCategoryVisible, isSectorVisible])

  const whatsappShareUrl = useMemo(() => {
    const collectionUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : ''
    const text = `Mira esta colección en QUEHAYHOY: ${collection.title}\n${collection.description}\n${collectionUrl}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }, [collection.description, collection.title, location.pathname])

  useEffect(() => {
    function onScroll() {
      setShowCompactHeader(window.scrollY > 28)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!collection) {
    return (
      <main className={`min-h-screen px-4 py-8 ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
        <div className="mx-auto max-w-6xl">
          <p className="text-lg font-bold">Coleccion no encontrada</p>
          <Link to="/" className="mt-3 inline-block text-[#14b8a6] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex flex-col pb-8 lg:pb-0 ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
      <div
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-200 ${
          showCompactHeader ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`border-b backdrop-blur-md ${
            isDark
              ? 'border-gray-800/90 bg-[#121212]/72'
              : 'border-white/40 bg-white/72 shadow-[0_4px_18px_rgba(15,23,42,0.08)]'
          }`}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
            <Link
              to="/"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <p
              className={`min-w-0 truncate text-center text-base font-bold ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}
            >
              {collection.title}
            </p>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Compartir por WhatsApp"
            >
              <Share2 className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={collection.imageUrl}
            alt={collection.title}
            className="h-full w-full object-cover scale-[1.04] blur-[2px] brightness-[0.55]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/78 to-black/48" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.75rem))] md:pt-8 md:pb-10">
          <div className="pointer-events-none absolute inset-x-4 top-[max(1.5rem,env(safe-area-inset-top,0px))] flex items-center justify-between md:top-[max(2rem,env(safe-area-inset-top,0px))]">
            <Link
              to="/"
              className="pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Compartir por WhatsApp"
            >
              <Share2 className="h-5 w-5" />
            </a>
          </div>
          <div className="mx-auto max-w-3xl pb-1 pt-4 text-center md:pt-4">
            <h1
              className="text-3xl font-black tracking-tight leading-[0.96] md:text-4xl md:leading-[0.94]"
              style={{ color: '#ffffff' }}
            >
              {collection.title}
            </h1>
            <p
              className="mx-auto mt-2 max-w-3xl text-center text-sm md:text-base"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {collection.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cargando planes...</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : filteredEvents.length === 0 ? (
          <div className={`rounded-2xl border px-4 py-6 ${isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Estamos preparando los mejores planes para este feriado. ¡Vuelve pronto! ⏳
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} isDark={isDark} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

export default CollectionPage
