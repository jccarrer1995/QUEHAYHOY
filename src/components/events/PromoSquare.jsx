import { useNavigate } from 'react-router-dom'

/**
 * @param {{
 *   title: string
 *   badge: 'FERIADO' | 'ESPECIAL'
 *   imageUrl?: string
 *   isDark?: boolean
 * }} props
 */
export function PromoSquare({ title, badge, imageUrl = '', isDark = false }) {
  const navigate = useNavigate()

  function handleOpenCollection() {
    navigate(`/?collection=${encodeURIComponent(title)}`)
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

      <h3 className="absolute bottom-2 left-2 right-2 text-sm font-black leading-tight text-white line-clamp-2">
        {title}
      </h3>
    </article>
  )
}

export default PromoSquare
