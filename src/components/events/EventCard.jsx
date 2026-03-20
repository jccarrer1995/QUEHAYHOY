/**
 * EventCard - Tarjeta de evento con badges de aforo y soporte Dark Mode
 * QUEHAYHOY - Descubre eventos en Guayaquil
 * Imágenes optimizadas con w=600&q=80 para carga rápida
 *
 * capacity_level:
 * - EXCLUSIVE (INTIMATE): <30 personas ✨ Exclusivo
 * - SOCIAL: 30-150 personas 👥 Social
 * - MASSIVE: >400 personas 🔥 Masivo
 */
import { optimizeImageUrl } from '../../lib/index.js'

export function EventCard({ event, isDark = false }) {
  const { title, description, capacity_level, capacity, sector, date, price, imageUrl } = event ?? {};

  const badgeConfig = {
    INTIMATE: {
      label: 'Exclusivo',
      emoji: '✨',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
      darkClassName: 'dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-600',
    },
    EXCLUSIVE: {
      label: 'Exclusivo',
      emoji: '✨',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
      darkClassName: 'dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-600',
    },
    SOCIAL: {
      label: 'Social',
      emoji: '👥',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      darkClassName: 'dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600',
    },
    LARGE: {
      label: 'Social',
      emoji: '👥',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      darkClassName: 'dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600',
    },
    MASSIVE: {
      label: 'Masivo',
      emoji: '🔥',
      className: 'bg-red-100 text-red-800 border-red-300',
      darkClassName: 'dark:bg-red-900/40 dark:text-red-200 dark:border-red-600',
    },
  };

  const getBadgeByCapacity = (level, cap) => {
    if (level) return badgeConfig[level] ?? badgeConfig.SOCIAL;
    if (typeof cap === 'number') {
      if (cap < 30) return badgeConfig.INTIMATE;
      if (cap <= 150) return badgeConfig.SOCIAL;
      if (cap <= 400) return badgeConfig.LARGE;
      return badgeConfig.MASSIVE;
    }
    return badgeConfig.SOCIAL;
  };

  const badge = getBadgeByCapacity(capacity_level, capacity);
  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white';
  const textColor = isDark ? 'text-[#E0E0E0]' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <article
      className={`rounded-xl border ${borderColor} ${cardBg} overflow-hidden shadow-sm
        transition-all duration-300 ease-in-out
        md:hover:-translate-y-[5px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        md:hover:border-b-2 md:hover:border-b-[#00C3BB]`}
    >
      {/* Imagen */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={optimizeImageUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            📅
          </div>
        )}
        {/* Badge de aforo */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-md border ${badge.className} ${badge.darkClassName}`}
        >
          {badge.emoji} {badge.label}
          {capacity != null && (
            <span className="ml-1 opacity-90">({capacity})</span>
          )}
        </span>
      </div>

      <div className="p-4">
        <h3 className={`font-semibold text-lg ${textColor} line-clamp-2`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {sector && (
            <span className={`text-sm ${textMuted}`}>{sector}</span>
          )}
          {price != null && (
            <span className={`text-sm font-medium ${isDark ? 'text-[#14b8a6]' : 'text-teal-600'}`}>
              {typeof price === 'number' ? `$${price}` : price}
            </span>
          )}
        </div>
        {date && (
          <p className={`text-sm ${textMuted} mt-0.5`}>{date}</p>
        )}
        {description && (
          <p className={`text-sm ${textMuted} mt-2 line-clamp-2`}>
            {description}
          </p>
        )}
      </div>
    </article>
  );
}

export default EventCard;
