import { useState, useMemo } from 'react'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav, FloatingButtons } from './components/layout'
import { EventCardCarousel, CategorySelector, SectorSelector } from './components/events'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSector, setActiveSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { events, loading: eventsLoading, error: eventsError } = useEvents(activeCategory, activeSector)
  const isDark = theme === 'dark'
  const [activeNavTab, setActiveNavTab] = useState('home')
  const [quickFilters, setQuickFilters] = useState([])

  const handleQuickFilterToggle = (id) => {
    setQuickFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const filterGratis = quickFilters.includes('gratis')
  const filterHoy = quickFilters.includes('hoy')
  const filterBajo = quickFilters.includes('bajo')

  const filteredEvents = useMemo(() => {
    let list = events
    if (filterGratis) {
      list = list.filter((e) => e.price === 0)
    }
    if (filterBajo) {
      list = list.filter((e) => (e.price ?? 999) <= 15)
    }
    if (filterHoy) {
      const today = new Date().toISOString().slice(0, 10)
      list = list.filter((e) => {
        const d = e.date
        if (!d) return false
        if (typeof d === 'string') return d.slice(0, 10) === today || d.includes(today)
        if (d?.toDate) return d.toDate().toISOString().slice(0, 10) === today
        return false
      })
    }
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
  }, [events, searchQuery, filterGratis, filterHoy, filterBajo])

  return (
    <div
      className={`min-h-screen transition-colors pb-20 md:pb-8 ${
        isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
      }`}
    >
      <Navbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilters={quickFilters}
        onQuickFilterToggle={handleQuickFilterToggle}
      />

      <main className="mx-auto max-w-6xl lg:max-w-7xl px-4 py-4 md:py-6">
        {/* Sectores y categorías arriba - móvil y desktop */}
        <section className="mb-3">
          <SectorSelector
            activeSector={activeSector}
            onSelect={setActiveSector}
            isDark={isDark}
          />
        </section>
        <section className="mb-4">
          <CategorySelector
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
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
            <div className="flex justify-center py-16">
              <div
                className="w-10 h-10 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Cargando"
              />
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
        onFilter={() => setQuickFilters([])}
        onGratis={() => handleQuickFilterToggle('gratis')}
        isGratisActive={filterGratis}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />
    </div>
  )
}

export default App
