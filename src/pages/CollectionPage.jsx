import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useEvents } from '../hooks/useEvents.js'
import { EventCard } from '../components/events'
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { events, loading, error } = useEvents('all', 'all')

  const collection = useMemo(() => getCollectionById(id ?? ''), [id])

  const filteredEvents = useMemo(() => {
    if (!collection) return []
    return events.filter((ev) => matchesCollectionDate(ev, collection))
  }, [collection, events])

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
    <main className={`min-h-screen pb-8 ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={collection.imageUrl}
            alt={collection.title}
            className="h-full w-full object-cover scale-[1.04] blur-[2px] brightness-[0.55]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <Link
            to="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="mt-4 text-3xl md:text-4xl font-black" style={{ color: '#ffffff' }}>
            {collection.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.92)' }}>
            {collection.description}
          </p>
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
    </main>
  )
}

export default CollectionPage
