/**
 * Bottom sheet legal / info: entra desde abajo, cierra con X, arrastre hacia abajo o pull en scroll al tope.
 */
import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

const MotionDiv = motion.div
import { X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { getLegalSheetBody } from './legalSheetContent.js'

/** @typedef {'terms' | 'privacy' | 'about' | null} LegalSheetType */

const CLOSE_OFFSET_PX = 96
const CLOSE_VELOCITY = 420
const PULL_CLOSE_PX = 88

const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/**
 * @param {number} index - 0-based
 * @returns {string}
 */
function sectionEnumeration(index) {
  return ROMAN_UPPER[index] ?? String(index + 1)
}

/**
 * @param {{ open: boolean, type: NonNullable<LegalSheetType>, onClose: () => void }} props
 */
export function LegalBottomSheet({ open, type, onClose }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const dragControls = useDragControls()
  const scrollRef = useRef(null)
  const pullRef = useRef({ active: false, startY: 0 })

  const pageBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const handleCls = isDark ? 'bg-gray-500/50' : 'bg-gray-400/60'
  const closeHoverCls = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'

  const meta = getLegalSheetBody(type)
  const title = meta.title

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [open, type])

  function onScrollAreaTouchStart(e) {
    const el = scrollRef.current
    if (!el || el.scrollTop > 0) {
      pullRef.current = { active: false, startY: 0 }
      return
    }
    pullRef.current = { active: true, startY: e.touches[0]?.clientY ?? 0 }
  }

  function onScrollAreaTouchMove(e) {
    const el = scrollRef.current
    const touch = e.touches[0]
    if (!el || !touch || !pullRef.current.active) return
    if (el.scrollTop > 0) {
      pullRef.current.active = false
      return
    }
    const dy = touch.clientY - pullRef.current.startY
    if (dy > PULL_CLOSE_PX) {
      pullRef.current.active = false
      requestClose()
    }
  }

  function onScrollAreaTouchEnd() {
    pullRef.current = { active: false, startY: 0 }
  }

  function startDrag(e) {
    dragControls.start(e)
  }

  const modal = (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          key="legal-sheet"
          className="fixed inset-0 z-[130] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-sheet-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar"
            onClick={requestClose}
          />

          <MotionDiv
            className={`relative z-10 flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl shadow-2xl ${pageBg}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY) {
                requestClose()
              }
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-3 pb-2 active:cursor-grabbing"
              onPointerDown={startDrag}
            >
              <div className={`h-1.5 w-12 rounded-full ${handleCls}`} aria-hidden />
            </div>

            <div
              className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 pb-3 pt-0 ${borderCls}`}
              onPointerDown={startDrag}
            >
              <h2 id="legal-sheet-title" className="min-w-0 flex-1 text-lg font-bold leading-tight">
                {title}
              </h2>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={requestClose}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${closeHoverCls}`}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 ${mutedCls}`}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={onScrollAreaTouchStart}
              onTouchMove={onScrollAreaTouchMove}
              onTouchEnd={onScrollAreaTouchEnd}
            >
              <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-[#cfcfcf]' : 'text-gray-700'}`}>
                {meta.blocks.map((block, index) => (
                  <section key={`${block.heading}-${index}`}>
                    <h3
                      className={`mb-2 text-xs font-bold uppercase tracking-wide ${
                        isDark ? 'text-white' : 'text-black'
                      }`}
                    >
                      {sectionEnumeration(index)}. {block.heading.toUpperCase()}
                    </h3>
                    {block.paragraphs.map((p, i) => (
                      <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">
                        {p}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
