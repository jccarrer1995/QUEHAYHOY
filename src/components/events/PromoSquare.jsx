import { useNavigate } from 'react-router-dom'

/**
 * @param {{
 *   id: string
 *   title: string
 *   dateLabel?: string
 *   badge: 'FERIADO' | 'ESPECIAL'
 *   imageUrl?: string
 *   isDark?: boolean
 * }} props
 */
export function PromoSquare({ id, title, dateLabel = '', badge, imageUrl = '', isDark = false }) {
  const navigate = useNavigate()

  function handleOpenCollection() {
    navigate(`/coleccion/${id}`)
  }

  return (
    <article
      className="relative w-40 h-40 aspect-square flex-shrink-0 overflow-hidden rounded-3xl cursor-pointer group"
      onClick={handleOpenCollection}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleOpenCollection()
      }}
      aria-label={`Explorar colección: ${title}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className={`h-full w-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-black">
        {badge}
      </span>

      <div className="absolute bottom-2 left-2 right-2">
        <h3 className="text-sm font-black leading-tight text-white line-clamp-2">
          {title}
        </h3>
        {dateLabel ? (
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-white/90">
            {dateLabel}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default PromoSquare
