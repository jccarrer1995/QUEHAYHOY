/**
 * EventCardCarousel - Tarjeta tipo mockup: imagen, título, badge aforo, reloj+horario, pin+ubicación, precio
 * Mapeo Firestore: image_url → imageUrl, location → sector
 * Badges: ✨ Exclusivo, 👥 Social, 🔥 Masivo
 * Imágenes optimizadas con w=600&q=80 para carga rápida en desktop
 */
import { optimizeImageUrl } from '../../lib/index.js'
const BADGE_CONFIG = {
  INTIMATE: { label: 'Exclusivo', emoji: '🖼️', style: 'bg-[#14b8a6] text-white' },
  EXCLUSIVE: { label: 'Exclusivo', emoji: '🖼️', style: 'bg-[#14b8a6] text-white' },
  SOCIAL: { label: 'Social', emoji: '👥', style: 'bg-[#14b8a6] text-white' },
  LARGE: { label: 'Social', emoji: '👥', style: 'bg-[#14b8a6] text-white' },
  MASSIVE: { label: 'Masivo', emoji: '🔥', style: 'bg-[#14b8a6] text-white' },
}

function getBadge(level, capacity) {
  if (level) return BADGE_CONFIG[level] ?? BADGE_CONFIG.SOCIAL
  if (typeof capacity === 'number') {
    if (capacity < 30) return BADGE_CONFIG.INTIMATE
    if (capacity <= 150) return BADGE_CONFIG.SOCIAL
    if (capacity <= 400) return BADGE_CONFIG.LARGE
    return BADGE_CONFIG.MASSIVE
  }
  return BADGE_CONFIG.SOCIAL
}

export function EventCardCarousel({ event, isDark = false }) {
  const data = event ?? {}
  const { title, sector, date, price, capacity_level, capacity } = data
  const imageUrl = data.imageUrl ?? data.image_url
  const badge = getBadge(capacity_level, capacity)
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

  return (
    <article
      className={`flex-shrink-0 w-[280px] sm:w-[300px] md:flex-shrink md:w-full rounded-2xl border ${borderCl} ${cardBg} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {imageUrl ? (
          <img src={optimizeImageUrl(imageUrl)} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📅</div>
        )}
        {badge && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-md text-white ${badge.style}`}
          >
            {badge.emoji} {badge.label.toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-4 relative">
        <h3 className={`font-bold text-base uppercase tracking-wide ${textCl} line-clamp-2 pr-14`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-col gap-1 mt-2">
          {date && (
            <p className={`flex items-center gap-2 text-sm ${mutedCl}`}>
              <span>🕐</span>
              {date}
            </p>
          )}
          {location && (
            <p className={`flex items-center gap-2 text-sm ${mutedCl}`}>
              <span>📍</span>
              {location}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <span className="text-lg" aria-hidden>🔥🔥🔥</span>
          <p className={`font-bold text-lg ${accentCl}`}>
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </article>
  )
}

export default EventCardCarousel
