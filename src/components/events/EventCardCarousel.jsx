/**
 * EventCardCarousel - Tarjeta con badge conceptual
 * Badge: MASIVO (cian), FERIA (amarillo), PROMO (rojo), SOCIAL (morado)
 */
import { useNavigate } from 'react-router-dom'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'

const BADGE_STYLES = {
  MASIVO: 'bg-cyan-500/30 text-cyan-700 border-cyan-500/50 dark:bg-cyan-500/25 dark:text-cyan-300 dark:border-cyan-400/50',
  FERIA: 'bg-amber-500/30 text-amber-800 border-amber-500/50 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/50',
  PROMO: 'bg-red-500/30 text-red-700 border-red-500/50 dark:bg-red-500/25 dark:text-red-300 dark:border-red-400/50',
  SOCIAL: 'bg-purple-500/30 text-purple-700 border-purple-500/50 dark:bg-purple-500/25 dark:text-purple-300 dark:border-purple-400/50',
}

function getBadgeStyle(badgeLabel) {
  const key = typeof badgeLabel === 'string' ? badgeLabel.trim().toUpperCase() : ''
  if (key === 'MASIVO' || key === 'FERIA' || key === 'PROMO' || key === 'SOCIAL') return BADGE_STYLES[key]
  return BADGE_STYLES.SOCIAL
}

export function EventCardCarousel({ event, isDark = false }) {
  const navigate = useNavigate()
  const data = event ?? {}
  const { title, sector, date, price, badgeLabel, type: evType, recurrence_day } = data
  const isRecurring = evType === 'recurring' || data.eventType === 'recurring'
  const dateLine =
    isRecurring && recurrence_day != null && !Number.isNaN(Number(recurrence_day))
      ? formatRecurrenceLabel(recurrence_day)
      : date
  const imageUrl = data.imageUrl ?? data.image_url
  const displayLabel = (badgeLabel || data.capacity_level || 'SOCIAL').toString().trim().toUpperCase()
  const badgeClass = getBadgeStyle(badgeLabel || data.capacity_level || 'SOCIAL')
  const textCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const mutedCl = isDark ? 'text-gray-400' : 'text-gray-500'
  const accentCl = 'text-[#14b8a6]'
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-white'
  const borderCl = isDark ? 'border-gray-700' : 'border-gray-200'

  const formatPrice = (p) => {
    const num = typeof p === 'number' ? p : Number(p)
    if (num === 0 || p == null || Number.isNaN(num)) return 'Gratis'
    return num % 1 === 0 ? `$${num}` : `$${Number(num).toFixed(2)}`
  }

  const popularityCount = Math.min(Math.max(data.popularidad || 1, 1), 3)
  const fueguitos = '🔥'.repeat(popularityCount)

  const location = sector ?? data.location

  function goToDetail() {
    const eventId = data?.id
    if (!eventId) return
    navigate(`/evento/${eventId}`)
  }

  return (
    <article
      className={`flex-shrink-0 w-[280px] sm:w-[300px] md:flex-shrink md:w-full rounded-2xl border ${borderCl} ${cardBg} overflow-hidden shadow-sm
        transition-all duration-300 ease-in-out
        md:hover:-translate-y-[5px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        md:hover:border-b-2 md:hover:border-b-[#00C3BB] cursor-pointer`}
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') goToDetail()
      }}
    >
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {imageUrl ? (
          <img src={optimizeImageUrl(imageUrl)} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
        )}
        {displayLabel && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-md border ${badgeClass}`}
          >
            {displayLabel}
          </span>
        )}
      </div>
      <div className="p-3 relative">
        <h3 className={`font-bold text-sm uppercase tracking-wide ${textCl} line-clamp-2 pr-12`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
          {dateLine && (
            <p className={`flex items-center gap-2 text-xs md:text-sm ${mutedCl}`}>
              <span>🕐</span>
              {dateLine}
            </p>
          )}
          {location && (
            <p className={`flex items-center gap-2 text-xs md:text-sm ${mutedCl}`}>
              <span>📍</span>
              {location}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <span className="flex gap-1 text-orange-500 font-bold text-base" aria-hidden>{fueguitos}</span>
          <p className={`font-bold text-base ${accentCl}`}>
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </article>
  )
}

export default EventCardCarousel
