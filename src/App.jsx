import { useState, useMemo } from 'react'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav, FloatingButtons } from './components/layout'
import { EventCardCarousel, CategorySelector } from './components/events'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const isDark = theme === 'dark'
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeNavTab, setActiveNavTab] = useState('home')
  const [filterGratis, setFilterGratis] = useState(false)

  const filteredEvents = useMemo(() => {
    let list = events
    if (activeCategory !== 'all') {
      list = list.filter((e) => e.category === activeCategory)
    }
    if (filterGratis) {
      list = list.filter((e) => e.price === 0)
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
  }, [events, activeCategory, searchQuery, filterGratis])

  return (
    <div
      className={`min-h-screen transition-colors pb-20 md:pb-8 ${
        isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <section className="mb-6">
          <CategorySelector
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            isDark={isDark}
          />
        </section>

        <section className="mb-8 pb-20 md:pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              <span>🔥</span>
              Top Finde Guayaquil
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
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible scrollbar-hide">
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
        onFilter={() => setFilterGratis(false)}
        onGratis={() => setFilterGratis((v) => !v)}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <BottomNav
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        hasNotifications={true}
      />
    </div>
  )
}

export default App
