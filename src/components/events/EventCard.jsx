/**
 * EventCard - Tarjeta de evento (QUEHAYHOY)
 * Badge: `badgeType` en Firestore → EventBadge (colores por tipo, texto blanco, sin iconos)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'
import { resolveEventBadgeTypeFromDoc } from '../../lib/eventBadges.js'
import { EventBadge } from './EventBadge.jsx'

export function EventCard({ event, isDark = false }) {
  const navigate = useNavigate()
  const {
    id,
    title,
    description,
    sector,
    date,
    price,
    imageUrl,
    popularidad,
    type: eventTypeField,
    recurrence_day,
  } = event ?? {}

  function goToDetail() {
    if (!id) return
    navigate(`/evento/${id}`)
  }
  const isRecurring =
    eventTypeField === 'recurring' || event?.eventType === 'recurring'
  const dateLine =
    isRecurring && recurrence_day != null && !Number.isNaN(Number(recurrence_day))
      ? formatRecurrenceLabel(recurrence_day)
      : date

  const [isLoading, setIsLoading] = useState(!!imageUrl)

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoading(!!imageUrl)
    })
  }, [imageUrl])

  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'

  return (
    <article
      className={`rounded-xl border ${borderColor} ${cardBg} overflow-hidden shadow-sm
        transition-all duration-300 ease-in-out
        md:hover:-translate-y-[5px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        md:hover:border-b-2 md:hover:border-b-[#00C3BB]
        ${id ? 'cursor-pointer' : ''}`}
      onClick={id ? goToDetail : undefined}
      role={id ? 'button' : undefined}
      tabIndex={id ? 0 : undefined}
      onKeyDown={
        id
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') goToDetail()
            }
          : undefined
      }
    >
      <div
        className={`aspect-[16/9] bg-gray-200 dark:bg-gray-800 relative overflow-hidden ${isLoading ? 'animate-pulse' : ''}`}
      >
        {imageUrl ? (
          <img
            src={optimizeImageUrl(imageUrl)}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            📅
          </div>
        )}
        <EventBadge badgeType={resolveEventBadgeTypeFromDoc(event)} />
      </div>

      <div className="p-3">
        <h3 className={`font-semibold text-base leading-tight ${textColor} line-clamp-2`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="flex gap-1 text-orange-500 font-bold text-sm" aria-hidden>
            {'🔥'.repeat(Math.min(Math.max(popularidad || 1, 1), 3))}
          </span>
          {sector && (
            <span className={`text-xs md:text-sm ${textMuted}`}>{sector}</span>
          )}
          {price != null && (
            <span className={`text-xs md:text-sm font-bold ${isDark ? 'text-[#14b8a6]' : 'text-teal-600'}`}>
              {Number(price) > 0
                ? (Number(price) % 1 === 0 ? `$${Number(price)}` : `$${Number(price).toFixed(2)}`)
                : 'Gratis'}
            </span>
          )}
        </div>
        {dateLine && (
          <p className={`text-xs md:text-sm ${textMuted} mt-0.5`}>{dateLine}</p>
        )}
        {description && (
          <p className={`text-xs md:text-sm ${textMuted} mt-1 line-clamp-2`}>
            {description}
          </p>
        )}
      </div>
    </article>
  )
}

export default EventCard
