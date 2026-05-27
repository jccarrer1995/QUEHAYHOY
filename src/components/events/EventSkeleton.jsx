/**
 * EventSkeleton - Skeletons con shimmer para carga de eventos
 * Imita dimensiones y estructura de EventCard / EventCardCarousel.
 *
 * @param {{ isDark?: boolean, lightOnly?: boolean, layout?: 'carousel' | 'grid' }} props
 * `lightOnly`: solo grises claros (p. ej. Mis eventos en modo oscuro).
 */

export function EventSkeleton({ isDark = false, lightOnly = false, layout = 'carousel' }) {
  const useLightGray = lightOnly || !isDark

  const borderCl = useLightGray ? 'border-gray-200' : 'border-gray-700'
  const cardBg = useLightGray ? 'bg-white' : 'bg-gray-800/50'
  const imageBg = useLightGray ? 'bg-gray-200' : 'bg-gray-700'
  const blockBg = useLightGray ? 'bg-gray-200' : 'bg-gray-700'
  const dividerCl = useLightGray ? 'border-gray-200' : 'border-gray-600'
  const shimmerCls = useLightGray ? 'skeleton-shimmer-light' : 'skeleton-shimmer-dark'

  const widthCls =
    layout === 'grid'
      ? 'w-full'
      : 'flex-shrink-0 w-[280px] sm:w-[300px] md:flex-shrink md:w-full'

  return (
    <article
      className={`${widthCls} overflow-hidden rounded-2xl border ${borderCl} ${cardBg} shadow-sm`}
      aria-hidden="true"
    >
      <div className={`relative aspect-[16/9] overflow-hidden ${imageBg}`}>
        <div className={`absolute inset-0 ${shimmerCls}`} />
        <div className="absolute top-3 right-3">
          <div className={`h-4 w-28 rounded-md ${blockBg} ${shimmerCls}`} />
        </div>
      </div>

      <div className="relative p-3">
        <div className={`h-10 w-full rounded-md ${blockBg} ${shimmerCls}`} />

        <div className="mt-1 flex flex-col gap-1.5">
          <div className={`h-4 w-4/5 rounded-md ${blockBg} ${shimmerCls}`} />
          <div className={`h-4 w-3/4 rounded-md ${blockBg} ${shimmerCls}`} />
        </div>

        <div className={`mt-2 flex items-center justify-between border-t pt-2 ${dividerCl}`}>
          <div className={`h-5 w-16 rounded-md ${blockBg} ${shimmerCls}`} />
          <div className={`h-5 w-20 rounded-md ${blockBg} ${shimmerCls}`} />
        </div>
      </div>
    </article>
  )
}

export default EventSkeleton

