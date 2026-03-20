/**
 * EventCardCarousel - Tarjeta tipo mockup: imagen, título, badge aforo, reloj+horario, pin+ubicación, precio
 * Mapeo Firestore: image_url → imageUrl, location → sector
 * Badges: ✨ Exclusivo, 👥 Social, 🔥 Masivo
 * Imágenes optimizadas con w=600&q=80 para carga rápida en desktop
 */
import { optimizeImageUrl } from '../../lib/index.js'
import { Users, Megaphone, Sparkles } from 'lucide-react'
const BADGE_CONFIG = {
  INTIMATE: { label: 'Exclusivo', emoji: '🖼️', style: 'bg-[#14b8a6] text-white' },
  EXCLUSIVE: { label: 'Exclusivo', emoji: '🖼️', style: 'bg-[#14b8a6] text-white' },
  SOCIAL: { label: 'Social', emoji: '👥', style: 'bg-white text-[#14b8a6]' },
  LARGE: { label: 'Social', emoji: '👥', style: 'bg-white text-[#14b8a6]' },
  MASSIVE: { label: 'Masivo', emoji: '🔥', style: 'bg-[#14b8a6] text-white' },
}

function getBadge(level, capacity) {
  const normalizedLevel =
    typeof level === 'string' ? level.trim().toUpperCase() : level
  if (normalizedLevel) {
    const v = String(normalizedLevel)
    if (v.includes('SOCIAL') || v.includes('LARGE')) return BADGE_CONFIG.SOCIAL
    if (v.includes('INTIMATE')) return BADGE_CONFIG.INTIMATE
    if (v.includes('EXCLUSIVE')) return BADGE_CONFIG.EXCLUSIVE
    if (v.includes('MASSIVE')) return BADGE_CONFIG.MASSIVE
    return BADGE_CONFIG[normalizedLevel] ?? BADGE_CONFIG.SOCIAL
  }
  if (typeof capacity === 'number') {
    if (capacity < 30) return BADGE_CONFIG.INTIMATE
    if (capacity <= 150) return BADGE_CONFIG.SOCIAL
    if (capacity <= 400) return BADGE_CONFIG.LARGE
    return BADGE_CONFIG.MASSIVE
  }
  return BADGE_CONFIG.SOCIAL
}

export function EventCardCarousel({ event, isDark = false, onSelect }) {
  const data = event ?? {}
  const { title, sector, date, price, capacity_level, capacity } = data
  const capacityKey =
    typeof capacity_level === 'string' ? capacity_level.trim().toUpperCase() : capacity_level
  const capacityLevelText =
    typeof capacity_level === 'string' && capacity_level.trim() ? capacity_level.trim() : null
  const imageUrl = data.imageUrl ?? data.image_url
  const badge = getBadge(capacityKey, capacity)
  const textCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const mutedCl = isDark ? 'text-gray-400' : 'text-gray-500'
  const accentCl = 'text-[#14b8a6]'
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-white'
  const borderCl = isDark ? 'border-gray-700' : 'border-gray-200'

  const formatPrice = (p) => {
    if (p === 0 || p == null) return 'Gratis'
    return typeof p === 'number' ? `$${p}` : p
  }

  const location = sector ?? data.location
  const showUsersIcon = typeof capacityKey === 'string' ? capacityKey === 'SOCIAL' : false
  const showMegaphoneIcon =
    typeof capacityKey === 'string' ? capacityKey === 'MASIVO' || capacityKey === 'MASSIVE' : false
  const showSparklesIcon =
    typeof capacityKey === 'string' ? capacityKey === 'EXCLUSIVO' || capacityKey === 'EXCLUSIVE' || capacityKey === 'INTIMATE' : false
  const showEmoji = !showUsersIcon && !showMegaphoneIcon && !showSparklesIcon && badge?.emoji

  return (
    <article
      className={`flex-shrink-0 w-[280px] sm:w-[300px] md:flex-shrink md:w-full rounded-2xl border ${borderCl} ${cardBg} overflow-hidden shadow-sm
        transition-all duration-300 ease-in-out
        md:hover:-translate-y-[5px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        md:hover:border-b-2 md:hover:border-b-[#00C3BB] ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(data?.id)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onSelect) return
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(data?.id)
      }}
    >
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {imageUrl ? (
          <img src={optimizeImageUrl(imageUrl)} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
        )}
        {badge && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-md ${badge.style} inline-flex items-center gap-1`}
          >
            {showUsersIcon && <Users className="w-4 h-4" aria-hidden="true" />}
            {showMegaphoneIcon && <Megaphone className="w-4 h-4" aria-hidden="true" />}
            {showSparklesIcon && <Sparkles className="w-4 h-4" aria-hidden="true" />}
            {showEmoji && <span aria-hidden="true">{badge.emoji}</span>}
            <span>{capacityLevelText ?? badge.label}</span>
          </span>
        )}
      </div>
      <div className="p-3 relative">
        <h3 className={`font-bold text-sm uppercase tracking-wide ${textCl} line-clamp-2 pr-12`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
          {date && (
            <p className={`flex items-center gap-2 text-xs md:text-sm ${mutedCl}`}>
              <span>🕐</span>
              {date}
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
          <span className="text-base" aria-hidden>🔥🔥🔥</span>
          <p className={`font-bold text-base ${accentCl}`}>
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </article>
  )
}

export default EventCardCarousel
