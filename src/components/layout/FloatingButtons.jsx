/**
 * FloatingButtons - FAB: Tema, Filter (teal), Gratis (white)
 * Solo móvil, esquina inferior
 */
export function FloatingButtons({ onToggleTheme, isDark = false }) {
  const themeBg = isDark ? 'bg-gray-800 text-[#E0E0E0]' : 'bg-white text-gray-900'
  const shadow = 'shadow-lg'

  return (
    <div className="fixed bottom-28 left-4 right-4 flex justify-between items-center z-40 md:hidden">
      {/* Botón modo claro/oscuro */}
      <button
        type="button"
        onClick={onToggleTheme}
        className={`flex-shrink-0 p-3 rounded-full ${themeBg} ${shadow}`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div />
    </div>
  )
}

export default FloatingButtons
