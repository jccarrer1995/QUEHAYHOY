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
  const btnBase =
    'px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 border'
  const btnActive = 'bg-[#14b8a6] text-white border-[#14b8a6]'
  const btnInactive = isDark
    ? 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:text-[#E0E0E0]'
    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategorySelector
