/**
 * FloatingButtons - FAB: Tema, Filter (teal), Gratis (white)
 * Solo móvil, esquina inferior
 */
export function FloatingButtons({ onFilter, onGratis, onToggleTheme, isDark = false, isGratisActive = false }) {
  const filterBg = 'bg-[#14b8a6] text-white'
  const gratisBg = isGratisActive
    ? 'bg-[#14b8a6] text-white'
    : isDark
      ? 'bg-gray-800 text-[#E0E0E0]'
      : 'bg-white text-gray-900'
  const themeBg = isDark ? 'bg-gray-800 text-[#E0E0E0]' : 'bg-white text-gray-900'
  const shadow = 'shadow-lg'

  return (
    <div className="fixed bottom-20 left-4 right-4 flex justify-between items-center z-40 md:hidden">
      {/* Botón modo claro/oscuro */}
      <button
        type="button"
        onClick={onToggleTheme}
        className={`flex-shrink-0 p-3 rounded-full ${themeBg} ${shadow}`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Gratis y Filter */}
      <div className="flex gap-3">
      <button
        type="button"
        onClick={onGratis}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${gratisBg} ${shadow} font-medium text-sm`}
      >
        Gratis
      </button>
      <button
        type="button"
        onClick={onFilter}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${filterBg} ${shadow} font-medium text-sm`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
      </button>
      </div>
    </div>
  )
}

export default FloatingButtons
