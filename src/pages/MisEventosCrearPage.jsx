import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { AdminEventForm } from './AdminEventForm.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const COMPACT_TITLE_TOUCH_OFFSET = 10

/**
 * Alta de evento con el mismo shell visual que Favoritos / Mis eventos (cabecera fija, hero, bottom nav).
 */
export function MisEventosCrearPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'

  const updateCompactTitle = useCallback(() => {
    const headerEl = compactHeaderRef.current
    const titleEl = heroTitleRef.current
    if (!headerEl || !titleEl) return

    const headerBottom = headerEl.getBoundingClientRect().bottom
    const titleTop = titleEl.getBoundingClientRect().top
    setShowCompactTitle(titleTop <= headerBottom - COMPACT_TITLE_TOUCH_OFFSET)
  }, [])

  useEffect(() => {
    updateCompactTitle()
    function handleResize() {
      updateCompactTitle()
    }

    window.addEventListener('scroll', updateCompactTitle, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', updateCompactTitle)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateCompactTitle])

  return (
    <div className={`min-h-[100dvh] overflow-x-clip ${pageCls}`}>
      <header
        ref={compactHeaderRef}
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={() => navigate('/mis-eventos')}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver a Mis eventos"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>

          <h2
            className={`m-0 text-center text-sm font-bold transition-all duration-200 ${
              showCompactTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            Crear evento
          </h2>

          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 text-amber-300' : 'hover:bg-black/5 text-gray-800'
            }`}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="text-lg leading-none">{isDark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 flex-col overflow-x-clip px-4 pb-28 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-12 md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <section className="pb-6">
          <div ref={heroTitleRef} className="flex flex-wrap items-center gap-2">
            <h1
              className="m-0 text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Crear evento
            </h1>
            <PlusCircle className="h-6 w-6 shrink-0 text-[#14b8a6]" strokeWidth={2} aria-hidden />
          </div>
          <p className={`mt-2 text-sm leading-5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Completa los datos para publicar tu plan. Podrás editarlo después desde el panel de administración.
          </p>
        </section>

        <AdminEventForm embeddedInMisEventos />
      </main>

      <Footer />
      <BottomNav activeTab="myEvents" onTabChange={() => {}} />
    </div>
  )
}

export default MisEventosCrearPage
