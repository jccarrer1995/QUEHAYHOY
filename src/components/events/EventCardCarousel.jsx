/**
 * EventCardCarousel - Tarjeta Home (carrusel)
 * Badge: Firestore `badgeType` — mismo sistema que EventCard
 */
import { useNavigate } from 'react-router-dom'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'
import { resolveEventBadgeTypeFromDoc } from '../../lib/eventBadges.js'
import { EventBadge } from './EventBadge.jsx'

export function EventCardCarousel({ event, isDark = false }) {
  const navigate = useNavigate()
  const data = event ?? {}
  const { title, sector, date, price, type: evType, recurrence_day } = data
  const isRecurring = evType === 'recurring' || data.eventType === 'recurring'
  const dateLine =
    isRecurring && recurrence_day != null && !Number.isNaN(Number(recurrence_day))
      ? formatRecurrenceLabel(recurrence_day)
      : date
  const imageUrl = data.imageUrl ?? data.image_url
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
        <EventBadge badgeType={resolveEventBadgeTypeFromDoc(data)} />
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
