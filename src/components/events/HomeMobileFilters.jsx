/**
 * Home móvil: label «Filtrar» fijo + pills horizontales (estilo PedidosYa); cada pill abre sheet y muestra la selección aplicada.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ListFilter, X } from 'lucide-react'
import { CategorySelector, CATEGORIES } from './CategorySelector.jsx'
import { SectorSelector, SECTORS } from './SectorSelector.jsx'

const MotionDiv = motion.div

/**
 * @param {{
 *   isDark: boolean
 *   activeCategory: string
 *   activeSector: string
 *   onCategorySelect: (id: string) => void
 *   onSectorSelect: (id: string) => void
 * }} props
 */
export function HomeMobileFilters({
  isDark,
  activeCategory,
  activeSector,
  onCategorySelect,
  onSectorSelect,
}) {
  const [sheet, setSheet] = useState(null)
  const [draftCategory, setDraftCategory] = useState(activeCategory)
  const [draftSector, setDraftSector] = useState(activeSector)
  const [isDesktopSheet, setIsDesktopSheet] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  )

  const requestClose = useCallback(() => setSheet(null), [])

  function openCategorySheet() {
    setDraftCategory(activeCategory)
    setSheet('category')
  }

  function openSectorSheet() {
    setDraftSector(activeSector)
    setSheet('sector')
  }

  function applyCategory() {
    onCategorySelect(draftCategory)
    setSheet(null)
  }

  function applySector() {
    onSectorSelect(draftSector)
    setSheet(null)
  }

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setIsDesktopSheet(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!sheet) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheet])

  const pageBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'
  const closeHoverCls = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'

  const categoryLabelText = useMemo(() => {
    if (activeCategory === 'all') return 'Categoría'
    return CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory
  }, [activeCategory])
  const sectorLabelText = useMemo(() => {
    if (activeSector === 'all') return 'Sector'
    return SECTORS.find((s) => s.id === activeSector)?.label ?? activeSector
  }, [activeSector])

  const filtrarLabelCl = isDark ? 'text-gray-500' : 'text-gray-600'

  const pillBase =
    'inline-flex max-w-[min(200px,55vw)] md:max-w-[240px] shrink-0 items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm active:scale-[0.98] transition-colors'
  const pillInactiveCls = isDark
    ? `${pillBase} border-gray-600 bg-[#1e1e1e] text-[#E0E0E0] hover:border-gray-500`
    : `${pillBase} border-gray-200 bg-white text-[#0a0a0a] hover:border-gray-300`
  const pillActiveCls = `${pillBase} border-[#14b8a6] bg-[#14b8a6] text-white hover:border-[#0d9488] hover:bg-[#0d9488]`

  const categoryPillCls = activeCategory !== 'all' ? pillActiveCls : pillInactiveCls
  const sectorPillCls = activeSector !== 'all' ? pillActiveCls : pillInactiveCls
  const categoryChevronCls =
    activeCategory !== 'all' ? 'h-4 w-4 shrink-0 text-white/90' : 'h-4 w-4 shrink-0 opacity-70'
  const sectorChevronCls =
    activeSector !== 'all' ? 'h-4 w-4 shrink-0 text-white/90' : 'h-4 w-4 shrink-0 opacity-70'

  const applyCls = isDark
    ? 'w-full rounded-2xl bg-[#14b8a6] py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/20 hover:bg-[#0d9488]'
    : 'w-full rounded-2xl bg-[#14b8a6] py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/25 hover:bg-[#0d9488]'

  const sheetTitle = sheet === 'category' ? 'Categoría' : sheet === 'sector' ? 'Sector' : ''
  const sheetTitleId = 'home-filter-sheet-title'
  /* Anula h2 { color: var(--text-h) } de index.css cuando el sistema está en dark y el sheet es claro. */
  const sheetHeadingCls = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'

  const modal = (
    <AnimatePresence mode="wait">
      {sheet ? (
        <MotionDiv
          key={`home-filter-sheet-${sheet}`}
          className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar sin aplicar"
            onClick={requestClose}
          />

          <MotionDiv
            className={`relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:max-w-md md:max-h-[80vh] md:rounded-2xl ${pageBg}`}
            initial={isDesktopSheet ? { opacity: 0, scale: 0.96, y: 0 } : { y: '100%' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={isDesktopSheet ? { opacity: 0, scale: 0.96, y: 0 } : { y: '100%' }}
            transition={
              isDesktopSheet
                ? { duration: 0.2 }
                : { type: 'spring', damping: 32, stiffness: 380 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex shrink-0 flex-col items-center border-b pt-2 ${borderCls}`}>
              <div className={`mb-2 h-1.5 w-12 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} aria-hidden />
              <div className="flex w-full items-center justify-between px-4 pb-3">
                <h2
                  id={sheetTitleId}
                  className={`m-0 text-base font-bold tracking-tight ${sheetHeadingCls}`}
                >
                  {sheetTitle}
                </h2>
                <button
                  type="button"
                  onClick={requestClose}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${closeHoverCls} ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4">
              {sheet === 'category' ? (
                <CategorySelector
                  variant="sheet"
                  activeCategory={draftCategory}
                  onSelect={setDraftCategory}
                  isDark={isDark}
                />
              ) : (
                <SectorSelector
                  variant="sheet"
                  activeSector={draftSector}
                  onSelect={setDraftSector}
                  isDark={isDark}
                />
              )}
            </div>

            <div
              className={`shrink-0 border-t px-4 pt-3 ${borderCls}`}
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="button"
                className={`${applyCls} transition enabled:cursor-pointer`}
                onClick={sheet === 'category' ? applyCategory : applySector}
              >
                Aplicar
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )

  return (
    <>
      <div className="flex w-full min-w-0 items-stretch gap-3" role="group" aria-label="Filtros del listado">
        <div className="inline-flex shrink-0 items-center gap-1.5 py-2">
          <ListFilter className="h-4 w-4 shrink-0 text-[#14b8a6]" strokeWidth={2} aria-hidden />
          <span className={`text-sm font-semibold tracking-tight ${filtrarLabelCl}`}>Filtrar</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 py-0.5">
          <button
            type="button"
            className={categoryPillCls}
            onClick={openCategorySheet}
            aria-haspopup="dialog"
            aria-expanded={sheet === 'category'}
            aria-label={
              activeCategory === 'all'
                ? 'Filtrar por categoría. Abrir opciones'
                : `Categoría: ${categoryLabelText}. Abrir opciones`
            }
          >
            <span className="truncate">{categoryLabelText}</span>
            <ChevronDown className={categoryChevronCls} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={sectorPillCls}
            onClick={openSectorSheet}
            aria-haspopup="dialog"
            aria-expanded={sheet === 'sector'}
            aria-label={
              activeSector === 'all'
                ? 'Filtrar por sector. Abrir opciones'
                : `Sector: ${sectorLabelText}. Abrir opciones`
            }
          >
            <span className="truncate">{sectorLabelText}</span>
            <ChevronDown className={sectorChevronCls} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
      {typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  )
}

export default HomeMobileFilters
