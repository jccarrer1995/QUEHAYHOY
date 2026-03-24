import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav, FloatingButtons } from './components/layout'
import { EventCardCarousel, CategorySelector, SectorSelector, EventSkeleton } from './components/events'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSector, setActiveSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { events, loading: eventsLoading, error: eventsError } = useEvents(activeCategory, activeSector)
  const isDark = theme === 'dark'
  const [activeNavTab, setActiveNavTab] = useState('home')

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
    return filteredEvents.filter((e) => e.price === 0 || e.price === '0')
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
            activeSector={activeSector}
            onSelect={setActiveSector}
            isDark={isDark}
          />
        </section>

        <section className="mb-8 pb-20 md:pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              <span>🔥</span>
              Eventos Destacados
            </h2>
            <a
              href="#"
              className="text-sm font-medium text-[#14b8a6] hover:underline"
            >
              Ver todo
            </a>
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
            <>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide">
                {destacadosEvents.map((event) => (
                  <EventCardCarousel
                    key={event.id}
                    event={event}
                    isDark={isDark}
                  />
                ))}
              </div>

              {destacadosEvents.length === 0 && (
                <p
                  className="text-center py-12"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  No hay eventos destacados (popularidad 🔥🔥🔥) que coincidan.
                </p>
              )}
            </>
          )}
        </section>

        {freeEvents.length > 0 && (
          <section className="mb-8 pb-20 md:pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>✨</span>
                Gratis y Bacán
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide">
              {freeEvents.map((event) => (
                <EventCardCarousel
                  key={event.id}
                  event={event}
                  isDark={isDark}
                />
              ))}
            </div>
          </section>
        )}

        {noTeLoPuedesPerderEvents.length > 0 && (
          <section className="mb-8 pb-20 md:pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold uppercase tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                <span>📍</span>
                No te lo puedes perder
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide">
              {noTeLoPuedesPerderEvents.map((event) => (
                <EventCardCarousel
                  key={event.id}
                  event={event}
                  isDark={isDark}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
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

      <FloatingButtons
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />
    </div>
  )
}

export default App
