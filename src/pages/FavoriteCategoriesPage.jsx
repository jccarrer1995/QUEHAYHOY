/**
 * Pantalla de visibilidad de categorías en el home (entrada desde la derecha).
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { CATEGORIES_SELECTOR } from '../components/events/index.js'
import { useCategoryVisibility } from '../contexts/CategoryVisibilityContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const MotionDiv = motion.div

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
        className={`flex shrink-0 items-center gap-2 border-b px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] ${borderCls} ${
          isDark ? '!text-[#E0E0E0]' : '!text-gray-900'
        }`}
      >
        <button
          type="button"
          onClick={handleBack}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${
            isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
          }`}
          aria-label="Volver"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className={`text-lg font-bold ${isDark ? '!text-[#E0E0E0]' : '!text-gray-900'}`}>Categorías favoritas</h1>
      </header>

      <p
        className={`shrink-0 py-3 pl-5 pr-[max(1.25rem,env(safe-area-inset-right,0px))] text-sm ${
          isDark ? '!text-gray-400' : '!text-gray-600'
        }`}
      >
        Activa o desactiva cada categoría para mostrarla u ocultarla en el home junto con sus eventos.
      </p>

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 pl-5 pr-[max(1.25rem,env(safe-area-inset-right,0px))]">
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
    </MotionDiv>
  )
}

export default FavoriteCategoriesPage
