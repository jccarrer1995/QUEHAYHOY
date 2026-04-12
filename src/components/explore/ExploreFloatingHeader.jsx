/**
 * Barra flotante: búsqueda con blur y carrusel de chips de categoría.
 */
import { Search } from 'lucide-react'
import { CATEGORIES } from '../events/CategorySelector.jsx'
import { useCategoryVisibility } from '../../contexts/CategoryVisibilityContext.jsx'
import { ExploreSecondaryFiltersBar } from './ExploreSecondaryFiltersBar.jsx'

/**
 * @param {{
 *   searchQuery: string
 *   onSearchChange: (value: string) => void
 *   activeCategory: string
 *   onSelectCategory: (id: string) => void
 *   isDark: boolean
 *   isFreeFilter: boolean
 *   onFreeToggle: () => void
 *   timePreset: 'today' | 'tomorrow' | 'weekend' | 'month' | null
 *   onTimePresetChange: (preset: 'today' | 'tomorrow' | 'weekend' | 'month' | null) => void
 *   onOpenMoreFilters?: () => void
 * }} props
 */
export function ExploreFloatingHeader({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  isDark,
  isFreeFilter,
  onFreeToggle,
  timePreset,
  onTimePresetChange,
  onOpenMoreFilters,
}) {
  const { isCategoryVisible } = useCategoryVisibility()
  const visibleCategories = CATEGORIES.filter(
    (c) => c.id === 'all' || isCategoryVisible(c.id)
  )

  const shell = isDark
    ? 'border-white/10 bg-[#121212]/65 text-[#E0E0E0]'
    : 'border-black/10 bg-white/65 text-gray-900'

  const inputBg = isDark ? 'bg-white/10 placeholder:text-gray-500' : 'bg-black/5 placeholder:text-gray-500'
  const chipActive = 'bg-[#14b8a6] text-white border-[#14b8a6]'
  const chipIdle = isDark
    ? 'border-gray-600 bg-white/5 text-gray-200 hover:border-gray-500'
    : 'border-gray-200 bg-white/80 text-gray-800 hover:border-gray-300'

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
      <div
        className={`pointer-events-auto rounded-2xl border px-3 py-2 shadow-sm backdrop-blur-[10px] ${shell}`}
      >
        <label className="sr-only" htmlFor="explore-search">
          Buscar eventos en el mapa
        </label>
        <div className="relative flex items-center gap-2">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
            aria-hidden
          />
          {/* text-[16px]: en iOS Safari, fuentes menores a 16px provocan zoom al foco y el layout “salta”. */}
          <input
            id="explore-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, sector o descripción…"
            autoComplete="off"
            enterKeyHint="search"
            inputMode="search"
            className={`w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-[16px] outline-none ring-0 focus:ring-2 focus:ring-[#14b8a6]/50 ${inputBg}`}
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          />
        </div>
      </div>

      <div
        className={`pointer-events-auto flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${shell} rounded-2xl border px-2 py-2 shadow-sm backdrop-blur-[10px]`}
        role="list"
      >
        {visibleCategories.map((cat) => {
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="listitem"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition active:scale-[0.98] ${
                active ? chipActive : chipIdle
              }`}
            >
              <span aria-hidden>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      <ExploreSecondaryFiltersBar
        isFreeActive={isFreeFilter}
        onFreeToggle={onFreeToggle}
        timePreset={timePreset}
        onTimePresetChange={onTimePresetChange}
        onOpenMoreFilters={onOpenMoreFilters}
        isDark={isDark}
      />
    </header>
  )
}

export default ExploreFloatingHeader
