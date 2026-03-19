import { useState, useMemo } from 'react'
import { useTheme } from './contexts/ThemeContext.jsx'
import { Navbar } from './components/layout'
import { EventCard, CategoryFilter } from './components/events'
import './App.css'

// Eventos de ejemplo para demo (con categorías: bares, ferias, conciertos)
const DEMO_EVENTS = [
  {
    id: '1',
    title: 'Noche de Jazz en Urdesa',
    description: 'Velada íntima con música en vivo y ambiente acogedor.',
    category: 'bares',
    capacity_level: 'INTIMATE',
    capacity: 25,
    sector: 'Urdesa',
    date: 'Sáb 22 Mar · 20:00',
    price: 15,
  },
  {
    id: '2',
    title: 'Festival Gastronómico Samborondón',
    description: 'Degustación de platos locales con más de 100 asistentes.',
    category: 'ferias',
    capacity_level: 'SOCIAL',
    capacity: 120,
    sector: 'Samborondón',
    date: 'Dom 23 Mar · 12:00',
    price: 25,
  },
  {
    id: '3',
    title: 'Concierto Masivo Puerto Santa Ana',
    description: 'Artistas nacionales e internacionales en el malecón.',
    category: 'conciertos',
    capacity_level: 'MASSIVE',
    capacity: 500,
    sector: 'Puerto Santa Ana',
    date: 'Vie 28 Mar · 19:00',
    price: 45,
  },
  {
    id: '4',
    title: 'Bar con Terraza Urdesa',
    description: 'Cócteles y tapas con vista a la ciudad.',
    category: 'bares',
    capacity_level: 'SOCIAL',
    capacity: 80,
    sector: 'Urdesa',
    date: 'Jue 21 Mar · 18:00',
    price: 12,
  },
  {
    id: '5',
    title: 'Feria Artesanal Malecón',
    description: 'Artesanías y productos locales.',
    category: 'ferias',
    capacity_level: 'MASSIVE',
    capacity: 800,
    sector: 'Puerto Santa Ana',
    date: 'Sáb 22 Mar · 10:00',
    price: 0,
  },
]

function App() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = useMemo(() => {
    let list = DEMO_EVENTS
    if (activeCategory !== 'all') {
      list = list.filter((e) => e.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.sector?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, searchQuery])

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
      }`}
    >
      <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
        >
          Eventos en Guayaquil
        </h2>

        <div className="mb-6">
          <CategoryFilter
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            isDark={isDark}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} isDark={isDark} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No hay eventos que coincidan con tu búsqueda o filtro.
          </p>
        )}
      </main>
    </div>
  )
}

export default App
