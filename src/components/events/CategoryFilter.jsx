/**
 * CategoryFilter - Barra de categorías para filtrar eventos
 * Bares, Ferias, Conciertos (conectará con Firestore)
 */
export const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'bares', label: 'Bares' },
  { id: 'ferias', label: 'Ferias' },
  { id: 'conciertos', label: 'Conciertos' },
]

export function CategoryFilter({ activeCategory, onSelect, isDark = false }) {
  const btnBase =
    'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap'
  const btnActive = isDark
    ? 'bg-[#14b8a6] text-white'
    : 'bg-[#14b8a6] text-white'
  const btnInactive = isDark
    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-[#E0E0E0]'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
