/**
 * EventCard - Tarjeta de evento (QUEHAYHOY)
 * Badge: `badgeType` en Firestore → EventBadge (colores por tipo, texto blanco, sin iconos)
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'
import { getEventDetailPath } from '../../lib/slug.js'
import { resolveEventBadgeTypeFromDoc } from '../../lib/eventBadges.js'
import {
  isEventExpired,
  isEventScheduledForToday,
  ORGANIZER_DELETE_LOCKED_MESSAGE,
  ORGANIZER_EDIT_LOCKED_MESSAGE,
} from '../../lib/eventExpiration.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { EventBadge } from './EventBadge.jsx'
import { FavoriteToggleButton } from './FavoriteToggleButton.jsx'
import { OrganizerEventCardActions } from '../organizer/OrganizerEventCardActions.jsx'

/**
 * @param {{
 *   event: Record<string, unknown>
 *   isDark?: boolean
 *   showOrganizerActions?: boolean
 *   onEditEvent?: (event: Record<string, unknown>) => void
 *   onDeleteEvent?: (event: Record<string, unknown>) => void
 *   deleteActionDisabled?: boolean
 *   hideFavoriteButton?: boolean
 *   showExpiredState?: boolean
 * }} props
 */
export function EventCard({
  event,
  isDark = false,
  showOrganizerActions = false,
  onEditEvent,
  onDeleteEvent,
  deleteActionDisabled = false,
  hideFavoriteButton = false,
  showExpiredState = false,
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  const detailPath = getEventDetailPath(event)
  const imageSrc = imageUrl ?? event?.image_url ?? null
  const imageRef = useRef(null)

  function goToDetail() {
    if (!detailPath) return
    navigate(detailPath)
  }
  const isRecurring =
    eventTypeField === 'recurring' || event?.eventType === 'recurring'
  const dateLine =
    isRecurring && recurrence_day != null && !Number.isNaN(Number(recurrence_day))
      ? formatRecurrenceLabel(recurrence_day)
      : date

  const [isLoading, setIsLoading] = useState(!!imageSrc)
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setIsLoading(!!imageSrc)
    setHasImageError(false)
  }, [imageSrc])

  useEffect(() => {
    if (!imageSrc || hasImageError) return
    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoading(false)
    }
  }, [imageSrc, hasImageError])

  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'
  const expired =
    showExpiredState &&
    isEventExpired(
      /** @type {{ type?: string, endDateMs?: number | null, dateMs?: number | null, activeUntilMs?: number | null }} */ (
        event
      )
    )
  const canOpenDetail = Boolean(detailPath) && !expired
  const ownerUid = typeof event?.createdByUid === 'string' ? event.createdByUid : null
  const ownedByUser =
    !ownerUid || (typeof user?.uid === 'string' && ownerUid === user.uid)
  const lockedOnEventDay =
    showOrganizerActions && ownedByUser && isEventScheduledForToday(event)

  return (
    <article
      className={`rounded-xl border ${borderColor} ${cardBg} overflow-hidden shadow-sm
        transition-all duration-300 ease-in-out
        ${canOpenDetail ? 'md:hover:-translate-y-[5px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:hover:border-b-2 md:hover:border-b-[#00C3BB] cursor-pointer' : ''}
        ${expired ? 'cursor-default opacity-[0.88] grayscale-[0.35]' : ''}`}
      onClick={canOpenDetail ? goToDetail : undefined}
      role={canOpenDetail ? 'button' : expired ? 'group' : undefined}
      tabIndex={canOpenDetail ? 0 : undefined}
      aria-disabled={expired ? true : undefined}
      aria-label={
        expired
          ? `${title ?? 'Evento'} — expirado, solo consulta en historial`
          : undefined
      }
      onKeyDown={
        canOpenDetail
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') goToDetail()
            }
          : undefined
      }
    >
      <div
        className={`aspect-[16/9] bg-gray-200 dark:bg-gray-800 relative overflow-hidden ${isLoading ? 'animate-pulse' : ''}`}
      >
        {showOrganizerActions ? (
          <OrganizerEventCardActions
            onEdit={() => onEditEvent?.(event)}
            onDelete={() => onDeleteEvent?.(event)}
            editDisabled={lockedOnEventDay}
            deleteDisabled={deleteActionDisabled || lockedOnEventDay}
            editDisabledMessage={ORGANIZER_EDIT_LOCKED_MESSAGE}
            deleteDisabledMessage={ORGANIZER_DELETE_LOCKED_MESSAGE}
          />
        ) : hideFavoriteButton ? null : (
          <FavoriteToggleButton eventId={id} />
        )}
        {expired ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-black/35"
              aria-hidden
            />
            <span
              className={`absolute left-3 top-3 z-20 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${
                isDark ? 'bg-red-950/90 text-red-200' : 'bg-red-600 text-white'
              }`}
            >
              Expirado
            </span>
          </>
        ) : null}
        {imageSrc && !hasImageError ? (
          <img
            ref={imageRef}
            src={optimizeImageUrl(imageSrc)}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasImageError(true)
            }}
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
