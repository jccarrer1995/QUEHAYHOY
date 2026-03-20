/**
 * QuickFilters - Pills rápidos: Gratis, Cerca de mí, Hoy, Bajo costo
 */
export const QUICK_FILTERS = [
  { id: 'gratis', label: 'Gratis', icon: '🍕' },
  { id: 'cerca', label: 'Cerca de mí', icon: '📍' },
  { id: 'hoy', label: 'Hoy', icon: '📅' },
  { id: 'bajo', label: 'Bajo costo', icon: '👥' },
]

export function QuickFilters({ activeFilters = [], onToggle, isDark = false }) {
  const btnBase =
    'px-2.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5'
  const btnActive = 'bg-[#14b8a6] text-white border border-[#14b8a6]'
  const btnInactive = isDark
    ? 'bg-transparent text-gray-400 border border-gray-600 hover:border-gray-500 hover:text-[#E0E0E0]'
    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
      {QUICK_FILTERS.map((f) => {
        const isActive = activeFilters.includes(f.id)
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onToggle?.(f.id)}
            className={`${btnBase} ${isActive ? btnActive : btnInactive} flex-shrink-0`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default QuickFilters
