import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategoryVisibility } from './contexts/CategoryVisibilityContext.jsx'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useSectorVisibility } from './contexts/SectorVisibilityContext.jsx'
import { useEvents } from './hooks/useEvents'
import { Navbar, BottomNav, Footer } from './components/layout'
import { HomeStartupSplash } from './components/layout/HomeStartupSplash.jsx'
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
import { filterEventsByCategoryVisibility } from './lib/favoriteCategories.js'
import { getEventDetailPath } from './lib/slug.js'
import { filterEventsBySectorVisibility } from './lib/topSectors.js'
import { filterEventsByHomeSearch } from './lib/homeSearchFilter.js'

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

const HOME_SPLASH_SESSION_KEY = 'qh-home-startup-splash-v1'

function shouldShowHomeStartupSplash() {
  if (typeof window === 'undefined') return false
  if (!window.matchMedia('(max-width: 767px)').matches) return false
  return window.sessionStorage.getItem(HOME_SPLASH_SESSION_KEY) !== 'seen'
}

function App() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { isCategoryVisible } = useCategoryVisibility()
  const { isSectorVisible } = useSectorVisibility()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSector, setActiveSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const effectiveCategory = useMemo(() => {
    if (activeCategory === 'all') return 'all'
    return isCategoryVisible(activeCategory) ? activeCategory : 'all'
  }, [activeCategory, isCategoryVisible])

  const effectiveSector = useMemo(() => {
    if (activeSector === 'all') return 'all'
    return isSectorVisible(activeSector) ? activeSector : 'all'
  }, [activeSector, isSectorVisible])

  const { events, loading: eventsLoading, error: eventsError } = useEvents(effectiveCategory, effectiveSector)
  const isDark = theme === 'dark'
  const [activeNavTab, setActiveNavTab] = useState('home')
  const [showHomeStartupSplash, setShowHomeStartupSplash] = useState(() => shouldShowHomeStartupSplash())
  const sectionDividerCls = isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'

  const filteredEvents = useMemo(() => {
    let list = filterEventsByCategoryVisibility(events, isCategoryVisible)
    list = filterEventsBySectorVisibility(list, isSectorVisible)
    list = filterEventsByHomeSearch(list, searchQuery)
    return list
  }, [events, searchQuery, isCategoryVisible, isSectorVisible])

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
    const path = getEventDetailPath(picked)
    if (!path) return
    navigate(path)
  }

  useEffect(() => {
    if (!showHomeStartupSplash) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(HOME_SPLASH_SESSION_KEY, 'seen')
      setShowHomeStartupSplash(false)
    }, 1800)
    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(timer)
    }
  }, [showHomeStartupSplash])

  if (showHomeStartupSplash) {
    return <HomeStartupSplash />
  }

  return (
    <div
      className={`min-h-screen transition-colors pb-20 md:pb-0 flex flex-col ${
        isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
      }`}
    >
      <Navbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 md:py-6 lg:max-w-7xl">
        {/* Categoría y sectores arriba - móvil y desktop */}
        <section className="mb-3">
          <CategorySelector
            activeCategory={effectiveCategory}
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

        <TodaySection isDark={isDark} activeSector={effectiveSector} searchQuery={searchQuery} />

        {(eventsLoading || eventsError || destacadosEvents.length > 0) && (
          <section className={`mt-0 pt-5 md:mt-0.5 md:pt-3 mb-5 pb-10 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                Eventos Destacados
                <span>🔥</span>
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
                className="text-xl font-bold tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                Gratis y Bacán
                <span>✨</span>
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
                className="text-xl font-bold tracking-wide flex items-center gap-2"
                style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
              >
                No te lo puedes perder
                <span>📍</span>
              </h2>
            </div>
            <HorizontalEventRow events={noTeLoPuedesPerderEvents} isDark={isDark} />
          </section>
        )}

        {otrosEventos.length > 0 && (
          <section className={`mt-0 pt-2 md:mt-0.5 md:pt-3 mb-5 pb-20 md:pb-8 ${sectionDividerCls}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold tracking-wide flex items-center gap-2"
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
              className="mt-4 w-full sm:w-auto min-w-[220px] rounded-2xl bg-[#14b8a6] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/25 transition hover:bg-[#0d9488] enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ¡Sorpréndeme! 🔥
            </button>
          </div>
        </section>

      </main>

      <Footer />
      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />
    </div>
  )
}

export default App
