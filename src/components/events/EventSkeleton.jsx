/**
 * EventSkeleton - Skeletons con shimmer para carga de eventos
 * Imita dimensiones y estructura de EventCardCarousel para evitar saltos.
 */

export function EventSkeleton({ isDark = false }) {
  const borderCl = isDark ? 'border-gray-700' : 'border-gray-200'
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-white'

  const shimmerCls = isDark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer-light'

  return (
    <article
      className={`flex-shrink-0 w-[280px] sm:w-[300px] md:flex-shrink md:w-full rounded-2xl border ${borderCl} ${cardBg} overflow-hidden shadow-sm`}
      aria-hidden="true"
    >
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <div className={`absolute inset-0 ${shimmerCls}`} />

        {/* "Badge" placeholder (mismo layout/posicionamiento que la card real) */}
        <div className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-md text-white">
          <div className={`h-4 w-28 rounded-md ${shimmerCls}`} />
        </div>
      </div>

      <div className="p-3 relative">
        {/* Título (2 líneas con line-clamp-2 en la card real) */}
        <div className={`h-10 w-full rounded-md ${shimmerCls}`} />

        {/* Fecha + sector (stack vertical) */}
        <div className="flex flex-col gap-0.5 mt-1">
          <div className={`h-4 w-4/5 rounded-md ${shimmerCls}`} />
          <div className={`h-4 w-3/4 rounded-md ${shimmerCls}`} />
        </div>

        {/* Fila inferior (icono + precio con border-t) */}
        <div
          className={`flex items-center justify-between mt-2 pt-2 border-t ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          }`}
        >
          <div className={`h-5 w-16 rounded-md ${shimmerCls}`} />
          <div className={`h-5 w-18 rounded-md ${shimmerCls}`} />
        </div>
      </div>
    </article>
  )
}

export default EventSkeleton

