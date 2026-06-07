import {
  Beer,
  Clapperboard,
  Drama,
  FerrisWheel,
  Gamepad2,
  Music,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useCategoryVisibility } from '../../contexts/CategoryVisibilityContext.jsx'
import { HorizontalScrollRow } from './HorizontalScrollRow.jsx'

/**
 * @typedef {import('lucide-react').LucideIcon} LucideIcon
 */

/**
 * Categorías UI (Lucide) + `markerEmoji` para marcadores del mapa / opciones nativas.
 * @type {{ id: string, label: string, Icon: LucideIcon, markerEmoji: string, color: string }[]}
 */
export const CATEGORIES = [
  { id: 'all', label: 'Todo', Icon: Sparkles, markerEmoji: '✨', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'bares', label: 'Bares', Icon: Beer, markerEmoji: '🍺', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'conciertos', label: 'Conciertos', Icon: Music, markerEmoji: '🎸', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'comida', label: 'Comida', Icon: UtensilsCrossed, markerEmoji: '🍔', color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'cine', label: 'Cine', Icon: Clapperboard, markerEmoji: '🎬', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'ferias', label: 'Ferias', Icon: FerrisWheel, markerEmoji: '🎪', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'videojuegos', label: 'Videojuegos', Icon: Gamepad2, markerEmoji: '🎮', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'teatro', label: 'Teatro', Icon: Drama, markerEmoji: '🎭', color: 'bg-rose-100 dark:bg-rose-900/30' },
]

/**
 * @param {{
 *   activeCategory: string
 *   onSelect: (id: string) => void
 *   isDark?: boolean
 *   variant?: 'toolbar' | 'sheet'
 * }} props
 */
export function CategorySelector({ activeCategory, onSelect, isDark = false, variant = 'toolbar' }) {
  const { isCategoryVisible } = useCategoryVisibility()
  const visibleCategories = CATEGORIES.filter(
    (category) => category.id === 'all' || isCategoryVisible(category.id)
  )
  const btnBase =
    'px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 border cursor-pointer'
  const btnActive = 'bg-[#14b8a6] text-white border-[#14b8a6]'
  const btnInactive = isDark
    ? 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:text-[#E0E0E0]'
    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
  const headingCl = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'

  const scrollRowCls = 'flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide touch-pan-x'

  const chipButtons = visibleCategories.map((cat) => {
    const isActive = activeCategory === cat.id
    const CatIcon = cat.Icon
    return (
      <button
        key={cat.id}
        type="button"
        onClick={() => onSelect(cat.id)}
        className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
      >
        <CatIcon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <span>{cat.label}</span>
      </button>
    )
  })

  if (variant === 'sheet') {
    return (
      <div className="w-full min-w-0">
        <HorizontalScrollRow className="pb-2">{chipButtons}</HorizontalScrollRow>
      </div>
    )
  }

  return (
    <div className="-mx-4 flex w-full items-center gap-3 px-4 pb-2 md:mx-0 md:px-0">
      <h3 className={`shrink-0 text-sm font-bold tracking-wider ${headingCl}`}>Categorías</h3>
      <div className={scrollRowCls}>{chipButtons}</div>
    </div>
  )
}

export default CategorySelector
