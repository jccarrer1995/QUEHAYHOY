/**
 * Pantalla de visibilidad de categorías en el home (entrada desde la derecha).
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { CATEGORIES_SELECTOR } from '../components/events/index.js'
import { useCategoryVisibility } from '../contexts/CategoryVisibilityContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const MotionDiv = motion.div
const COMPACT_TITLE_TOUCH_OFFSET = 10

const selectableCategories = CATEGORIES_SELECTOR.filter((category) => category.id !== 'all')

function FavoriteCategorySwitch({ enabled, isDark, onToggle, label }) {
  const trackOff = isDark ? 'bg-gray-600' : 'bg-gray-300'
  const trackOn = 'bg-[#14b8a6]'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`Marcar ${label} como categoría favorita`}
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

export function FavoriteCategoriesPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { visibleById, setCategoryVisible } = useCategoryVisibility()
  const [slideOut, setSlideOut] = useState(false)
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'

  useEffect(() => {
    if (!slideOut) return undefined
    const t = window.setTimeout(() => navigate(-1), 330)
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

  function handleToggle(categoryId, enabled) {
    setCategoryVisible(categoryId, !enabled)
  }

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
            Categorías favoritas
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-[calc(env(safe-area-inset-top)+3.75rem)]"
        onScroll={handleScroll}
      >
        <section className="pb-4">
          <h2
            ref={heroTitleRef}
            className="m-0 text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            Categorías favoritas
          </h2>
          <p
            className={`mt-2 text-sm leading-5 ${
              isDark ? '!text-gray-400' : '!text-gray-500'
            }`}
          >
            Activa o desactiva cada categoría para mostrarla u ocultarla en el home junto con sus eventos.
          </p>
        </section>

        <ul>
          {selectableCategories.map((category) => {
            const enabled = visibleById[category.id] !== false

            return (
              <li
                key={category.id}
                className={`flex min-w-0 items-center justify-between gap-3 border-b py-4 first:pt-0 ${borderCls}`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {category.icon}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-base font-medium ${
                      isDark ? '!text-[#E0E0E0]' : '!text-gray-900'
                    }`}
                  >
                    {category.label}
                  </span>
                </span>

                <FavoriteCategorySwitch
                  enabled={enabled}
                  isDark={isDark}
                  label={category.label}
                  onToggle={() => handleToggle(category.id, enabled)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </MotionDiv>
  )
}

export default FavoriteCategoriesPage
