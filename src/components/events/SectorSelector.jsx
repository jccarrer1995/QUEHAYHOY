/**
 * SectorSelector - Carrusel de iconos redondos con imágenes por sector
 * SECTORES TOP: Urdesa, Samborondón, Vía a la Costa, Puerto Santa Ana, Centro, etc.
 */
export const SECTORS = [
  { id: 'all', label: 'Todo', image: null },
  {
    id: 'urdesa',
    label: 'Urdesa',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
  },
  {
    id: 'las-penas',
    label: 'Las Peñas',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop',
  },
  {
    id: 'guayarte',
    label: 'Guayarte',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop',
  },
  {
    id: 'samanes',
    label: 'Samanes',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=200&fit=crop',
  },
  {
    id: 'kennedy',
    label: 'Kennedy',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop',
  },
  {
    id: 'bellavista',
    label: 'Bellavista',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=200&fit=crop',
  },
  {
    id: 'malecon-salado',
    label: 'Malecón del Salado',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&h=200&fit=crop',
  },
  {
    id: 'centro',
    label: 'Centro',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&h=200&fit=crop',
  },
  {
    id: 'alborada',
    label: 'Alborada',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop',
  },
]

export function SectorSelector({ activeSector, onSelect, isDark = false }) {
  const textCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const headingCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'

  return (
    <div className="w-full">
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${headingCl}`}>
        Sectores Top
      </h3>
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible scrollbar-hide">
      {SECTORS.map((sector) => {
        const isActive = activeSector === sector.id
        return (
          <button
            key={sector.id}
            type="button"
            onClick={() => onSelect(sector.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1 p-1 transition-all duration-200 ease-out active:scale-95 select-none cursor-pointer"
            aria-pressed={isActive}
          >
            <span
              className={`w-14 h-14 md:w-12 md:h-12 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                isActive
                  ? 'border-[#14b8a6] shadow-md shadow-[#14b8a6]/15'
                  : isDark
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {sector.image ? (
                <img
                  src={sector.image}
                  alt={sector.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span
                  className={`w-full h-full flex items-center justify-center text-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  ✨
                </span>
              )}
            </span>
            <span
              className={`text-[10px] md:text-xs font-medium -translate-y-0.5 ${isActive ? 'text-[#14b8a6]' : textCl}`}
            >
              {sector.label}
            </span>
          </button>
        )
      })}
      </div>
    </div>
  )
}

export default SectorSelector
