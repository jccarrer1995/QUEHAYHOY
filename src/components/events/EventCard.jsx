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
import { Users, Megaphone, Sparkles } from 'lucide-react'

export function EventCard({ event, isDark = false }) {
  const { title, description, capacity_level, capacity, sector, date, price, imageUrl } = event ?? {};
  const capacityKey =
    typeof capacity_level === 'string' ? capacity_level.trim().toUpperCase() : capacity_level;
  const capacityLevelText =
    typeof capacity_level === 'string' && capacity_level.trim() ? capacity_level.trim() : null;

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
      className: 'bg-white text-[#14b8a6] border-[#14b8a6]',
      darkClassName: 'dark:bg-white dark:text-[#14b8a6] dark:border-[#14b8a6]',
    },
    LARGE: {
      label: 'Social',
      emoji: '👥',
      className: 'bg-white text-[#14b8a6] border-[#14b8a6]',
      darkClassName: 'dark:bg-white dark:text-[#14b8a6] dark:border-[#14b8a6]',
    },
    MASSIVE: {
      label: 'Masivo',
      emoji: '🔥',
      className: 'bg-red-100 text-red-800 border-red-300',
      darkClassName: 'dark:bg-red-900/40 dark:text-red-200 dark:border-red-600',
    },
  };

  const getBadgeByCapacity = (level, cap) => {
    const normalizedLevel = typeof level === 'string' ? level.trim().toUpperCase() : level;
    if (normalizedLevel) {
      const v = String(normalizedLevel);
      if (v.includes('SOCIAL') || v.includes('LARGE')) return badgeConfig.SOCIAL;
      if (v.includes('INTIMATE')) return badgeConfig.INTIMATE;
      if (v.includes('EXCLUSIVE')) return badgeConfig.EXCLUSIVE;
      if (v.includes('MASSIVE')) return badgeConfig.MASSIVE;
      return badgeConfig[normalizedLevel] ?? badgeConfig.SOCIAL;
    }
    if (typeof cap === 'number') {
      if (cap < 30) return badgeConfig.INTIMATE;
      if (cap <= 150) return badgeConfig.SOCIAL;
      if (cap <= 400) return badgeConfig.LARGE;
      return badgeConfig.MASSIVE;
    }
    return badgeConfig.SOCIAL;
  };

  const badge = getBadgeByCapacity(capacityKey, capacity);
  const showUsersIcon = typeof capacityKey === 'string' ? capacityKey === 'SOCIAL' : false
  const showMegaphoneIcon =
    typeof capacityKey === 'string' ? capacityKey === 'MASIVO' || capacityKey === 'MASSIVE' : false
  const showSparklesIcon =
    typeof capacityKey === 'string' ? capacityKey === 'EXCLUSIVO' || capacityKey === 'EXCLUSIVE' || capacityKey === 'INTIMATE' : false
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
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
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
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-md border ${badge.className} ${badge.darkClassName} inline-flex items-center gap-1`}
        >
          {showUsersIcon && <Users className="w-4 h-4" aria-hidden="true" />}
          {showMegaphoneIcon && <Megaphone className="w-4 h-4" aria-hidden="true" />}
          {showSparklesIcon && <Sparkles className="w-4 h-4" aria-hidden="true" />}
          {!showUsersIcon && !showMegaphoneIcon && !showSparklesIcon && badge.emoji && (
            <span aria-hidden="true">{badge.emoji}</span>
          )}
          <span>{capacityLevelText ?? badge.label}</span>
          {capacity != null && (
            <span className="opacity-90">({capacity})</span>
          )}
        </span>
      </div>

      <div className="p-3">
        <h3 className={`font-semibold text-base leading-tight ${textColor} line-clamp-2`}>
          {title ?? 'Evento sin título'}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {sector && (
            <span className={`text-xs md:text-sm ${textMuted}`}>{sector}</span>
          )}
          {price != null && (
            <span className={`text-xs md:text-sm font-medium ${isDark ? 'text-[#14b8a6]' : 'text-teal-600'}`}>
              {typeof price === 'number' ? `$${price}` : price}
            </span>
          )}
        </div>
        {date && (
          <p className={`text-xs md:text-sm ${textMuted} mt-0.5`}>{date}</p>
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
