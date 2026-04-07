import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SPECIAL_COLLECTIONS } from '../../lib/specialCollections.js'
import { PromoSquare } from './PromoSquare'

/**
 * @param {{ isDark?: boolean }} props
 */
export function SpecialCollections({ isDark = false }) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const visibleCollections = useMemo(() => {
    const now = new Date()
    const todayMonth = now.getMonth() + 1
    const todayDay = now.getDate()
    return SPECIAL_COLLECTIONS.filter((item) => {
      if (typeof item.month !== 'number' || typeof item.day !== 'number') return true
      if (item.month > todayMonth) return true
      if (item.month === todayMonth && item.day >= todayDay) return true
      return false
    })
  }, [])

  function updateScrollControls() {
    const el = scrollerRef.current
    if (!el) return
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4)
  }

  useEffect(() => {
    updateScrollControls()
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => updateScrollControls()
    const onResize = () => updateScrollControls()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [visibleCollections.length])

  function scrollByAmount(dir) {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.max(420, Math.floor(el.clientWidth * 0.7)) * dir
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (visibleCollections.length === 0) return null

  return (
    <section className={`mt-0 pt-2 md:mt-0.5 md:pt-3 mb-5 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="text-lg font-extrabold"
          style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
        >
          Colecciones Especiales
        </h2>

        <div className="hidden md:flex items-center gap-2">
          {canScrollLeft ? (
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
                isDark
                  ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222] cursor-pointer'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
              aria-label="Desplazar colecciones a la izquierda"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          {canScrollRight ? (
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
                isDark
                  ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222] cursor-pointer'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
              aria-label="Desplazar colecciones a la derecha"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
      >
        {visibleCollections.map((item) => (
          <PromoSquare
            key={item.id}
            id={item.id}
            title={item.title}
            dateLabel={item.dateLabel}
            badge={item.badge}
            imageUrl={item.imageUrl}
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  )
}

export default SpecialCollections
