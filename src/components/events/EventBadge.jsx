/**
 * Badge de evento — esquina inferior izquierda de la imagen (relative en el contenedor)
 * Color de fondo por tipo; texto siempre blanco, sin iconos/emojis.
 */
import { BADGE_BG_CLASS, BADGE_TEXT, normalizeBadgeType } from '../../lib/eventBadges.js'

/** Esquina inferior izquierda recta (sin curva); el resto tipo pill */
const BADGE_BASE =
  'inline-flex items-center rounded-bl-none rounded-tl-full rounded-tr-full rounded-br-full px-3 py-1 text-[11px] sm:text-xs font-bold text-white shadow-sm'

/**
 * @param {{ badgeType?: unknown }} props
 */
export function EventBadge({ badgeType }) {
  const key = normalizeBadgeType(badgeType)
  if (!key) return null
  const bg = BADGE_BG_CLASS[key]
  return (
    <span className={`absolute bottom-2 left-2 z-10 ${BADGE_BASE} ${bg}`}>
      {BADGE_TEXT[key]}
    </span>
  )
}

export default EventBadge
