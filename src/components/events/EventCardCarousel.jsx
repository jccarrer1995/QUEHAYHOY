/**
 * EventCardCarousel - Tarjeta tipo mockup: imagen, título, badge aforo, reloj+horario, pin+ubicación, precio
 * Mapeo Firestore: image_url → imageUrl, location → sector
 * Badges: ✨ Exclusivo, 👥 Social, 🔥 Masivo
 */
const BADGE_CONFIG = {
  INTIMATE: { label: 'Exclusivo', emoji: '✨', light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-900/40 text-amber-200' },
  EXCLUSIVE: { label: 'Exclusivo', emoji: '✨', light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-900/40 text-amber-200' },
  SOCIAL: { label: 'Social', emoji: '👥', light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/40 text-blue-200' },
  LARGE: { label: 'Social', emoji: '👥', light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/40 text-blue-200' },
  MASSIVE: { label: 'Masivo', emoji: '🔥', light: 'bg-red-100 text-red-800', dark: 'bg-red-900/40 text-red-200' },
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
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📅</div>
        )}
        {badge && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-md border ${isDark ? badge.dark + ' border-gray-600' : badge.light + ' border-gray-200'}`}
          >
            {badge.emoji} {badge.label}
          </span>
        )}
      </div>
      <div className="p-4 relative">
        <h3 className={`font-semibold text-base ${textCl} line-clamp-2 pr-14`}>
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
        <p className={`absolute bottom-4 right-4 font-bold text-lg ${accentCl}`}>
          {formatPrice(price)}
        </p>
      </div>
    </article>
  )
}

export default EventCardCarousel
