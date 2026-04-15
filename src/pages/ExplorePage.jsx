/**
 * Explorar — mapa a pantalla completa, búsqueda flotante, chips de categoría y mini-card por marcador.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { BottomNav } from '../components/layout'
import { ExploreEventMiniCard } from '../components/explore/ExploreEventMiniCard.jsx'
import { ExploreFloatingHeader } from '../components/explore/ExploreFloatingHeader.jsx'
import { ExploreMapView } from '../components/explore/ExploreMapView.jsx'
import { useCategoryVisibility } from '../contexts/CategoryVisibilityContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useEvents } from '../hooks/useEvents.js'
import { filterExploreEvents } from '../lib/exploreFilters.js'
import { filterEventsByCategoryVisibility } from '../lib/favoriteCategories.js'
import { filterEventsByExploreSecondary } from '../lib/exploreTimeFilters.js'

export function ExplorePage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { isCategoryVisible } = useCategoryVisibility()
  const { events, loading, error } = useEvents('all', 'all')
  const statusBarOverlayStyle = { height: 'env(safe-area-inset-top, 0px)' }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [isFreeFilter, setIsFreeFilter] = useState(false)
  const [timePreset, setTimePreset] = useState(
    /** @type {'today' | 'tomorrow' | 'weekend' | 'month' | null} */ ('month')
  )

  const filteredEvents = useMemo(() => {
    let list = filterEventsByCategoryVisibility(events, isCategoryVisible)
    list = filterExploreEvents(list, activeCategory, searchQuery)
    list = filterEventsByExploreSecondary(list, {
      isFreeActive: isFreeFilter,
      timePreset,
    })
    return list
  }, [events, activeCategory, searchQuery, isCategoryVisible, isFreeFilter, timePreset])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return filteredEvents.find((e) => e.id === selectedEventId) ?? null
  }, [filteredEvents, selectedEventId])

  const pageBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-gray-100 text-gray-900'
  const statusBarOverlayCls = isDark ? 'bg-[#121212]/88' : 'bg-white/88'

  return (
    <div className={`relative min-h-[100dvh] w-full overflow-hidden ${pageBg}`}>
      <div className="absolute inset-0 z-0 h-full min-h-0 w-full flex-1">
        {apiKey ? (
          <ExploreMapView
            apiKey={apiKey}
            isDark={isDark}
            events={filteredEvents}
            onSelectEvent={(ev) => setSelectedEventId(ev.id)}
            onMapClick={() => setSelectedEventId(null)}
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center ${
              isDark ? 'bg-[#0f0f0f]' : 'bg-slate-200'
            }`}
          >
            <MapPin className="h-12 w-12 text-[#14b8a6]" strokeWidth={1.5} aria-hidden />
            <p className="max-w-sm text-sm font-medium" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
              Configura la variable{' '}
              <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              en tu archivo <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">.env</code>{' '}
              para ver el mapa (Maps JavaScript API).
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 rounded-2xl bg-[#14b8a6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {(loading || error) && (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-28 z-10 mx-auto max-w-md rounded-2xl border px-4 py-3 text-center text-sm shadow-lg md:bottom-8 ${
              isDark ? 'border-gray-700 bg-[#121212]/95 text-gray-200' : 'border-gray-200 bg-white/95 text-gray-800'
            }`}
          >
            {loading ? 'Cargando eventos…' : null}
            {error ? error : null}
          </div>
        )}
      </div>

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 backdrop-blur-[6px] ${statusBarOverlayCls}`}
        style={statusBarOverlayStyle}
        aria-hidden
      />

      <ExploreFloatingHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        isDark={isDark}
        isFreeFilter={isFreeFilter}
        onFreeToggle={() => setIsFreeFilter((v) => !v)}
        timePreset={timePreset}
        onTimePresetChange={setTimePreset}
      />

      <ExploreEventMiniCard
        event={selectedEvent}
        isDark={isDark}
        onClose={() => setSelectedEventId(null)}
      />

      <BottomNav activeTab="explore" onTabChange={() => {}} />
    </div>
  )
}

export default ExplorePage
