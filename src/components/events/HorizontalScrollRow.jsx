import { useCallback, useEffect, useRef } from 'react'

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], label'

/**
 * @param {EventTarget | null} target
 */
function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR))
}

/**
 * Fila horizontal con scroll por rueda, arrastre y touch (desktop + móvil).
 *
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function HorizontalScrollRow({ className = '', children }) {
  const rowRef = useRef(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  })

  useEffect(() => {
    const el = rowRef.current
    if (!el) return undefined

    const handleWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePointerDown = useCallback((e) => {
    const el = rowRef.current
    if (!el || e.button !== 0 || isInteractiveTarget(e.target)) return
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    }
    el.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e) => {
    const el = rowRef.current
    const drag = dragRef.current
    if (!el || !drag.active) return

    const deltaX = e.clientX - drag.startX
    if (Math.abs(deltaX) > 4) drag.moved = true
    if (!drag.moved) return

    el.scrollLeft = drag.scrollLeft - deltaX
  }, [])

  const endDrag = useCallback((e) => {
    const el = rowRef.current
    const drag = dragRef.current
    if (!el || !drag.active) return

    drag.active = false
    if (drag.pointerId != null) {
      try {
        el.releasePointerCapture(drag.pointerId)
      } catch {
        // ignore
      }
    }

    dragRef.current.moved = drag.moved
  }, [])

  const handleClickCapture = useCallback((e) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current.moved = false
    }
  }, [])

  return (
    <div
      ref={rowRef}
      className={`scrollbar-hide flex min-w-0 max-w-full touch-pan-x cursor-grab flex-nowrap gap-2 overflow-x-auto overscroll-x-contain active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  )
}

export default HorizontalScrollRow
