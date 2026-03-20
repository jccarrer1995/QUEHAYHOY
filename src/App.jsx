import { useState, useMemo } from 'react'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav, FloatingButtons } from './components/layout'
import { EventCardCarousel, CategorySelector, SectorSelector, EventSkeleton, EventDetail } from './components/events'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSector, setActiveSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { events, loading: eventsLoading, error: eventsError } = useEvents(activeCategory, activeSector)
  const isDark = theme === 'dark'
  const [activeNavTab, setActiveNavTab] = useState('home')
  const [eventDetailId, setEventDetailId] = useState(null)

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
                {filteredEvents.map((event) => (
                  <EventCardCarousel
                    key={event.id}
                    event={event}
                    isDark={isDark}
                    onSelect={setEventDetailId}
                  />
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <p
                  className="text-center py-12"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  No hay eventos que coincidan con tu búsqueda o filtro.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <FloatingButtons
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />

      {eventDetailId ? (
        <EventDetail eventId={eventDetailId} isDark={isDark} onClose={() => setEventDetailId(null)} />
      ) : null}
    </div>
  )
}

export default App
