import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useSectorVisibility } from './contexts/SectorVisibilityContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav } from './components/layout'
import {
  EventCardCarousel,
  CategorySelector,
  SectorSelector,
  EventSkeleton,
  TodaySection,
  SpecialCollections,
  HorizontalEventRow,
} from './components/events'
import './App.css'

/**
 * Gratis para el Home: 0, "0", sin precio (null/undefined/"") o número 0.
 * Así los eventos sin campo `price` en Firestore entran en «Gratis y Bacán».
 * @param {{ price?: unknown }} e
 */
function isEventGratis(e) {
  const p = e.price
  if (p === 0 || p === '0') return true
  if (p == null || p === '') return true
  const n = typeof p === 'number' ? p : Number(p)
  return !Number.isNaN(n) && n === 0
}

function App() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { isSectorVisible } = useSectorVisibility()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSector, setActiveSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const effectiveSector = useMemo(() => {
    if (activeSector === 'all') return 'all'
    return isSectorVisible(activeSector) ? activeSector : 'all'
  }, [activeSector, isSectorVisible])

  const { events, loading: eventsLoading, error: eventsError } = useEvents(activeCategory, effectiveSector)
  const isDark = theme === 'dark'
  const [activeNavTab, setActiveNavTab] = useState('home')
  const sectionDividerCls = isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'

  const filteredEvents = useMemo(() => {
    let list = events
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.sector?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [events, searchQuery])

  const freeEvents = useMemo(() => {
    return filteredEvents.filter((e) => isEventGratis(e))
  }, [filteredEvents])

  const destacadosEvents = useMemo(() => {
    return filteredEvents.filter((e) => (e.popularidad ?? 1) === 3)
  }, [filteredEvents])

  const noTeLoPuedesPerderEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => {
        const pop = e.popularidad ?? 1
        const priceNum = typeof e.price === 'number' ? e.price : Number(e.price)
        return (pop === 1 || pop === 2) && !Number.isNaN(priceNum) && priceNum > 0
      })
      .sort((a, b) => (b.popularidad ?? 1) - (a.popularidad ?? 1))
  }, [filteredEvents])

  /**
   * Eventos que no entraban en ninguna de las tres filas anteriores.
   */
  const otrosEventos = useMemo(() => {
    return filteredEvents.filter((e) => {
      const pop = e.popularidad ?? 1
      const inDestacados = pop === 3
      const inFree = isEventGratis(e)
      const priceNum = typeof e.price === 'number' ? e.price : Number(e.price)
      const inNtlp = (pop === 1 || pop === 2) && !Number.isNaN(priceNum) && priceNum > 0
      return !inDestacados && !inFree && !inNtlp
    })
  }, [filteredEvents])

  function handleSurpriseMe() {
    if (filteredEvents.length === 0) return
    const randomIndex = Math.floor(Math.random() * filteredEvents.length)
    const picked = filteredEvents[randomIndex]
    if (!picked?.id) return
    navigate(`/evento/${picked.id}`)
  }

  return (
    <div
      className={`min-h-screen transition-colors pb-20 md:pb-8 ${
        isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
      }`}
    >
      <Navbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="mx-auto max-w-6xl lg:max-w-7xl px-4 py-4 md:py-6">
        {/* Categoría y sectores arriba - móvil y desktop */}
        <section className="mb-3">
          <CategorySelector
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            isDark={isDark}
          />
        </section>
        <section className="mb-4">
          <SectorSelector
            activeSector={effectiveSector}
            onSelect={setActiveSector}
            isDark={isDark}
          />
        </section>

        <TodaySection isDark={isDark} />

        {(eventsLoading || eventsError || destacadosEvents.length > 0) && (
          <section className={`mt-0 pt-5 md:mt-0.5 md:pt-3 mb-5 pb-10 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>🔥</span>
                Eventos Destacados
              </h2>

            </div>

            {eventsLoading ? (
              <div
                className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide"
                aria-label="Cargando eventos"
                aria-busy="true"
              >
                {[0, 1, 2, 3].map((i) => (
                  <EventSkeleton key={i} isDark={isDark} />
                ))}
              </div>
            ) : eventsError ? (
              <p
                className="text-center py-12"
                style={{ color: isDark ? '#ef4444' : '#dc2626' }}
              >
                {eventsError}
              </p>
            ) : (
              <HorizontalEventRow events={destacadosEvents} isDark={isDark} />
            )}
          </section>
        )}

        {freeEvents.length > 0 && (
          <section className={`mt-0 pt-5 md:mt-0.5 md:pt-3 mb-5 pb-10 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>✨</span>
                Gratis y Bacán
              </h2>
            </div>
            <HorizontalEventRow events={freeEvents} isDark={isDark} />
          </section>
        )}

        <SpecialCollections isDark={isDark} />

        {noTeLoPuedesPerderEvents.length > 0 && (
          <section className={`mt-0 pt-5 md:mt-0.5 md:pt-3 mb-5 pb-10 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>📍</span>
                No te lo puedes perder
              </h2>
            </div>
            <HorizontalEventRow events={noTeLoPuedesPerderEvents} isDark={isDark} />
          </section>
        )}

        {otrosEventos.length > 0 && (
          <section className={`mt-0 pt-2 md:mt-0.5 md:pt-3 mb-5 pb-20 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>🎫</span>
                Más eventos
              </h2>
            </div>
            <HorizontalEventRow events={otrosEventos} isDark={isDark} />
          </section>
        )}

        <section className="mt-0.5 pt-3 mb-6">
          <div
            className={`rounded-2xl border p-5 text-center ${
              isDark ? 'bg-[#161616] border-gray-800' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h3
              className="text-lg font-bold"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              ¿No sabes a dónde ir?
            </h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Deja que te recomendemos un plan activo al azar.
            </p>
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={filteredEvents.length === 0}
              className="mt-4 w-full sm:w-auto min-w-[220px] rounded-2xl bg-[#14b8a6] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/25 transition hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ¡Sorpréndeme! 🔥
            </button>
          </div>
        </section>

      </main>

      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />
    </div>
  )
}

export default App
