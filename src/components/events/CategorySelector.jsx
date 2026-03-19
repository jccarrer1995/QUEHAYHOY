/**
 * CategorySelector - Tarjetas verticales con iconos (Bares, Conciertos, Comida, Cine)
 * Horizontal scroll móvil | Grid desktop
 */
export const CATEGORIES = [
  { id: 'all', label: 'Todo', icon: '✨', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'bares', label: 'Bares', icon: '🍺', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'conciertos', label: 'Conciertos', icon: '🎸', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'comida', label: 'Comida', icon: '🍔', color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'cine', label: 'Cine', icon: '🎬', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'ferias', label: 'Ferias', icon: '🎪', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
]

export function CategorySelector({ activeCategory, onSelect, isDark = false }) {
  const cardBg = isDark ? 'bg-white/5 dark:bg-gray-800/80' : 'bg-white'
  const borderCl = isDark ? 'border-gray-700' : 'border-gray-200'
  const textCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const accentBorder = 'border-[#14b8a6]'

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible md:gap-4 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 w-20 md:w-24 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${cardBg} ${borderCl} ${isActive ? accentBorder + ' ring-2 ring-[#14b8a6]/30' : ''}`}
          >
            <span className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl ${cat.color}`}>
              {cat.icon}
            </span>
            <span className={`text-xs font-medium ${textCl}`}>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategorySelector
