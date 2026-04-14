/**
 * Pantalla de visibilidad de sectores en el carrusel del home (entrada desde la derecha).
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useSectorVisibility } from '../contexts/SectorVisibilityContext.jsx'
import { SECTORS } from '../lib/topSectors.js'

const MotionDiv = motion.div
const COMPACT_TITLE_TOUCH_OFFSET = 10

const selectableSectors = SECTORS.filter((s) => s.id !== 'all')

function SectorVisibilitySwitch({ enabled, isDark, onToggle, label }) {
  const trackOff = isDark ? 'bg-gray-600' : 'bg-gray-300'
  const trackOn = 'bg-[#14b8a6]'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`Mostrar ${label} en el inicio`}
      onClick={onToggle}
      className={`relative h-8 w-[51px] shrink-0 rounded-full p-[3px] transition-colors ${
        enabled ? trackOn : trackOff
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[3px] top-[3px] block h-[26px] w-[26px] rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out will-change-transform dark:ring-white/10 ${
          enabled ? 'translate-x-[19px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function FavoriteSectorsPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { visibleById, setSectorVisible } = useSectorVisibility()
  const [slideOut, setSlideOut] = useState(false)
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'

  useEffect(() => {
    if (!slideOut) return undefined
    const t = window.setTimeout(() => navigate('/perfil', { replace: true }), 330)
    return () => window.clearTimeout(t)
  }, [slideOut, navigate])

  function handleBack() {
    setSlideOut(true)
  }

  function updateCompactTitle() {
    const headerEl = compactHeaderRef.current
    const titleEl = heroTitleRef.current
    if (!headerEl || !titleEl) return

    const headerBottom = headerEl.getBoundingClientRect().bottom
    const titleTop = titleEl.getBoundingClientRect().top
    setShowCompactTitle(titleTop <= headerBottom - COMPACT_TITLE_TOUCH_OFFSET)
  }

  function handleScroll() {
    updateCompactTitle()
  }

  useEffect(() => {
    updateCompactTitle()
    function handleResize() {
      updateCompactTitle()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <MotionDiv
      className={`fixed inset-0 z-[100] flex flex-col ${pageCls}`}
      initial={{ x: '100%' }}
      animate={{ x: slideOut ? '100%' : 0 }}
      transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
    >
      <header
        ref={compactHeaderRef}
        className={`absolute inset-x-0 top-0 z-10 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={handleBack}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>

          <h2
            className={`m-0 text-center text-sm font-bold transition-all duration-200 ${
              showCompactTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            Sectores favoritos
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-[calc(env(safe-area-inset-top)+3.75rem)]" onScroll={handleScroll}>
        <section className="pb-4">
          <h2
            ref={heroTitleRef}
            className="m-0 text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            Sectores favoritos
          </h2>
          <p
            className={`mt-2 text-sm leading-5 ${
              isDark ? '!text-gray-400' : '!text-gray-500'
            }`}
          >
            Activa o desactiva cada sector para mostrarlo u ocultarlo en el carrusel del inicio.
          </p>
        </section>

        <ul>
          {selectableSectors.map((sector) => {
            const enabled = visibleById[sector.id] !== false
            return (
              <li
                key={sector.id}
                className="flex min-w-0 items-center justify-between gap-3 py-4 first:pt-0"
              >
                <span
                  className={`min-w-0 flex-1 text-base font-medium ${
                    isDark ? '!text-[#E0E0E0]' : '!text-gray-900'
                  }`}
                >
                  {sector.label}
                </span>
                <SectorVisibilitySwitch
                  enabled={enabled}
                  isDark={isDark}
                  label={sector.label}
                  onToggle={() => setSectorVisible(sector.id, !enabled)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </MotionDiv>
  )
}

export default FavoriteSectorsPage
