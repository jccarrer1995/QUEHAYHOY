import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventCardCarousel } from './EventCardCarousel'

/**
 * @param {{ events: Array<any>, isDark?: boolean }} props
 */
export function HorizontalEventRow({ events, isDark = false }) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  function updateScrollState() {
    const el = scrollerRef.current
    if (!el) return
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    setHasOverflow(maxScrollLeft > 4)
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4)
  }

  useEffect(() => {
    // Estado inicial optimista mientras se calcula el ancho real.
    if (events.length > 1) {
      setHasOverflow(true)
      setCanScrollRight(true)
    }
    const t1 = window.setTimeout(() => updateScrollState(), 0)
    const t2 = window.setTimeout(() => updateScrollState(), 180)
    const t3 = window.setTimeout(() => updateScrollState(), 420)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [events.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    const onResize = () => updateScrollState()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)

    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateScrollState())
      ro.observe(el)
    }

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
    }
  }, [])

  function scrollByAmount(dir) {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.max(260, Math.floor(el.clientWidth * 0.72)) * dir
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
    window.setTimeout(() => {
      updateScrollState()
    }, 220)
  }

  return (
    <>
      <div className="-mt-12 mb-4 hidden md:flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          disabled={!hasOverflow || !canScrollLeft}
          className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
            !hasOverflow || !canScrollLeft
              ? isDark
                ? 'border-gray-800 bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222]'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          disabled={!hasOverflow || !canScrollRight}
          className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
            !hasOverflow || !canScrollRight
              ? isDark
                ? 'border-gray-800 bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222]'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
      >
        {events.map((event) => (
          <EventCardCarousel key={event.id} event={event} isDark={isDark} />
        ))}
      </div>
    </>
  )
}

export default HorizontalEventRow
