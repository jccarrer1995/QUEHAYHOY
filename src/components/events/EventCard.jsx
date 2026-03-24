/**
 * EventCard - Tarjeta de evento con badge conceptual y soporte Dark Mode
 * QUEHAYHOY - Descubre eventos en Guayaquil
 * Badge: MASIVO (cian), FERIA (amarillo), PROMO (rojo), SOCIAL (morado)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'

const BADGE_STYLES = {
  MASIVO: { className: 'bg-cyan-500/30 text-cyan-700 border-cyan-500/50', darkClassName: 'dark:bg-cyan-500/25 dark:text-cyan-300 dark:border-cyan-400/50' },
  FERIA: { className: 'bg-amber-500/30 text-amber-800 border-amber-500/50', darkClassName: 'dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/50' },
  PROMO: { className: 'bg-red-500/30 text-red-700 border-red-500/50', darkClassName: 'dark:bg-red-500/25 dark:text-red-300 dark:border-red-400/50' },
  SOCIAL: { className: 'bg-purple-500/30 text-purple-700 border-purple-500/50', darkClassName: 'dark:bg-purple-500/25 dark:text-purple-300 dark:border-purple-400/50' },
}

function getBadgeStyle(badgeLabel) {
  const key = typeof badgeLabel === 'string' ? badgeLabel.trim().toUpperCase() : ''
  if (key === 'MASIVO' || key === 'FERIA' || key === 'PROMO' || key === 'SOCIAL') return BADGE_STYLES[key]
  return BADGE_STYLES.SOCIAL
}

export function EventCard({ event, isDark = false }) {
  const navigate = useNavigate()
  const {
    id,
    title,
    description,
    capacity,
    sector,
    date,
    price,
    imageUrl,
    popularidad,
    badgeLabel,
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
  const displayLabel = (badgeLabel || event?.capacity_level || 'SOCIAL').toString().trim().toUpperCase()
  const badgeStyle = getBadgeStyle(badgeLabel || event?.capacity_level || 'SOCIAL')
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoading(!!imageUrl)
    })
  }, [imageUrl])

  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white';
  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

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
      {/* Imagen - aspect-ratio fijo evita Layout Shift */}
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
        {/* Badge conceptual */}
        {displayLabel && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md border ${badgeStyle.className} ${badgeStyle.darkClassName}`}
          >
            {displayLabel}
          </span>
        )}
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
  );
}

export default EventCard;
